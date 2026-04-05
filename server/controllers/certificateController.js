import IssuedCertificate from '../models/IssuedCertificate.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';

// Internal function to issue automated certificate
export const issueAutomatedCertificate = async (userId, courseId) => {
    try {
        // Check if already issued
        const existing = await IssuedCertificate.findOne({ userId, courseId });
        if (existing) return existing;

        const course = await Course.findById(courseId).populate('certificateTemplate');
        if (!course) return null;

        const CertificateTemplate = (await import('../models/CertificateTemplate.js')).default;
        
        let template = course.certificateTemplate;
        if (!template) {
            template = await CertificateTemplate.findOne({ isDefault: true });
        }

        const certificateId = `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        const certificate = await IssuedCertificate.create({
            userId,
            courseId,
            certificateId,
            type: 'automated'
        });

        return certificate;
    } catch (error) {
        console.error('Failed to issue automated certificate:', error);
        return null;
    }
};

// Manual Issuance (Educator/Admin)
export const manualIssue = async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        const pdfFile = req.file; // From multer

        if (!pdfFile) {
            return res.status(400).json({ success: false, message: 'Certificate file required' });
        }

        // Verify enrollment
        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Student not enrolled in this course' });
        }

        // Upload to Cloudinary
        const upload = await cloudinary.uploader.upload(pdfFile.path, {
            resource_type: 'auto',
            folder: 'certificates'
        });

        const certificateId = `MANUAL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const certificate = await IssuedCertificate.create({
            userId,
            courseId,
            certificateId,
            pdfUrl: upload.secure_url,
            type: 'manual',
            issuedBy: req.user._id
        });

        res.json({ success: true, message: 'Manual certificate issued successfully', certificate });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get My Certificates (Student)
export const getMyCertificates = async (req, res) => {
    try {
        const userId = req.user._id;
        const certificates = await IssuedCertificate.find({ userId })
            .populate('courseId', 'courseTitle courseThumbnail')
            .sort({ createdAt: -1 });

        res.json({ success: true, certificates });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Verify Certificate (Publicly accessible if needed)
export const verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const certificate = await IssuedCertificate.findOne({ certificateId })
            .populate('userId', 'name')
            .populate('courseId', 'courseTitle');

        if (!certificate) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }

        res.json({ success: true, certificate });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
