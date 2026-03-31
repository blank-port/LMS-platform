import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models using dynamic imports to handle ESM/Absolute paths
const modelPath = path.join(__dirname, 'models');
const Course = (await import(`file:///${path.join(modelPath, 'Course.js')}`)).default;
const User = (await import(`file:///${path.join(modelPath, 'User.js')}`)).default;
const Enrollment = (await import(`file:///${path.join(modelPath, 'Enrollment.js')}`)).default;
const WalletTransaction = (await import(`file:///${path.join(modelPath, 'WalletTransaction.js')}`)).default;

dotenv.config({ path: path.join(__dirname, '.env') });

const seedTestData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const sarah = await User.findOne({ email: 'sarah.w@prismed.com' });
        if (!sarah) {
            console.log('Sarah Wilson not found. Run seedDB.js first.');
            return;
        }

        const student = await User.findOne({ role: 'student' });
        if (!student) {
            console.log('Student not found. Run seedDB.js first.');
            return;
        }

        const courses = await Course.find({ instructor: sarah._id });
        if (courses.length === 0) {
            console.log('Sarah has no courses. Run seedDB.js first.');
            return;
        }

        console.log(`Cleaning old data for ${sarah.email}...`);
        await Enrollment.deleteMany({ courseId: { $in: courses.map(c => c._id) } });
        await WalletTransaction.deleteMany({ userId: sarah._id, source: 'instructor_earnings' });

        const now = new Date();

        // 1. Create Enrollments
        console.log('Creating enrollments...');
        for (let i = 0; i < 5; i++) {
            const course = courses[i % courses.length];
            const enrollmentDate = new Date();
            enrollmentDate.setDate(now.getDate() - i);
            
            await Enrollment.create({
                userId: student._id,
                courseId: course._id,
                progress: Math.floor(Math.random() * 100),
                createdAt: enrollmentDate
            });
        }

        // 2. Create Wallet Transactions (Revenue)
        console.log('Creating wallet transactions...');
        
        // Earnings Today
        await WalletTransaction.create({
            userId: sarah._id,
            amount: 1500,
            type: 'credit',
            status: 'success',
            source: 'instructor_earnings',
            description: 'Course Purchase Payout',
            createdAt: now
        });

        // Earnings This Month (excluding today)
        const thisMonthDate = new Date();
        thisMonthDate.setDate(now.getDate() - 5);
        await WalletTransaction.create({
            userId: sarah._id,
            amount: 3000,
            type: 'credit',
            status: 'success',
            source: 'instructor_earnings',
            description: 'Course Purchase Payout',
            createdAt: thisMonthDate
        });

        // Historical monthly earnings (Last 12 months)
        for (let i = 1; i < 12; i++) {
            const histDate = new Date();
            histDate.setMonth(now.getMonth() - i);
            histDate.setDate(15);
            
            await WalletTransaction.create({
                userId: sarah._id,
                amount: Math.floor(Math.random() * 5000) + 2000,
                type: 'credit',
                status: 'success',
                source: 'instructor_earnings',
                description: `Monthly Payout for ${histDate.toLocaleString('default', { month: 'long' })}`,
                createdAt: histDate
            });
        }

        console.log('Test data seeded successfully for Sarah Wilson.');
        await mongoose.connection.close();
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seedTestData();
