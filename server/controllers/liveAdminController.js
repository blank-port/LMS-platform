import moment from 'moment';
import Cohort from '../models/Cohort.js';
import Department from '../models/Department.js';
import Institute from '../models/Institute.js';
import LiveSession from '../models/LiveSession.js';
import Setting from '../models/Setting.js';
import {
    createAdminNotification,
    createBatchNotifications
} from '../services/notificationService.js';
import { isLiveKitConfigured } from '../services/livekitService.js';
import responseHelper from '../utils/responseHelper.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

const LIVE_SETTING_DEFAULTS = {
    live_default_duration: 60,
    live_fallback_policy: 'allow_external_fallback',
    live_attendance_policy: 'mark_on_join',
    live_reminders_enabled: 'Yes',
    live_reminder_minutes: 15
};

const getLiveSettings = async () => {
    const keys = Object.keys(LIVE_SETTING_DEFAULTS);
    const rows = await Setting.find({ key: { $in: keys } });
    const settings = { ...LIVE_SETTING_DEFAULTS };

    rows.forEach((row) => {
        settings[row.key] = row.value;
    });

    return settings;
};

const normalizeProvider = (session) => {
    if (session.provider) return session.provider;
    if (session.roomName) return 'livekit';
    if (session.meetingLink) return 'external';
    return 'livekit';
};

const normalizeSession = (session) => {
    const item = typeof session.toObject === 'function' ? session.toObject() : session;
    const provider = normalizeProvider(item);
    const start = new Date(item.startTime);
    const end = new Date(start.getTime() + (Number(item.duration || 60) * 60000));
    const now = new Date();
    const lifecycleState =
        item.sessionStatus === 'cancelled'
            ? 'cancelled'
            : item.sessionStatus === 'ended' || now > end
                ? 'past'
                : now >= start && now <= end
                    ? 'live'
                    : 'upcoming';

    const enrolledCount = item.cohortId?.students?.length || 0;
    const attendanceCount = item.attendance?.length || 0;

    return {
        ...item,
        provider,
        lifecycleState,
        expectedParticipants: enrolledCount,
        presentParticipants: attendanceCount,
        absentParticipants: Math.max(enrolledCount - attendanceCount, 0),
        participationRate: enrolledCount > 0 ? Math.round((attendanceCount / enrolledCount) * 100) : 0,
        healthSignals: {
            noShow: item.sessionStatus === 'ended' && attendanceCount === 0,
            missingRecording: item.sessionStatus === 'ended' && !item.recordingUrl,
            missingFallback: provider === 'external' && !item.meetingLink
        }
    };
};

const buildActivityEntry = (actor, action, note = '') => ({
    actorId: actor?._id || null,
    actorName: actor?.name || 'System',
    actorRole: actor?.role || 'system',
    action,
    note,
    createdAt: new Date()
});

const loadSessions = async () => {
    return LiveSession.find({})
        .populate({
            path: 'cohortId',
            select: 'cohortName students courseId instructorId',
            populate: [
                { path: 'courseId', select: 'courseTitle' },
                { path: 'students', select: 'name email avatar' },
                {
                    path: 'instructorId',
                    select: 'name email institute department',
                    populate: [
                        { path: 'institute', select: 'name' },
                        { path: 'department', select: 'name' }
                    ]
                }
            ]
        })
        .populate('attendance.studentId', 'name email avatar')
        .sort({ startTime: 1 });
};

