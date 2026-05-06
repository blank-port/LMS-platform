import moment from 'moment';
import Cohort from '../models/Cohort.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import LiveSession from '../models/LiveSession.js';
import {
    createAdminNotification,
    createBatchNotifications
} from '../services/notificationService.js';
import {
    createLiveKitToken,
    getLiveKitPublicConfig,
    isLiveKitConfigured
} from '../services/livekitService.js';
import responseHelper from '../utils/responseHelper.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

const resolveSessionProvider = (session) => {
    if (session.provider) return session.provider;
    if (session.roomName) return 'livekit';
    if (session.meetingLink) return 'external';
    return 'livekit';
};

const ensureRoomName = (session, provider) => {
    if (provider !== 'livekit') return '';
    return session.roomName || `session-${session._id}`;
};

const buildActivityEntry = (actor, action, note = '') => ({
    actorId: actor?._id || null,
    actorName: actor?.name || 'System',
    actorRole: actor?.role || 'system',
    action,
    note
});

const appendSessionActivity = (session, actor, action, note = '') => {
    session.activityLog = session.activityLog || [];
    session.activityLog.push(buildActivityEntry(actor, action, note));
};

const normalizeSessionForResponse = (session) => {
    const sessionObject = typeof session.toObject === 'function' ? session.toObject() : session;
    const provider = resolveSessionProvider(sessionObject);
    const start = new Date(sessionObject.startTime);
    const end = new Date(start.getTime() + (Number(sessionObject.duration || 60) * 60000));
    const now = new Date();
    const lifecycleState =
        sessionObject.sessionStatus === 'cancelled'
            ? 'cancelled'
            : sessionObject.sessionStatus === 'ended' || now > end
                ? 'past'
                : now >= start && now <= end
                    ? 'live'
                    : 'upcoming';

    return {
        ...sessionObject,
        provider,
        roomName: ensureRoomName(sessionObject, provider),
        lifecycleState,
        hasRecording: Boolean(sessionObject.recordingUrl),
        fallbackReady: Boolean(sessionObject.meetingLink),
        startTimeLabel: moment(sessionObject.startTime).format('lll')
    };
};

const notifyCohortStudents = async (cohort, payload) => {
    if (cohort?.students?.length) {
        await createBatchNotifications(cohort.students, payload);
    }
};

const assertInstructorOwnsCohort = async (cohortId, actor) => {
    const cohort = await Cohort.findById(cohortId)
        .populate('courseId', 'courseTitle')
        .populate('students', '_id');

    if (!cohort) {
        throw new AppError('Institutional batch not found', 404);
    }

    if (actor.role !== 'admin' && cohort.instructorId?.toString() !== actor._id.toString()) {
        throw new AppError('Not authorized for this educational batch', 403);
    }

    return cohort;
};

const assertCanAccessCohort = async (cohortId, actor) => {
    const cohort = await Cohort.findById(cohortId)
        .populate('courseId', 'courseTitle courseThumbnail')
        .populate('instructorId', 'name institute department')
        .populate('students', '_id');

    if (!cohort) {
        throw new AppError('Institutional batch not found', 404);
    }

    const isOwner = cohort.instructorId?._id?.toString() === actor._id.toString();
    const isMember = cohort.students?.some((student) => student._id.toString() === actor._id.toString());

    if (actor.role !== 'admin' && !isOwner && !isMember) {
        throw new AppError('You are not authorized to access this educational batch', 403);
    }

    return cohort;
};

const assertInstructorOwnsSession = async (sessionId, actor) => {
    const session = await LiveSession.findById(sessionId).populate('cohortId', 'instructorId students courseId cohortName');
    if (!session) {
        throw new AppError('Synchronized session artifact not found', 404);
    }

    if (actor.role !== 'admin' && session.cohortId?.instructorId?.toString() !== actor._id.toString()) {
        throw new AppError('Not authorized for this live session', 403);
    }

    return session;
};

export const createCohort = asyncHandler(async (req, res) => {
    const { courseId, cohortName, startDate, endDate, batchImage } = req.body;
    const instructorId = req.user._id;

    const cohort = await Cohort.create({
        courseId,
        instructorId,
        cohortName,
        startDate,
        endDate,
        batchImage
    });

    return responseHelper.success(res, { cohort }, 'Educational batch provisioned successfully', 201);
});

export const updateCohort = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    await assertInstructorOwnsCohort(id, req.user);
    const cohort = await Cohort.findByIdAndUpdate(id, updates, { new: true }).populate('courseId', 'courseTitle');

    return responseHelper.success(res, { cohort }, 'Batch matrix updated');
});

