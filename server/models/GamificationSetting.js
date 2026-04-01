import mongoose from "mongoose";

const gamificationSettingSchema = new mongoose.Schema({
    event: { 
        type: String, 
        required: true, 
        unique: true, 
        enum: [
            'registration', 
            'login', 
            'unit_complete', 
            'course_complete', 
            'certificate_earn', 
            'assignment_complete', 
            'quiz_pass', 
            'discussion_create', 
            'comment_create',
            'blog_create',
            'course_review',
            'course_purchase',
            'referral_success',
            'profile_update'
        ] 
    },
    points: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    description: { type: String }
}, { timestamps: true });

const GamificationSetting = mongoose.model('GamificationSetting', gamificationSettingSchema);

export default GamificationSetting;
