import mongoose from "mongoose";

const questionGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }
}, { timestamps: true });

const QuestionGroup = mongoose.model('QuestionGroup', questionGroupSchema);
export default QuestionGroup;
