import IssuedCertificate from '../models/IssuedCertificate.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Font from '../models/Font.js';
import Setting from '../models/Setting.js';
import { v2 as cloudinary } from 'cloudinary';
import responseHelper from '../utils/responseHelper.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

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
export const manualIssue = asyncHandler(async (req, res, next) => {
    const { userId, courseId } = req.body;
    const pdfFile = req.file; // From multer

    if (!pdfFile) {
        return next(new AppError('Institutional artifact (PDF) required', 400));
    }

    // Verify enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
        return next(new AppError('Scholarly enrollment not found in registry', 404));
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

    return responseHelper.success(res, { certificate }, 'Certificate manual issuance verified');
});

// Get My Certificates (Student)
export const getMyCertificates = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const certificates = await IssuedCertificate.find({ userId })
        .populate('courseId', 'courseTitle courseThumbnail')
        .sort({ createdAt: -1 });

    return responseHelper.success(res, { certificates }, 'Scholarly credentials synchronized');
});

// Verify Certificate (Publicly accessible if needed)
export const verifyCertificate = asyncHandler(async (req, res, next) => {
    const { certificateId } = req.params;
    const certificate = await IssuedCertificate.findOne({ certificateId })
        .populate('userId', 'name')
        .populate('courseId', 'courseTitle');

    if (!certificate) {
        return next(new AppError('Institutional credential not found in registry', 404));
    }

    return responseHelper.success(res, { certificate }, 'Credential integrity verified');
});

// --- Font & Policy Management ---

export const getCertificateFonts = asyncHandler(async (req, res, next) => {
    const fonts = await Font.find().sort({ createdAt: -1 });
    return responseHelper.success(res, { fonts }, 'Typography registry synchronized');
});

export const createCertificateFont = asyncHandler(async (req, res, next) => {
    const { name, family, url } = req.body;
    if (!name || !family || !url) {
        return next(new AppError('Institutional typography requires name, family, and source URL', 400));
    }
    const font = await Font.create({ name, family, url });
    return responseHelper.success(res, { font }, 'Typography provisioned successfully', 201);
});

export const deleteCertificateFont = asyncHandler(async (req, res, next) => {
    const font = await Font.findByIdAndDelete(req.params.id);
    if (!font) return next(new AppError('Typography artifact not found', 404));
    return responseHelper.success(res, {}, 'Typography artifact decommissioned');
});

export const getCertificateSettings = asyncHandler(async (req, res, next) => {
    // Return both legacy and new protocol keys to ensure frontend compatibility
    const settings = await Setting.find({ 
        key: { $in: [
            'cert_auto_issue', 'cert_prefix', 'cert_default_template', 'cert_expiry_days',
            'enableAutoGeneration', 'generationTrigger', 'signatureName', 'signaturePosition', 'institutionLogo', 'verificationPortal'
        ] } 
    });
    const settingsMap = {};
    settings.forEach(s => { 
        // Convert string 'true'/'false' back to boolean for cleaner frontend logic
        let val = s.value;
        if (val === 'true') val = true;
        if (val === 'false') val = false;
        settingsMap[s.key] = val; 
    });
    return responseHelper.success(res, { settings: settingsMap }, 'Policy configurations synchronized');
});

export const updateCertificateSettings = asyncHandler(async (req, res, next) => {
    const settings = req.body;
    await Promise.all(Object.entries(settings).map(([key, value]) =>
        Setting.findOneAndUpdate({ key }, { key, value: String(value), isSensitive: false }, { upsert: true })
    ));
    return responseHelper.success(res, {}, 'Policy configurations updated');
});
