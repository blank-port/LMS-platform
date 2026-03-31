import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String }, // URL to icon
    criteriaType: { type: String, enum: ['course_completion', 'quiz_score', 'enrollment_count'], required: true },
    criteriaValue: { type: Number }, // e.g., 90 for 90% score
}, { timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