const filterSessions = (sessions, query) => {
    const {
        status,
        provider,
        instructor,
        cohort,
        course,
        institute,
        department,
        search,
        health
    } = query;

    return sessions.filter((session) => {
        if (status && status !== 'all' && session.lifecycleState !== status && session.sessionStatus !== status) {
            return false;
        }
        if (provider && provider !== 'all' && session.provider !== provider) {
            return false;
        }
        if (instructor && instructor !== 'all' && session.cohortId?.instructorId?._id?.toString() !== instructor) {
            return false;
        }
        if (cohort && cohort !== 'all' && session.cohortId?._id?.toString() !== cohort) {
            return false;
        }
        if (course && course !== 'all' && session.cohortId?.courseId?._id?.toString() !== course) {
            return false;
        }
        if (institute && institute !== 'all' && session.cohortId?.instructorId?.institute?._id?.toString() !== institute) {
            return false;
        }
        if (department && department !== 'all' && session.cohortId?.instructorId?.department?._id?.toString() !== department) {
            return false;
        }
        if (search) {
            const haystack = [
                session.title,
                session.cohortId?.cohortName,
                session.cohortId?.courseId?.courseTitle,
                session.cohortId?.instructorId?.name
            ].filter(Boolean).join(' ').toLowerCase();
            if (!haystack.includes(search.toLowerCase())) {
                return false;
            }
        }
        if (health === 'missing-recording' && !session.healthSignals.missingRecording) {
            return false;
        }
        if (health === 'no-show' && !session.healthSignals.noShow) {
            return false;
        }
        if (health === 'missing-fallback' && !session.healthSignals.missingFallback) {
            return false;
        }
        return true;
    });
};

const buildAnalytics = (sessions) => {
    const totals = sessions.reduce((acc, session) => {
        acc.totalSessions += 1;
        acc.expectedParticipants += session.expectedParticipants;
        acc.presentParticipants += session.presentParticipants;
        if (session.lifecycleState === 'live') acc.liveNow += 1;
        if (session.lifecycleState === 'upcoming') acc.upcoming += 1;
        if (session.lifecycleState === 'past') acc.past += 1;
        if (session.sessionStatus === 'cancelled') acc.cancelled += 1;
        if (session.healthSignals.noShow) acc.noShows += 1;
        if (session.healthSignals.missingRecording) acc.missingRecordings += 1;
        return acc;
    }, {
        totalSessions: 0,
        liveNow: 0,
        upcoming: 0,
        past: 0,
        cancelled: 0,
        noShows: 0,
        missingRecordings: 0,
        expectedParticipants: 0,
        presentParticipants: 0
    });

    const byInstructor = new Map();
    const byCohort = new Map();

    sessions.forEach((session) => {
        const instructor = session.cohortId?.instructorId;
        const cohort = session.cohortId;

        if (instructor?._id) {
            const current = byInstructor.get(instructor._id.toString()) || {
                id: instructor._id,
                name: instructor.name,
                sessions: 0,
                liveSessions: 0,
                participants: 0
            };
            current.sessions += 1;
            current.participants += session.presentParticipants;
            if (session.lifecycleState === 'live') current.liveSessions += 1;
            byInstructor.set(instructor._id.toString(), current);
        }

        if (cohort?._id) {
            const current = byCohort.get(cohort._id.toString()) || {
                id: cohort._id,
                cohortName: cohort.cohortName,
                sessions: 0,
                participationRateSum: 0
            };
            current.sessions += 1;
            current.participationRateSum += session.participationRate;
            byCohort.set(cohort._id.toString(), current);
        }
    });

    return {
        ...totals,
        attendanceRate: totals.expectedParticipants > 0
            ? Math.round((totals.presentParticipants / totals.expectedParticipants) * 100)
            : 0,
        topInstructors: Array.from(byInstructor.values())
            .sort((a, b) => b.participants - a.participants)
            .slice(0, 5),
        topCohorts: Array.from(byCohort.values())
            .map((cohort) => ({
                ...cohort,
                avgParticipationRate: cohort.sessions > 0 ? Math.round(cohort.participationRateSum / cohort.sessions) : 0
            }))
            .sort((a, b) => b.avgParticipationRate - a.avgParticipationRate)
            .slice(0, 5)
    };
};

const buildReminderTargets = (sessions, reminderMinutes) => {
    const now = new Date();
    const reminderWindow = Number(reminderMinutes || 15);

    return sessions.filter((session) => {
        if (session.sessionStatus !== 'scheduled') return false;
        const diffMinutes = (new Date(session.startTime).getTime() - now.getTime()) / 60000;
        const minutesSinceLastReminder = session.lastReminderSentAt
            ? (now.getTime() - new Date(session.lastReminderSentAt).getTime()) / 60000
            : Number.POSITIVE_INFINITY;
        return diffMinutes >= 0 && diffMinutes <= reminderWindow && minutesSinceLastReminder > reminderWindow;
    });
};

