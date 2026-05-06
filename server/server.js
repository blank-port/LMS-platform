import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import seedDatabase from './configs/seedDB.js'
import User from './models/User.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import instructorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'
import errorMiddleware from './middlewares/errorMiddleware.js'
import adminRouter from './routes/adminRoutes.js'
import quizRouter from './routes/quizRoutes.js'
import reviewRouter from './routes/reviewRoutes.js'
import discussionRouter from './routes/discussionRoutes.js'
import auditRouter from './routes/auditRoutes.js'
import educationRouter from './routes/educationRoutes.js'
import financeRouter from './routes/financeRoutes.js'
import commRouter from './routes/communicationRoutes.js'
import paymentRouter from './routes/paymentRoutes.js'
import settingRouter from './routes/settingRoutes.js'
import walletRouter from './routes/walletRoutes.js'
import assignmentRouter from './routes/assignmentRoutes.js'
import supportRouter from './routes/supportRoutes.js'
import couponRouter from './routes/couponRoutes.js'
import cmsRouter from './routes/cmsRoutes.js'
import blogRouter from './routes/blogRoutes.js'
import subCategoryRouter from './routes/subCategoryRoutes.js'
import gamificationRouter from './routes/gamificationRoutes.js'
import notificationRouter from './routes/notificationRoutes.js'
import chatRouter from './routes/chatRoutes.js'
import certificateRouter from './routes/certificateRoutes.js'
import aiRouter from './routes/aiRoutes.js'
import cohortRouter from './routes/cohortRoutes.js'
import noticeRouter from './routes/noticeRoutes.js'
import marketingRouter from './routes/marketingRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import { ensureIndexes } from './configs/indexes.js'
import asyncHandler from './utils/asyncHandler.js'
import xssSanitizer from './middlewares/xssSanitizer.js'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Express
const app = express()

// Connect to database
await connectDB()

// Initialize Performance Indexes
await ensureIndexes()


// Conditional Seeding: Only seed if the database is empty
const userCount = await User.countDocuments();
if (userCount === 0) {
    await seedDatabase();
} else {
    console.log('Institutional Database: Verified. Skipping seed logic.');
}

// Production Security Guard: Warn if default admin credentials are still active
if (process.env.NODE_ENV === 'production') {
    const adminUser = await User.findOne({ email: 'admin@prismed.com' });
    if (adminUser) {
        const isDefaultPassword = await bcrypt.compare('admin123', adminUser.password);
        if (isDefaultPassword) {
            console.warn('[SECURITY WARNING] Default admin credentials (admin@prismed.com / admin123) are still active in production. Change them immediately at /admin/my-profile');
        }
    }
}

await connectCloudinary()

// Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000', 'http://localhost:5001', 'http://127.0.0.1:5001', 'http://127.0.0.1:5000'];

// Add CLIENT_URL if defined
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://accounts.google.com"],
      "frame-src": ["'self'", "https://accounts.google.com", "https://www.youtube.com", "https://youtube.com", "https://player.vimeo.com"],
      "connect-src": ["'self'", "https://accounts.google.com", ...allowedOrigins],
      "img-src": ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com", "https://*.googleusercontent.com"],
      "media-src": ["'self'", "https://res.cloudinary.com"]
    },
  },
}))
app.use(compression())
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Normalize origin for comparison
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(normalizedOrigin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`Identity validation: Origin ${origin} blocked by security matrix`));
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
// Traffic Monitor: Strategic Logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[Traffic] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

app.use(xssSanitizer);

// Rate Limiting: Harden against brute-force while allowing SPA asset burst
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 1000, 
  message: 'PrismEd Security: Too many requests from this IP. Please wait 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// Serve static files with production caching and CORS support for modular assets
const distPath = path.resolve(__dirname, '../client/dist');
const staticOptions = {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Explicitly allow CORS for static assets (required for Vite module loading)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Ensure correct MIME types for ESM modules
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
};
app.use(express.static(distPath, staticOptions))

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')))

// API Routes
app.use('/api/user', userRouter)
app.use('/api/course', courseRouter)
app.use('/api/instructor', instructorRouter)
app.use('/api/admin', adminRouter)
app.use('/api/quiz', quizRouter)
app.use('/api/review', reviewRouter)
app.use('/api/discussion', discussionRouter)
app.use('/api/audit', auditRouter)
app.use('/api/education', educationRouter)
app.use('/api/finance', financeRouter)
app.use('/api/comm', commRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/setting', settingRouter)
app.use('/api/wallet', walletRouter)
app.use('/api/assignment', assignmentRouter)
app.use('/api/support', supportRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/cms', cmsRouter)
app.use('/api/blog', blogRouter)
app.use('/api/sub-category', subCategoryRouter)
app.use('/api/gamification', gamificationRouter)
app.use('/api/notification', notificationRouter)
app.use('/api/chat', chatRouter)
app.use('/api/certificate', certificateRouter)
app.use('/api/ai', aiRouter)
app.use('/api/cohort', cohortRouter)
app.use('/api/notice', noticeRouter)
app.use('/api/marketing', marketingRouter)
app.use('/api/messages', messageRouter)

// System Observability: Health Check
app.get('/api/health', asyncHandler(async (req, res) => {
    const healthcheck = {
        status: 'Operational',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: Date.now(),
        database: mongoose.connection.readyState === 1 ? 'Healthy' : 'Degraded'
    };
    res.json(healthcheck);
}));

// Error handling middleware should be added before the wildcard handler
app.use(errorMiddleware);

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
})

// Port
const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})