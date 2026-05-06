import mongoose from "mongoose";

const fontSchema = new mongoose.Schema({
    name: { type: String, required: true },
    family: { type: String, required: true },
    url: { type: String, required: true }
}, { timestamps: true });

const Font = mongoose.model('Font', fontSchema);

export default Font;
