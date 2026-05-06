import express from 'express';
import { 
    createCohort, 
    updateCohort,
    deleteCohort,
    getInstructorCohorts, 
    scheduleLiveSession, 
    updateLiveSession,
    getCohortSessions, 
    getInstructorSessions,
    getCourseStudents,
    enrollToCohort, 
    removeStudentFromCohort,
    getStudentCohorts,
    getStudentLiveSessions,
    markAttendance,
    getSessionAttendance,
    getCohortInfo,
    cancelLiveSession,
    getSessionInsights,
    getLiveSessionJoinDetails
} from '../controllers/cohortController.js';
import { authMiddleware, authorize, protectInstructor, protectUser } from '../middlewares/authMiddleware.js';

const cohortRouter = express.Router();

// Educator Routes
cohortRouter.post('/create', protectInstructor, createCohort);
cohortRouter.put('/update/:id', protectInstructor, updateCohort);
cohortRouter.delete('/delete/:id', protectInstructor, deleteCohort);
cohortRouter.get('/instructor-list', protectInstructor, getInstructorCohorts);
cohortRouter.get('/course-students/:courseId', protectInstructor, getCourseStudents);
cohortRouter.get('/instructor-sessions', protectInstructor, getInstructorSessions);
cohortRouter.post('/schedule-session', protectInstructor, scheduleLiveSession);
cohortRouter.put('/update-session/:id', protectInstructor, updateLiveSession);
cohortRouter.patch('/cancel-session/:id', protectInstructor, cancelLiveSession);
cohortRouter.get('/session-insights/:sessionId', protectInstructor, getSessionInsights);
cohortRouter.post('/assign-student', protectInstructor, enrollToCohort);
cohortRouter.post('/remove-student', protectInstructor, removeStudentFromCohort);
cohortRouter.get('/session-attendance/:sessionId', protectInstructor, getSessionAttendance);

// Student & Shared Routes
cohortRouter.get('/student-list', protectUser, getStudentCohorts);
cohortRouter.get('/student-sessions', protectUser, getStudentLiveSessions);
cohortRouter.get('/join/:sessionId', protectUser, getLiveSessionJoinDetails);
cohortRouter.get('/sessions/:cohortId', protectUser, getCohortSessions);
cohortRouter.get('/:id', protectUser, getCohortInfo);
cohortRouter.post('/mark-attendance/:sessionId', authMiddleware, authorize('student'), markAttendance);

export default cohortRouter;
