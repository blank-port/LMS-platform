import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String }, // Replaces profilePicture
    role: { type: String, enum: ['student', 'instructor', 'admin', 'staff'], default: 'student' },
    isApproved: { type: Boolean, default: false },
    isEducator: { type: Boolean, default: false },
    // Identity & Narrative
    phone: { type: String, default: "" },
    about: { type: String, default: "" },
    headline: { type: String, default: "" },
    dob: { type: String, default: "" },
    language: { type: String, default: "English" },
    
    // Extensions
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    payoutSettings: {
        accountName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        bankName: { type: String, default: "" },
        ifscCode: { type: String, default: "" }
    },
    education: [
        {
            institution: { type: String, default: "" },
            degree: { type: String, default: "" },
            year: { type: String, default: "" }
        }
    ],
    experience: [
        {
            company: { type: String, default: "" },
            role: { type: String, default: "" },
            duration: { type: String, default: "" }
        }
    ],
    skills: [{ type: String }],
    socialLinks: {
        facebook: { type: String, default: "" },
        twitter: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        instagram: { type: String, default: "" }
    },
    notificationSettings: {
        email: { type: Boolean, default: true },
        courseUpdates: { type: Boolean, default: true },
        assignmentReminders: { type: Boolean, default: true }
    },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    ],
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    walletBalance: { type: Number, default: 0 },
    gamification: {
        totalPoints: { type: Number, default: 0 },
        currentPoints: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
        streakCount: { type: Number, default: 0 },
        lastStreakUpdate: { type: Date }
    },
    lastActive: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: true },
    requiresPasswordChange: { type: Boolean, default: false },
    verifyOtp: { type: String, default: '' },
    verifyOtpExpire: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.index({ name: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Virtual: backward-compatible alias so .populate('profilePicture') resolves
userSchema.virtual('profilePicture').get(function () {
    return this.avatar || '';
}).set(function (val) {
    this.avatar = val;
});

const User = mongoose.model("User", userSchema);

export default User;