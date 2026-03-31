import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [{ fileName: String, fileUrl: String }],
    deadline: { type: Date, required: true },
    totalMarks: { type: Number, default: 100 },
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
