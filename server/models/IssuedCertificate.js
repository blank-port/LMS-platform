import mongoose from 'mongoose';

const issuedCertificateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateId: { type: String, unique: true }, // Unique identifier for verification
    issueDate: { type: Date, default: Date.now },
    pdfUrl: { type: String }, // Optional cloud storage URL
}, { timestamps: true });

const IssuedCertificate = mongoose.model('IssuedCertificate', issuedCertificateSchema);
export default IssuedCertificate;