export const deleteCohort = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await assertInstructorOwnsCohort(id, req.user);

    await LiveSession.deleteMany({ cohortId: id });
    await Cohort.findByIdAndDelete(id);

    return responseHelper.success(res, {}, 'Batch matrix decommissioned');
});

export const getInstructorCohorts = asyncHandler(async (req, res) => {
    const cohorts =
        req.user.role === 'admin'
            ? await Cohort.find({}).populate('courseId', 'courseTitle').sort({ createdAt: -1 })
            : await Cohort.find({ instructorId: req.user._id }).populate('courseId', 'courseTitle').sort({ createdAt: -1 });

    return responseHelper.success(res, { cohorts }, 'Instructor batches synchronized');
});

export const scheduleLiveSession = asyncHandler(async (req, res, next) => {
    const {
        cohortId,
        title,
        description,
        startTime,
        duration,
        meetingLink,
        recordingUrl,
        provider = 'livekit'
    } = req.body;

    const cohort = await assertInstructorOwnsCohort(cohortId, req.user);

    if (provider === 'external' && !meetingLink) {
        return next(new AppError('External live sessions require a meeting link', 400));
    }

    const session = await LiveSession.create({
        cohortId,
        title,
        description,
        startTime,
        duration,
        meetingLink,
        recordingUrl,
        provider,
        activityLog: [buildActivityEntry(req.user, 'SESSION_CREATED', `Scheduled for ${moment(startTime).format('LLL')}`)]
    });

    if (provider === 'livekit' && !session.roomName) {
        session.roomName = `session-${session._id}`;
        await session.save();
    }

    await notifyCohortStudents(cohort, {
        type: 'SESSION_SCHEDULED',
        title: 'New Live Session Scheduled',
        message: `A new session "${title}" is scheduled for ${moment(startTime).format('LLL')} in batch ${cohort.cohortName}.`,
        module: 'academic',
        referenceId: session._id,
        actionUrl: `/student/cohort/${cohortId}`
    });

    await createAdminNotification({
        type: 'SESSION_SCHEDULED',
        title: 'Live Session Scheduled',
        message: `${req.user.name} scheduled "${title}" for ${moment(startTime).format('LLL')}.`,
        module: 'academic',
        referenceId: session._id,
        actionUrl: '/admin/live-classes'
    });

    return responseHelper.success(res, { session: normalizeSessionForResponse(session) }, 'Live session broadcast scheduled', 201);
});

export const updateLiveSession = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updates = { ...req.body };
    const session = await assertInstructorOwnsSession(id, req.user);

    if (updates.provider === 'livekit' && !updates.roomName) {
        updates.roomName = `session-${id}`;
    }

    if (updates.provider === 'external' && !updates.meetingLink && !session.meetingLink) {
        return next(new AppError('External live sessions require a meeting link', 400));
    }

    const previousStatus = session.sessionStatus;
    const previousStartTime = session.startTime;
    const previousRecording = session.recordingUrl;

    Object.assign(session, updates);
    appendSessionActivity(session, req.user, 'SESSION_UPDATED', 'Live session configuration updated');
    await session.save();

    const cohort = await Cohort.findById(session.cohortId).select('students cohortName');
    let title = 'Session Updated';
    let message = `The session "${session.title}" in batch ${cohort?.cohortName || 'your cohort'} has been updated.`;

    if (updates.sessionStatus === 'live' && previousStatus !== 'live') {
        title = 'Session is Now Live';
        message = `Join the live broadcast for "${session.title}" now.`;
    } else if (updates.sessionStatus === 'cancelled' && previousStatus !== 'cancelled') {
        title = 'Session Cancelled';
        message = `The live session "${session.title}" has been cancelled.`;
    } else if (updates.startTime && new Date(previousStartTime).getTime() !== new Date(updates.startTime).getTime()) {
        title = 'Session Rescheduled';
        message = `"${session.title}" has been rescheduled to ${moment(session.startTime).format('LLL')}.`;
    } else if (updates.recordingUrl && updates.recordingUrl !== previousRecording) {
        title = 'Recording Available';
        message = `The recording for "${session.title}" is now available for replay.`;
    }

    await notifyCohortStudents(cohort, {
        type: 'SESSION_SCHEDULED',
        title,
        message,
        module: 'academic',
        referenceId: session._id,
        actionUrl: `/student/cohort/${session.cohortId}`
    });

    await createAdminNotification({
        type: 'SESSION_SCHEDULED',
        title: 'Live Session Updated',
        message: `${req.user.name} updated "${session.title}" (${session.sessionStatus}).`,
        module: 'academic',
        referenceId: session._id,
        actionUrl: '/admin/live-classes'
    });

    return responseHelper.success(res, { session: normalizeSessionForResponse(session) }, 'Live session registry updated');
});

