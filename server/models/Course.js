import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: Number, default: 0 },
    lectureUrl: { type: String, default: '' },
    isPreviewFree: { type: Boolean, default: false },
    lectureOrder: { type: Number, default: 0 },
    attachments: [
        {
            fileName: String,
            fileUrl: String
        }
    ]
}, { _id: true });

const chapterSchema = new mongoose.Schema({
    chapterTitle: { type: String, required: true },
    chapterOrder: { type: Number, default: 0 },
    chapterContent: [lectureSchema]
}, { _id: true });

const courseSchema = new mongoose.Schema({
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String, default: '' },
    coursePrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    courseLanguage: { type: String, default: 'English' },
    coursePreviewVideo: { type: String },
    courseOutcomes: [{ type: String }],
    courseRequirements: [{ type: String }],
    subject: { type: String },
    isPublished: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    certificateTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'CertificateTemplate' },
    issueMethod: { type: String, enum: ['quiz', 'completion'], default: 'quiz' },
    courseContent: [chapterSchema],
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseRatings: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5 }
        }
    ],
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    commissionRate: { type: Number, default: 0 }, // 0 means use global commission
}, { timestamps: true, minimize: false });

courseSchema.index({ courseTitle: 'text', courseDescription: 'text' });

const Course = mongoose.model('Course', courseSchema);

export default Course;