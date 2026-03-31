import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String }, // Optional text response
    attachments: [{ fileName: String, fileUrl: String }],
    status: { type: String, enum: ['submitted', 'graded', 'overdue'], default: 'submitted' },
    marksObtained: { type: Number },
    feedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const AssignmentSubmission = mongoose.model('AssignmentSubmission', submissionSchema);
export default AssignmentSubmission;
