import mongoose from "mongoose";

const questionBankSchema = new mongoose.Schema({
    question: { type: String, required: true },
    questionType: { type: String, default: 'Multiple Choice' }, // Multiple Choice, Short Answer, Long Answer
    marks: { type: Number, default: 1 },
    image: { type: String }, // URL to question image
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
    explanation: { type: String },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionGroup' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    subject: { type: String }
}, { timestamps: true });

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);
export default QuestionBank;
