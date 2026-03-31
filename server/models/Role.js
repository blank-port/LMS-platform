import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: String }], // e.g., 'manage_users', 'manage_courses'
    type: { type: String, enum: ['admin', 'staff', 'instructor', 'student'], required: true }
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);
export default Role;
