import axios from 'axios';

const backendUrl = 'http://localhost:5000';
const adminCredentials = { email: 'admin@prismed.com', password: 'admin123' };

const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const seedReports = async () => {
    try {
        console.log('--- Seeding Report Data ---');
        
        // 1. Login as Admin
        const { data: loginData } = await axios.post(`${backendUrl}/api/user/login`, adminCredentials);
        const token = loginData.token;
        console.log('Admin Authenticated.');

        // 2. Get Courses & Users
        const { data: coursesData } = await axios.get(`${backendUrl}/api/course/all`);
        const { data: usersData } = await axios.get(`${backendUrl}/api/admin/users`, h(token));
        
        const courses = coursesData.courses;
        const students = usersData.users.filter(u => u.role === 'student');

        if (courses.length === 0 || students.length === 0) {
            console.log('Insufficient data for reports. Please run system tests first.');
            return;
        }

        console.log(`Mapping ${students.length} students to ${courses.length} courses...`);

        // 3. Create Dummy Payments
        // We simulate a few payments for each course
        const Payment = (await import('../models/Payment.js')).default;
        
        // Clear existing completed payments for a fresh report (Optional)
        // await Payment.deleteMany({ status: 'completed' });

        for (const course of courses) {
            const enrollCount = Math.floor(Math.random() * 5) + 3; // 3-7 enrollments
            for (let i = 0; i < enrollCount; i++) {
                const student = students[Math.floor(Math.random() * students.length)];
                
                // Directly create in DB to avoid wallet deduction logic for seeding
                // In a real environment, we'd use the enrollment flow, but for reports we need volume.
                await Payment.create({
                    userId: student._id,
                    courseId: course._id,
                    amount: course.coursePrice || 500,
                    status: 'completed',
                    paymentMethod: 'test_seed'
                });
            }
            console.log(`Seeded ${enrollCount} payments for: ${course.courseTitle}`);
        }

        console.log('\n--- Report Seeding Complete ---');
    } catch (error) {
        console.error('Seeding Error:', error.response?.data || error.message);
    }
};

// We need to use mongoose because we are creating directly in DB to bypass complex frontend flows
import mongoose from 'mongoose';
import connectDB from './configs/mongodb.js';
import Payment from './models/Payment.js';

const runDirectly = async () => {
    try {
        await connectDB();
        
        const Course = (await import('./models/Course.js')).default;
        const User = (await import('./models/User.js')).default;
        
        const courses = await Course.find();
        const students = await User.find({ role: 'student' });

        if (courses.length === 0 || students.length === 0) {
            console.log('Please ensure courses and students exist before seeding reports.');
            process.exit(0);
        }

        for (const course of courses) {
            const enrollCount = Math.floor(Math.random() * 8) + 5; 
            for (let i = 0; i < enrollCount; i++) {
                const student = students[Math.floor(Math.random() * students.length)];
                await Payment.create({
                    userId: student._id,
                    courseId: course._id,
                    amount: course.coursePrice > 0 ? course.coursePrice : 499,
                    status: 'completed',
                    paymentMethod: 'system_intelligence_seed'
                });
            }
        }
        console.log('Seeded high-volume transaction ledger.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runDirectly();
