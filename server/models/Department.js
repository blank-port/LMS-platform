import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