const sendSessionReminder = async (session, actor, reminderType = 'scheduled') => {
    const studentIds = session.cohortId?.students?.map((student) => student._id || student) || [];
    if (!studentIds.length) return 0;

    await createBatchNotifications(studentIds, {
        type: 'SESSION_SCHEDULED',
        title: reminderType === 'recording' ? 'Recording Ready' : 'Live Session Reminder',
        message:
            reminderType === 'recording'
                ? `The recording for "${session.title}" is now available.`
                : `Your live session "${session.title}" begins at ${moment(session.startTime).format('LT')} in ${session.cohortId?.cohortName || 'your cohort'}.`,
        module: 'academic',
        referenceId: session._id,
        actionUrl: `/student/cohort/${session.cohortId?._id || session.cohortId}`
    });

    session.reminderHistory = session.reminderHistory || [];
    session.reminderHistory.push({
        sentAt: new Date(),
        reminderType,
        recipientCount: studentIds.length,
        triggeredBy: actor?._id || null
    });
    session.lastReminderSentAt = new Date();
    session.activityLog = session.activityLog || [];
    session.activityLog.push(buildActivityEntry(actor, 'SESSION_REMINDER_SENT', `${reminderType} reminder sent to ${studentIds.length} students`));
    await session.save();

    return studentIds.length;
};

export const getAdminLiveOverview = asyncHandler(async (req, res) => {
    const [rawSessions, institutes, departments, settings] = await Promise.all([
        loadSessions(),
        Institute.find({}).select('name'),
        Department.find({}).select('name institute'),
        getLiveSettings()
    ]);

    const sessions = rawSessions.map(normalizeSession);
    const filteredSessions = filterSessions(sessions, req.query);
    const analytics = buildAnalytics(filteredSessions);
    const dueReminders = buildReminderTargets(filteredSessions, settings.live_reminder_minutes).length;

    const filterOptions = {
        instructors: Array.from(new Map(
            sessions
                .filter((session) => session.cohortId?.instructorId?._id)
                .map((session) => [
                    session.cohortId.instructorId._id.toString(),
                    {
                        _id: session.cohortId.instructorId._id,
                        name: session.cohortId.instructorId.name
                    }
                ])
        ).values()),
        cohorts: Array.from(new Map(
            sessions
                .filter((session) => session.cohortId?._id)
                .map((session) => [
                    session.cohortId._id.toString(),
                    {
                        _id: session.cohortId._id,
                        cohortName: session.cohortId.cohortName
                    }
                ])
        ).values()),
        courses: Array.from(new Map(
            sessions
                .filter((session) => session.cohortId?.courseId?._id)
                .map((session) => [
                    session.cohortId.courseId._id.toString(),
                    {
                        _id: session.cohortId.courseId._id,
                        courseTitle: session.cohortId.courseId.courseTitle
                    }
                ])
        ).values()),
        institutes,
        departments
    };

    return responseHelper.success(res, {
        analytics,
        sessions: filteredSessions,
        filterOptions,
        settings,
        configuration: {
            livekitConfigured: await isLiveKitConfigured(),
            dueReminders
        }
    }, 'Admin live operations synchronized');
});

export const getAdminLiveSessionDetail = asyncHandler(async (req, res, next) => {
    const rawSessions = await loadSessions();
    const session = rawSessions.find((item) => item._id.toString() === req.params.sessionId);

    if (!session) {
        return next(new AppError('Synchronized session artifact not found', 404));
    }

    const normalized = normalizeSession(session);
    return responseHelper.success(res, { session: normalized }, 'Live session detail synchronized');
});

