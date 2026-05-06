import Assignment from "../models/Assignment.js";
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import Course from "../models/Course.js";
import { v2 as cloudinary } from 'cloudinary';
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createStudentNotification, createBatchNotifications } from "../services/notificationService.js";
import Enrollment from "../models/Enrollment.js";
import moment from "moment";

// Get Assignments for a Course
export const getAssignmentsByCourse = asyncHandler(async (req, res, next) => {
    const { courseId } = req.params;
    const assignments = await Assignment.find({ courseId }).sort({ deadline: 1 });
    return responseHelper.success(res, { assignments }, 'Assignment syllabus synchronized');
});

// Submit Assignment
export const submitAssignment = asyncHandler(async (req, res, next) => {
    const { assignmentId, content } = req.body;
    const studentId = req.user._id;
    const files = req.files; // Handled by multer

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return next(new AppError('Target assessment not found', 404));

    // Security Audit: Verify enrollment
    const course = await Course.findById(assignment.courseId);
    if (!course || !course.enrolledStudents.includes(studentId)) {
        return next(new AppError('Access denied: Unauthorized identity detected for this curriculum', 403));
    }

    // Idempotency: Duplicate submission check
    const existingSubmission = await AssignmentSubmission.findOne({ assignmentId, studentId });
    if (existingSubmission) {
        return next(new AppError('Institutional record already exists for this assessment. Use update protocol if enabled.', 400));
    }

    // Temporal Guard: Deadline check
    if (new Date() > new Date(assignment.deadline)) {
        return next(new AppError('Temporal window closed. Assessment submission rejected.', 400));
    }

    const attachments = [];
    if (files && files.length > 0) {
        for (const file of files) {
            const result = await cloudinary.uploader.upload(file.path, { resource_type: 'auto' });
            attachments.push({ fileName: file.originalname, fileUrl: result.secure_url });
        }
    }

    const submission = await AssignmentSubmission.create({
        assignmentId,
        studentId,
        content,
        attachments
    });

    return responseHelper.success(res, { submission }, 'Institutional submission verified', 201);
});

// Get Submissions (Student View)
export const getStudentSubmissions = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const submissions = await AssignmentSubmission.find({ studentId })
        .populate('assignmentId', 'title deadline totalMarks')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { submissions }, 'Academic submission history synchronized');
});

// Grade Submission (Admin/Instructor View)
export const gradeSubmission = asyncHandler(async (req, res, next) => {
    const { submissionId } = req.params;
    const { marksObtained, feedback } = req.body;
    const instructorId = req.user._id;

    const submission = await AssignmentSubmission.findById(submissionId).populate({
        path: 'assignmentId',
        select: 'courseId'
    });

    if (!submission) {
        return next(new AppError('Institutional submission record not found', 404));
    }

    // Security Audit: Verify instructor ownership
    const course = await Course.findById(submission.assignmentId.courseId);
    if (!course || course.instructor.toString() !== instructorId.toString()) {
        return next(new AppError('Authorization void: Instructor mismatch detected', 403));
    }

    submission.marksObtained = marksObtained;
    submission.feedback = feedback;
    submission.status = 'graded';
    await submission.save();

    // Notify Student
    await createStudentNotification({
        userId: submission.studentId,
        type: 'GRADE_POSTED',
        title: 'Assignment Graded',
        message: `Your submission for "${submission.assignmentId.title || 'Assignment'}" has been graded. Marks: ${marksObtained}/${submission.assignmentId.totalMarks || '--'}`,
        module: 'academic',
        referenceId: submission._id,
        actionUrl: '/student/my-courses' // Or specific course page
    });

    return responseHelper.success(res, { submission }, 'Academic assessment graded successfully');
});

// Create Assignment (Instructor View)
export const createAssignment = asyncHandler(async (req, res, next) => {
    const { courseId, title, description, deadline, totalMarks } = req.body;
    const instructorId = req.user._id;

    // Security Audit: Verify instructor ownership
    const course = await Course.findById(courseId);
    if (!course || course.instructor.toString() !== instructorId.toString()) {
        return next(new AppError('Authorization void: Instructor mismatch detected', 403));
    }

    const assignment = await Assignment.create({
        courseId,
        title,
        description,
        deadline,
        totalMarks
    });

    // Notify Enrolled Students
    const enrollments = await Enrollment.find({ courseId }).select('studentId');
    if (enrollments.length > 0) {
        const studentIds = enrollments.map(e => e.studentId);
        await createBatchNotifications(studentIds, {
            type: 'ASSIGNMENT_CREATED',
            title: 'New Assignment Deployed',
            message: `A new assignment "${title}" has been posted. Deadline: ${moment(deadline).format('LLL')}`,
            module: 'academic',
            referenceId: assignment._id,
            actionUrl: `/student/player/${courseId}`
        });
    }

    return responseHelper.success(res, { assignment }, 'New academic assessment deployed', 201);
});

// Update Assignment (Instructor View)
export const updateAssignment = asyncHandler(async (req, res, next) => {
    const { assignmentId } = req.params;
    const updateData = req.body;
    const instructorId = req.user._id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return next(new AppError('Assessment record not found', 404));

    // Security Audit: Verify instructor ownership
    const course = await Course.findById(assignment.courseId);
    if (!course || course.instructor.toString() !== instructorId.toString()) {
        return next(new AppError('Authorization void: Instructor mismatch detected', 403));
    }

    Object.assign(assignment, updateData);
    await assignment.save();

    return responseHelper.success(res, { assignment }, 'Academic assessment synchronized');
});

// Delete Assignment (Instructor View)
export const deleteAssignment = asyncHandler(async (req, res, next) => {
    const { assignmentId } = req.params;
    const instructorId = req.user._id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return next(new AppError('Assessment record not found', 404));

    // Security Audit: Verify instructor ownership
    const course = await Course.findById(assignment.courseId);
    if (!course || course.instructor.toString() !== instructorId.toString()) {
        return next(new AppError('Authorization void: Instructor mismatch detected', 403));
    }

    await Assignment.findByIdAndDelete(assignmentId);
    await AssignmentSubmission.deleteMany({ assignmentId });
    return responseHelper.success(res, null, 'Academic assessment and related submissions purged');
});

// Get Submissions for an Assignment (Instructor View)
export const getSubmissionsByAssignment = asyncHandler(async (req, res, next) => {
    const { assignmentId } = req.params;
    const instructorId = req.user._id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return next(new AppError('Assessment record not found', 404));

    // Security Audit: Verify instructor ownership
    const course = await Course.findById(assignment.courseId);
    if (!course || course.instructor.toString() !== instructorId.toString()) {
        return next(new AppError('Authorization void: Instructor mismatch detected', 403));
    }

    const submissions = await AssignmentSubmission.find({ assignmentId })
        .populate('studentId', 'name profilePicture email')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { submissions }, 'Academic submission records synchronized');
});