export const cancelLiveSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await assertInstructorOwnsSession(id, req.user);

    session.sessionStatus = 'cancelled';
    appendSessionActivity(session, req.user, 'SESSION_CANCELLED', 'Session cancelled by educator control');
    await session.save();

    const cohort = await Cohort.findById(session.cohortId).select('students cohortName');
    await notifyCohortStudents(cohort, {
        type: 'SESSION_SCHEDULED',
        title: 'Session Cancelled',
        message: `The live session "${session.title}" in batch ${cohort?.cohortName || 'your cohort'} has been cancelled.`,
        module: 'academic',
        referenceId: session._id,
        actionUrl: `/student/cohort/${session.cohortId}`
    });

    await createAdminNotification({
        type: 'SESSION_SCHEDULED',
        title: 'Live Session Cancelled',
        message: `${req.user.name} cancelled "${session.title}".`,
        module: 'academic',
        referenceId: session._id,
        actionUrl: '/admin/live-classes'
    });

    return responseHelper.success(res, { session: normalizeSessionForResponse(session) }, 'Broadcast transmission cancelled');
});

export const getSessionInsights = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = await assertInstructorOwnsSession(sessionId, req.user);
    await session.populate('attendance.studentId', 'name');

    const totalStudents = await Cohort.findById(session.cohortId).select('students');
    const totalCount = totalStudents?.students?.length || 0;
    const presenceCount = session.attendance.length;
    const provider = resolveSessionProvider(session);

    const insights = {
        participationRate: totalCount > 0 ? (presenceCount / totalCount) * 100 : 0,
        markedCount: presenceCount,
        totalCount,
        isRecorded: !!session.recordingUrl,
        provider,
        roomName: ensureRoomName(session, provider),
        hasFallbackLink: Boolean(session.meetingLink)
    };

    return responseHelper.success(res, { insights }, 'Session intelligence decrypted');
});

export const getCohortSessions = asyncHandler(async (req, res) => {
    const { cohortId } = req.params;
    await assertCanAccessCohort(cohortId, req.user);

    const sessions = await LiveSession.find({ cohortId }).sort({ startTime: 1 });
    return responseHelper.success(res, { sessions: sessions.map(normalizeSessionForResponse) }, 'Synchronized session registry updated');
});

export const getCohortInfo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cohort = await assertCanAccessCohort(id, req.user);

    return responseHelper.success(res, { cohort }, 'Batch metadata synchronized');
});

export const getInstructorSessions = asyncHandler(async (req, res) => {
    const cohorts =
        req.user.role === 'admin'
            ? await Cohort.find({}).select('_id')
            : await Cohort.find({ instructorId: req.user._id }).select('_id');

    const cohortIds = cohorts.map((cohort) => cohort._id);
    const sessions = await LiveSession.find({ cohortId: { $in: cohortIds } })
        .populate({
            path: 'cohortId',
            populate: { path: 'courseId', select: 'courseTitle' }
        })
        .sort({ startTime: 1 });

    return responseHelper.success(res, { sessions: sessions.map(normalizeSessionForResponse) }, 'Instructor broadcast matrix synchronized');
});

export const getCourseStudents = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;

    if (req.user.role !== 'admin') {
        const course = await Course.findById(courseId).select('instructor');
        if (!course) {
            return next(new AppError('Curriculum component not found', 404));
        }
        if (course.instructor?.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized to access this course roster', 403));
        }
    }

    const enrollments = await Enrollment.find({ courseId }).populate('userId', 'name email');
    const students = enrollments.map((enrollment) => enrollment.userId);
    return responseHelper.success(res, { students }, 'Course candidate scholars retrieved');
});

export const enrollToCohort = asyncHandler(async (req, res) => {
    const { cohortId, studentId } = req.body;
    const cohort = await assertInstructorOwnsCohort(cohortId, req.user);

    if (!cohort.students.some((student) => student._id?.toString() === studentId || student.toString?.() === studentId)) {
        cohort.students.push(studentId);
        await cohort.save();
    }

    return responseHelper.success(res, { cohort }, 'Student successfully assigned to batch');
});

export const removeStudentFromCohort = asyncHandler(async (req, res) => {
    const { cohortId, studentId } = req.body;
    const cohort = await assertInstructorOwnsCohort(cohortId, req.user);

    cohort.students = cohort.students.filter((student) => student.toString() !== studentId);
    await cohort.save();

    return responseHelper.success(res, { cohort }, 'Student removed from batch assignment');
});

export const getStudentCohorts = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const cohorts = await Cohort.find({ students: studentId })
        .populate('courseId', 'courseTitle courseThumbnail')
        .populate('instructorId', 'name');

    return responseHelper.success(res, { cohorts }, 'Student batch matrix synchronized');
});