export const updateAdminLiveSession = asyncHandler(async (req, res, next) => {
    const session = await LiveSession.findById(req.params.sessionId);
    if (!session) {
        return next(new AppError('Synchronized session artifact not found', 404));
    }

    const updates = { ...req.body };
    if (updates.provider === 'external' && !updates.meetingLink && !session.meetingLink) {
        return next(new AppError('External live sessions require a meeting link', 400));
    }
    if (updates.provider === 'livekit' && !updates.roomName) {
        updates.roomName = session.roomName || `session-${session._id}`;
    }

    Object.assign(session, updates);
    session.activityLog = session.activityLog || [];
    session.activityLog.push(buildActivityEntry(req.user, 'ADMIN_SESSION_UPDATED', 'Admin updated live session governance settings'));
    await session.save();

    const cohort = await Cohort.findById(session.cohortId).select('students cohortName');
    if (cohort?.students?.length) {
        await createBatchNotifications(cohort.students, {
            type: 'SESSION_SCHEDULED',
            title: 'Session Updated',
            message: `The session "${session.title}" has been updated by PrismEd administration.`,
            module: 'academic',
            referenceId: session._id,
            actionUrl: `/student/cohort/${session.cohortId}`
        });
    }

    return responseHelper.success(res, { session: normalizeSession(await loadSessions().then((rows) => rows.find((row) => row._id.toString() === session._id.toString()))) }, 'Admin live session updated');
});

export const cancelAdminLiveSession = asyncHandler(async (req, res, next) => {
    const session = await LiveSession.findById(req.params.sessionId);
    if (!session) {
        return next(new AppError('Synchronized session artifact not found', 404));
    }

    session.sessionStatus = 'cancelled';
    session.activityLog = session.activityLog || [];
    session.activityLog.push(buildActivityEntry(req.user, 'ADMIN_SESSION_CANCELLED', 'Admin cancelled live session'));
    await session.save();

    const cohort = await Cohort.findById(session.cohortId).select('students cohortName');
    if (cohort?.students?.length) {
        await createBatchNotifications(cohort.students, {
            type: 'SESSION_SCHEDULED',
            title: 'Session Cancelled',
            message: `The live session "${session.title}" has been cancelled by PrismEd administration.`,
            module: 'academic',
            referenceId: session._id,
            actionUrl: `/student/cohort/${session.cohortId}`
        });
    }

    await createAdminNotification({
        type: 'SESSION_SCHEDULED',
        title: 'Admin Cancelled Live Session',
        message: `${req.user.name} cancelled "${session.title}".`,
        module: 'academic',
        referenceId: session._id,
        actionUrl: '/admin/live-classes'
    });

    return responseHelper.success(res, { session: normalizeSession(await loadSessions().then((rows) => rows.find((row) => row._id.toString() === session._id.toString()))) }, 'Admin live session cancelled');
});

export const sendAdminLiveReminder = asyncHandler(async (req, res, next) => {
    const rawSessions = await loadSessions();
    const session = rawSessions.find((item) => item._id.toString() === req.params.sessionId);
    if (!session) {
        return next(new AppError('Synchronized session artifact not found', 404));
    }

    const recipientCount = await sendSessionReminder(session, req.user, req.body.reminderType || 'scheduled');
    return responseHelper.success(res, { recipientCount }, 'Live reminder dispatched successfully');
});

export const dispatchDueLiveReminders = asyncHandler(async (req, res) => {
    const settings = await getLiveSettings();
    if (String(settings.live_reminders_enabled).toLowerCase() !== 'yes') {
        return responseHelper.success(res, {
            remindersSent: 0,
            recipientsNotified: 0
        }, 'Live reminders are currently disabled by policy');
    }

    const rawSessions = await loadSessions();
    const sessions = rawSessions.map(normalizeSession);
    const dueSessions = buildReminderTargets(sessions, settings.live_reminder_minutes);

    let remindersSent = 0;
    let recipientsNotified = 0;

    for (const dueSession of dueSessions) {
        const sourceSession = rawSessions.find((row) => row._id.toString() === dueSession._id.toString());
        const count = await sendSessionReminder(sourceSession, req.user, 'scheduled');
        if (count > 0) {
            remindersSent += 1;
            recipientsNotified += count;
        }
    }

    return responseHelper.success(res, {
        remindersSent,
        recipientsNotified
    }, 'Due live reminders processed');
});
