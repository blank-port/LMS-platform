import mongoose from "mongoose";

const instituteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    contactEmail: { type: String },
    address: { type: String },
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Institute = mongoose.model('Institute', instituteSchema);
export default Institute;
