import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import seedDatabase from './configs/seedDB.js'
import User from './models/User.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import instructorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'
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


import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Express
const app = express()

// Connect to database
await connectDB()

// Conditional Seeding: Only seed if the database is empty
const userCount = await User.countDocuments();
if (userCount === 0) {
    await seedDatabase();
} else {
    console.log('Institutional Database: Verified. Skipping seed logic.');
}

await connectCloudinary()

// Middlewares
app.use(helmet())
app.use(compression())
app.use(cors())
app.use(express.json())

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for development verification
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, '../client/dist')))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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
// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})