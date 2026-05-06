import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Models
import User from '../models/User.js';
import Course from '../models/Course.js';
import Category from '../models/Category.js';
import Enrollment from '../models/Enrollment.js';
import WalletTransaction from '../models/WalletTransaction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is missing from .env');
    process.exit(1);
}

const seedData = async () => {
    try {
        console.log('--- PrismEd Institutional Seeding Initiative ---');
        await mongoose.connect(`${MONGODB_URI}/lms`);
        console.log('Network Established: Connected to Command Hub DB.');

        const hashedPassword = await bcrypt.hash('PrismEd2026!', 10);

        // 1. Taxonomy Initialization (Categories)
        const categoriesData = [
            { name: 'Intelligence', description: 'AI, Machine Learning, and Cognitive Architecture' },
            { name: 'Strategic Architecture', description: 'System Design and Full-Stack Engineering' },
            { name: 'Fiscal Operations', description: 'Financial Technology and Asset Management' },
            { name: 'Visual Design', description: 'High-Fidelity UI/UX and Aesthetic Frameworks' },
            { name: 'Cyber Security', description: 'Network Hardening and Identity Sync Protocols' }
        ];

        const categories = [];
        for (const cat of categoriesData) {
            let existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                existing = await Category.create(cat);
                console.log(`Taxonomy Registered: ${cat.name}`);
            }
            categories.push(existing);
        }

        // 2. Instructor Deployment
        const instructorsData = [
            { name: 'Dr. Elena Vance', email: 'elena.vance@prismed.edu', role: 'instructor', isEducator: true, headline: 'Director of AI Research' },
            { name: 'Marcus Holloway', email: 'marcus.h@prismed.edu', role: 'instructor', isEducator: true, headline: 'Lead Security Architect' },
            { name: 'Sylvia Chen', email: 'sylvia.design@prismed.edu', role: 'instructor', isEducator: true, headline: 'Principal Design Engineer' }
        ];

        const instructors = [];
        for (const inst of instructorsData) {
            let existing = await User.findOne({ email: inst.email });
            if (!existing) {
                existing = await User.create({
                    ...inst,
                    password: hashedPassword,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inst.name}`,
                    isApproved: true,
                    referralCode: `INST-${inst.name.split(' ')[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    about: 'Visionary educator dedicated to high-fidelity curriculum design.',
                    experience: [{ company: 'PrismEd Lab', role: inst.headline, duration: '6 Years' }]
                });
                console.log(`Instructor Commissioned: ${inst.name}`);
            }
            instructors.push(existing);
        }

        // 3. Course Synthesis (Assets)
        const coursesData = [
            {
                courseTitle: 'Neural Architecture: High-Fidelity Intelligence',
                courseDescription: 'Master the design of autonomous cognitive systems using advanced HSL-based neural blending.',
                coursePrice: 4999,
                discount: 10,
                level: 'Advanced',
                category: categories[0]._id, // Intelligence
                instructor: instructors[0]._id,
                isPublished: true,
                status: 'approved',
                courseThumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'
            },
            {
                courseTitle: 'Glassmorphic Design Systems',
                courseDescription: 'How to build premium, state-of-the-art visual languages for institutional platforms.',
                coursePrice: 2999,
                discount: 15,
                level: 'Intermediate',
                category: categories[3]._id, // Visual Design
                instructor: instructors[2]._id,
                isPublished: true,
                status: 'approved',
                courseThumbnail: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800'
            },
            {
                courseTitle: 'Fiscal Integrity: Secure Payout Architectures',
                courseDescription: 'Implementing timing-safe cryptographic handshakes and fiscal synchronization.',
                coursePrice: 5999,
                discount: 5,
                level: 'Advanced',
                category: categories[2]._id, // Fiscal Operations
                instructor: instructors[1]._id,
                isPublished: true,
                status: 'approved',
                courseThumbnail: 'https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=800'
            }
        ];

        const courses = [];
        for (const courseDoc of coursesData) {
            let existing = await Course.findOne({ courseTitle: courseDoc.courseTitle });
            if (!existing) {
                existing = await Course.create(courseDoc);
                console.log(`Asset Finalized: ${courseDoc.courseTitle}`);
            }
            courses.push(existing);
        }

        // 4. Scholar Ingestion (Students)
        const scholarNames = ['Leo', 'Sarah', 'Amara', 'Julian', 'Faye', 'Kael', 'Nina', 'Roman', 'Ivy', 'Xavier'];
        const scholars = [];
        for (const name of scholarNames) {
            const email = `${name.toLowerCase()}@scholar.com`;
            let existing = await User.findOne({ email });
            if (!existing) {
                existing = await User.create({
                    name: `${name} Scholar`,
                    email,
                    password: hashedPassword,
                    role: 'student',
                    avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`,
                    headline: 'Future System Architect',
                    referralCode: `PRISM-${name.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    walletBalance: Math.floor(Math.random() * 5000),
                    gamification: { totalPoints: Math.floor(Math.random() * 1000), level: Math.floor(Math.random() * 5) + 1 }
                });
                console.log(`Scholar Registered: ${name}`);
            }
            scholars.push(existing);
        }

        // 5. Enrollment & Fiscal Trend Synthesis
        console.log('Synchronizing Neural Trends (Enrollments & Financials)...');
        for (let i = 0; i < 20; i++) {
            const scholar = scholars[Math.floor(Math.random() * scholars.length)];
            const course = courses[Math.floor(Math.random() * courses.length)];

            // Check if already enrolled
            const existingEnrollment = await Enrollment.findOne({ userId: scholar._id, courseId: course._id });
            if (!existingEnrollment) {
                const isCompleted = Math.random() > 0.4;
                await Enrollment.create({
                    userId: scholar._id,
                    courseId: course._id,
                    status: 'active',
                    completed: isCompleted,
                    progress: isCompleted ? 100 : Math.floor(Math.random() * 90)
                });

                // Generate a Fiscal Transaction (Debit for Scholar purchase)
                const price = course.coursePrice * (1 - (course.discount / 100));
                await WalletTransaction.create({
                    userId: scholar._id,
                    amount: price,
                    type: 'debit',
                    status: 'success',
                    source: 'course_purchase',
                    description: `Demographic Enrollment: ${course.courseTitle}`,
                    metadata: { courseId: course._id },
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                });

                // Generate a Fiscal Transaction (Credit for Instructor earnings - simplified)
                await WalletTransaction.create({
                    userId: course.instructor,
                    amount: price * 0.7, // Assume 70% share
                    type: 'credit',
                    status: 'success',
                    source: 'instructor_earnings',
                    description: `Royalty Sync: ${course.courseTitle}`,
                    metadata: { courseId: course._id },
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                });
            }
        }

        console.log('--- Institutional Seeding Complete ---');
        console.log('System Status: HIGH-FIDELITY DEMO READY');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Interrupted: CRITICAL ERROR');
        console.error(error);
        process.exit(1);
    }
};

seedData();
