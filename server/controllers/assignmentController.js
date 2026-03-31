import Assignment from "../models/Assignment.js";
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import { v2 as cloudinary } from 'cloudinary';

// Get Assignments for a Course
export const getAssignmentsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const assignments = await Assignment.find({ courseId }).sort({ deadline: 1 });
        res.json({ success: true, assignments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Submit Assignment
export const submitAssignment = async (req, res) => {
    try {
        const { assignmentId, content } = req.body;
        const studentId = req.user._id;
        const files = req.files; // Handled by multer

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

        res.json({ success: true, message: 'Assignment submitted successfully', submission });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Submissions (Student View)
export const getStudentSubmissions = async (req, res) => {
    try {
        const studentId = req.user._id;
        const submissions = await AssignmentSubmission.find({ studentId })
            .populate('assignmentId', 'title deadline totalMarks')
            .sort({ createdAt: -1 });
        res.json({ success: true, submissions });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Grade Submission (Admin/Instructor View)
export const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { marksObtained, feedback } = req.body;

        const submission = await AssignmentSubmission.findByIdAndUpdate(submissionId, {
            marksObtained,
            feedback,
            status: 'graded'
        }, { new: true });

        res.json({ success: true, message: 'Submission graded', submission });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
