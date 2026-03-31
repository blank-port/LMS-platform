import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import User from './models/User.js';
import Category from './models/Category.js';

const seed = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Create admin user
        const existingAdmin = await User.findOne({ email: 'admin@lms.com' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                name: 'Admin',
                email: 'admin@lms.com',
                password: hashedPassword,
                role: 'admin',
                isApproved: true
            });
            console.log('Admin user created: admin@lms.com / admin123');
        } else {
            console.log('Admin user already exists');
        }

        // Create sample categories
        const categories = [
            { name: 'Web Development', description: 'HTML, CSS, JavaScript, React, Node.js and more' },
            { name: 'Mobile Development', description: 'Android, iOS, React Native, Flutter' },
            { name: 'Data Science', description: 'Python, Machine Learning, AI, Statistics' },
            { name: 'Database', description: 'SQL, MongoDB, PostgreSQL, Redis' },
            { name: 'DevOps', description: 'Docker, Kubernetes, CI/CD, AWS' },
            { name: 'Programming Languages', description: 'Java, Python, C++, Go, Rust' },
            { name: 'Design', description: 'UI/UX Design, Figma, Adobe XD' },
            { name: 'Business', description: 'Marketing, Management, Finance' }
        ];

        for (const cat of categories) {
            const existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                await Category.create(cat);
                console.log(`Category created: ${cat.name}`);
            }
        }

        // Create sample instructor
        const existingInstructor = await User.findOne({ email: 'instructor@lms.com' });
        if (!existingInstructor) {
            const hashedPassword = await bcrypt.hash('instructor123', 10);
            await User.create({
                name: 'John Instructor',
                email: 'instructor@lms.com',
                password: hashedPassword,
                role: 'instructor',
                isApproved: true
            });
            console.log('Instructor user created: instructor@lms.com / instructor123');
        }

        // Create sample student
        const existingStudent = await User.findOne({ email: 'student@lms.com' });
        if (!existingStudent) {
            const hashedPassword = await bcrypt.hash('student123', 10);
            await User.create({
                name: 'Jane Student',
                email: 'student@lms.com',
                password: hashedPassword,
                role: 'student',
                isApproved: true
            });
            console.log('Student user created: student@lms.com / student123');
        }

        console.log('\nSeed completed successfully!');
        console.log('Default accounts:');
        console.log('  Admin:      admin@lms.com / admin123');
        console.log('  Instructor: instructor@lms.com / instructor123');
        console.log('  Student:    student@lms.com / student123');
        process.exit(0);

    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();
