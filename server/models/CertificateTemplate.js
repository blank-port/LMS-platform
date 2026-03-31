import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    htmlContent: { type: String, required: true }, // HTML with placeholders like {{student_name}}
    cssContent: { type: String },
    backgroundImage: { type: String },
    fontSize: { type: String, default: '16px' },
    fontFamily: { type: String, default: 'Inter' },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const CertificateTemplate = mongoose.model('CertificateTemplate', templateSchema);
export default CertificateTemplate;
