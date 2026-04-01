import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String }, // URL to icon
    type: { 
        type: String, 
        enum: [
            'activity', 
            'registration', 
            'learning', 
            'test', 
            'assignment', 
            'perfectionism', 
            'course_count', 
            'certification'
        ], 
        required: true 
    },
    threshold: { type: Number, required: true }, // e.g., 5 logins, 100 points, etc.
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