export const markAttendance = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.params;
    const studentId = req.user._id;

    if (req.user.role !== 'student') {
        return next(new AppError('Only student participants can mark attendance', 403));
    }

    const session = await LiveSession.findById(sessionId).populate('cohortId', 'students');
    if (!session) {
        return next(new AppError('Synchronized session artifact not found', 404));
    }

    const isAuthorizedStudent = session.cohortId?.students?.some(
        (cohortStudentId) => cohortStudentId.toString() === studentId.toString()
    );
    if (!isAuthorizedStudent) {
        return next(new AppError('You are not authorized to mark attendance for this session', 403));
    }

    if (!['live', 'ended'].includes(session.sessionStatus)) {
        return next(new AppError('Attendance can only be marked for active or completed sessions', 400));
    }

    const existingRecord = session.attendance.find((attendance) => attendance.studentId.toString() === studentId.toString());
    if (!existingRecord) {
        session.attendance.push({ studentId, isPresent: true });
        await session.save();
    }

    return responseHelper.success(res, {}, 'Participation intelligence verified');
});

export const getStudentLiveSessions = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    
    // Fetch cohorts where the user is a student
    const cohorts = await Cohort.find({ students: studentId }).select('_id');
    const cohortIds = cohorts.map((cohort) => cohort._id);
    const sessions = await LiveSession.find({
        cohortId: { $in: cohortIds }
    })
        .populate({
            path: 'cohortId',
            populate: { path: 'courseId', select: 'courseTitle courseThumbnail' }
        })
        .sort({ startTime: 1 });

    const result = sessions.filter((session) => {
        const start = new Date(session.startTime);
        const end = new Date(start.getTime() + ((session.duration || 60) * 60000));

        if (session.sessionStatus === 'cancelled') {
            return false;
        }

        return session.sessionStatus === 'ended' || Boolean(session.recordingUrl) || new Date() <= end;
    });

    return responseHelper.success(res, { sessions: result.map(normalizeSessionForResponse) }, 'Student broadcast matrix synchronized');
});

export const getLiveSessionJoinDetails = asyncHandler(async (req, res, next) => {
    const { sessionId } = req.params;
    const session = await LiveSession.findById(sessionId).populate('cohortId', 'students instructorId cohortName courseId');
    if (!session) {
        return next(new AppError('Synchronized session artifact not found', 404));
    }

    const provider = resolveSessionProvider(session);
    const roomName = ensureRoomName(session, provider);
    const livekit = await getLiveKitPublicConfig();
    const isStudentMember = session.cohortId?.students?.some((studentId) => studentId.toString() === req.user._id.toString());
    const isOwnerEducator =
        session.cohortId?.instructorId?.toString() === req.user._id.toString() ||
        req.user.role === 'admin';

    if (!isOwnerEducator && !isStudentMember) {
        return next(new AppError('You are not authorized to join this live classroom', 403));
    }

    if (provider === 'livekit' && await isLiveKitConfigured()) {
        const token = await createLiveKitToken({
            identity: `${req.user.role}-${req.user._id}`,
            name: req.user.name,
            roomName,
            role: req.user.role
        });

        return responseHelper.success(res, {
            session: normalizeSessionForResponse(session),
            provider,
            roomName,
            livekitUrl: livekit.url,
            token,
            fallbackLink: session.meetingLink || '',
            recordingUrl: session.recordingUrl || ''
        }, 'Live classroom credentials provisioned');
    }

    return responseHelper.success(res, {
        session: normalizeSessionForResponse(session),
        provider: 'external',
        roomName: '',
        livekitUrl: livekit.url,
        token: null,
        fallbackLink: session.meetingLink || '',
        recordingUrl: session.recordingUrl || ''
    }, 'Live classroom fallback resolved');
});

export const getSessionAttendance = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    await assertInstructorOwnsSession(sessionId, req.user);

    const session = await LiveSession.findById(sessionId)
        .populate({
            path: 'cohortId',
            populate: { path: 'courseId', select: 'courseTitle' }
        })
        .populate('attendance.studentId', 'name email avatar');

    const cohort = await Cohort.findById(session.cohortId._id).populate('students', 'name email avatar');
    const total = cohort?.students?.length || 0;
    const present = session.attendance.length;

    const attendanceStats = {
        present,
        total,
        markedList: session.attendance,
        fullStudentList: cohort?.students || [],
        participationRate: total > 0 ? Math.round((present / total) * 100) : 0
    };

    return responseHelper.success(res, { session, stats: attendanceStats }, 'Attendance intelligence decrypted');
});
