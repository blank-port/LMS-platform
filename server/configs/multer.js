import multer from "multer";

const storage = multer.diskStorage({});

// Institutional Storage Policy: Restrict to validated media protocols
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Modular Protocol Violation: Invalid file type. Only JPG, PNG, WEBP and PDF are authorized.'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB Institutional Limit
    }
});

export default upload;