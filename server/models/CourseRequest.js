import mongoose from 'mongoose';

const courseRequestSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    requestedCourse: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const CourseRequest = mongoose.model('CourseRequest', courseRequestSchema);
export default CourseRequest;
