import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: { type: String, required: true },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
        default: null
    }
}, { timestamps: true });

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;
