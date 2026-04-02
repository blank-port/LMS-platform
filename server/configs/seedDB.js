import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import Role from '../models/Role.js';
import QuestionGroup from '../models/QuestionGroup.js';
import QuestionBank from '../models/QuestionBank.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import SupportTicket from '../models/SupportTicket.js';
import WalletTransaction from '../models/WalletTransaction.js';
import IssuedCertificate from '../models/IssuedCertificate.js';
import Coupon from '../models/Coupon.js';
import CmsPage from '../models/CmsPage.js';
import Blog from '../models/Blog.js';
import Setting from '../models/Setting.js';
import Institute from '../models/Institute.js';
import { seedGamificationSettings } from '../services/gamificationService.js';


const seedDatabase = async () => {
    try {
        // Clear existing data for fresh start
        await User.deleteMany({});
        await Category.deleteMany({});
        await Course.deleteMany({});
        await Enrollment.deleteMany({});
        await Payment.deleteMany({});
        await Role.deleteMany({});
        await QuestionGroup.deleteMany({});
        await QuestionBank.deleteMany({});
        await Quiz.deleteMany({});
        await QuizAttempt.deleteMany({});
        await SupportTicket.deleteMany({});
        await WalletTransaction.deleteMany({});
        await IssuedCertificate.deleteMany({});
        await Coupon.deleteMany({});
        await CmsPage.deleteMany({});
        await Blog.deleteMany({});
        await Setting.deleteMany({});
        await Institute.deleteMany({});
        await Payment.deleteMany({});


        console.log('Seeding database for PrismEd...');

        // 0. Create Roles
        const roles = [
            { name: 'Admin', type: 'admin', permissions: ['manage_users', 'manage_courses', 'manage_settings'] },
            { name: 'Staff', type: 'staff', permissions: ['manage_courses', 'view_reports'] },
            { name: 'Instructor', type: 'instructor', permissions: ['create_courses', 'manage_quizzes'] },
            { name: 'Student', type: 'student', permissions: ['view_courses', 'take_quizzes'] }
        ];
        const roleDocs = await Role.insertMany(roles);
        const rolesMap = roleDocs.reduce((acc, r) => ({ ...acc, [r.type]: r._id }), {});

        // 1. Create Admin
        const hashedAdmin = await bcrypt.hash('admin123', 10);
        await User.create({ 
            name: 'Admin User', 
            email: 'admin@prismed.com', 
            password: hashedAdmin, 
            role: 'admin', 
            customRole: rolesMap['admin'],
            isApproved: true,
            referralCode: 'ADMIN' + Math.random().toString(36).substring(2, 5).toUpperCase()
        });

        // 2. Create 5 Instructors
        const instructors = [
            { name: 'Dr. Sarah Wilson', email: 'instructor@prismed.com', role: 'instructor' },
            { name: 'Mark Thompson', email: 'mark.t@prismed.com', role: 'instructor' },
            { name: 'Elena Rodriguez', email: 'elena.r@prismed.com', role: 'instructor' },
            { name: 'David Chen', email: 'david.c@prismed.com', role: 'instructor' },
            { name: 'Jessica Lee', email: 'jessica.l@prismed.com', role: 'instructor' }
        ];

        const instructorDocs = [];
        for (const inst of instructors) {
            const hashedPass = await bcrypt.hash('instructor123', 10);
            const doc = await User.create({ 
                ...inst, 
                password: hashedPass, 
                customRole: rolesMap['instructor'],
                isApproved: true,
                referralCode: 'INST' + Math.random().toString(36).substring(2, 6).toUpperCase()
            });
            instructorDocs.push(doc);
        }

        // 3. Create Student
        const hashedStudent = await bcrypt.hash('student123', 10);
        const studentUser = await User.create({ 
            name: 'Student User', 
            email: 'student@prismed.com', 
            password: hashedStudent, 
            role: 'student', 
            customRole: rolesMap['student'],
            isApproved: true,
            walletBalance: 10000,
            referralCode: 'STUDENT1'
        });

        // 4. Create Categories
        const categoriesData = [
            { name: 'Web Development', description: 'Master modern web technologies' },
            { name: 'Data Science', description: 'Analyze data and build AI' },
            { name: 'Graphic Design', description: 'Visual communication and creativity' },
            { name: 'Digital Marketing', description: 'Grow businesses online' },
            { name: 'Soft Skills', description: 'Professionalism and leadership' }
        ];
        const categoryDocs = await Category.insertMany(categoriesData);

        // 4. Create 10 Courses (2 from each instructor)
        const coursesData = [
            {
                courseTitle: 'Full-Stack Web Development BootCamp',
                courseDescription: 'Learn HTML, CSS, JS, React, and Node.js from scratch.',
                coursePrice: 4999,
                discount: 20,
                isPublished: true,
                status: 'approved',
                instructor: instructorDocs[0]._id,
                category: categoryDocs[0]._id,
                level: 'Beginner',
                courseThumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
            },
            {
                courseTitle: 'Advanced React Design Patterns',
                courseDescription: 'Master hooks, context, and performance optimization.',
                coursePrice: 2999,
                discount: 10,
                isPublished: true,
                status: 'approved',
                instructor: instructorDocs[0]._id,
                category: categoryDocs[0]._id,
                level: 'Intermediate',
                courseThumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee'
            },
            {
                courseTitle: 'Python for Data Analysis',
                courseDescription: 'Pandas, Numpy, and Matplotlib mastery.',
                coursePrice: 3500,
                discount: 15,
                isPublished: true,
                status: 'approved',
                instructor: instructorDocs[1]._id,
                category: categoryDocs[1]._id,
                level: 'Beginner',
                courseThumbnail: 'https://images.unsplash.com/photo-1551288049-bbda38a10ad5'
            },
            {
                courseTitle: 'Machine Learning with Scikit-Learn',
                courseDescription: 'Build and deploy predictive models.',
                coursePrice: 5999,
                discount: 25,
                isPublished: true,
                status: 'approved',
                instructor: instructorDocs[1]._id,
                category: categoryDocs[1]._id,
                level: 'Advanced',
                courseThumbnail: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2'
            },
            {
                courseTitle: 'UI/UX Design Essentials',
                courseDescription: 'Learn Figma and design user-centered products.',
                coursePrice: 2500,
                discount: 5,
                isPublished: true,
                status: 'approved',
                instructor: instructorDocs[2]._id,
                category: categoryDocs[2]._id,
                level: 'Beginner',
                courseThumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563dc4c'
            },
            {
                courseTitle: 'Brand Identity & Logo Design',
                courseDescription: 'Create memorable brands for clients.',
                coursePrice: 3200,
                discount: 10,
                isPublished: true,
                status: 'approved',
                instructor: instructorDocs[2]._id,
                category: categoryDocs[2]._id,
                level: 'Intermediate',
                courseThumbnail: 'https://images.unsplash.com/photo-1572044162444-ad60f128bde2'
            },
            {
                courseTitle: 'SEO Mastery for 2024',
                courseDescription: 'Rank #1 on Google with advanced SEO strategies.',
                coursePrice: 1999,
                discount: 30,
                isPublished: true,
                status: 'approved',
                instructor: instructorDocs[3]._id,
                category: categoryDocs[3]._id,
                level: 'Intermediate',
                courseThumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a'
            },
            {
                courseTitle: 'Social Media Marketing Strategy',
                courseDescription: 'Grow your audience on Instagram and LinkedIn.',
                coursePrice: 1500,
                discount: 5,
                isPublished: true,
                status: 'approved',
                instructor: instructorDocs[3]._id,
                category: categoryDocs[3]._id,
                level: 'Beginner',
                courseThumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113'
            },
            {
                courseTitle: 'Public Speaking & Communication',
                courseDescription: 'Speak with confidence and influence others.',
                coursePrice: 1200,
                discount: 0,
                isPublished: true,
                status: 'approved',
                instructor: instructorDocs[4]._id,
                category: categoryDocs[4]._id,
                level: 'Beginner',
                courseThumbnail: 'https://images.unsplash.com/photo-1544531585-9847b68c8c86'
            },
            {
                courseTitle: 'Leadership & Team Management',
                courseDescription: 'How to lead high-performing teams.',
                coursePrice: 2800,
                discount: 10,
                isPublished: true,
                status: 'approved',
                instructor: instructorDocs[4]._id,
                category: categoryDocs[4]._id,
                level: 'Intermediate',
                courseThumbnail: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952'
            }
        ];

        const createdCourses = [];
        for (let i = 0; i < coursesData.length; i++) {
            const course = coursesData[i];
            let courseContent;

            if (i === 0) {
                // First course gets 3 lessons for meaningful progress testing
                courseContent = [
                    {
                        chapterOrder: 1,
                        chapterTitle: 'Getting Started',
                        chapterContent: [
                            { lectureTitle: 'Welcome & Setup', lectureDuration: 600, lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPreviewFree: true },
                            { lectureTitle: 'Environment Configuration', lectureDuration: 900, lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPreviewFree: false }
                        ]
                    },
                    {
                        chapterOrder: 2,
                        chapterTitle: 'Core Concepts',
                        chapterContent: [
                            { lectureTitle: 'Deep Dive into Fundamentals', lectureDuration: 1200, lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPreviewFree: false }
                        ]
                    }
                ];
            } else {
                courseContent = [
                    {
                        chapterOrder: 1,
                        chapterTitle: 'Introduction',
                        chapterContent: [
                            { lectureTitle: 'Course Overview', lectureDuration: 300, lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isPreviewFree: true }
                        ]
                    }
                ];
            }

            const created = await Course.create({
                ...course,
                courseContent
            });
            createdCourses.push(created);
        }

        // 5. Create a Quiz for the first course
        const firstCourse = createdCourses[0];
        await Quiz.create({
            courseId: firstCourse._id,
            title: `${firstCourse.courseTitle} - Final Assessment`,
            duration: 15,
            passingScore: 60,
            createdBy: firstCourse.instructor,
            questions: [
                {
                    questionText: 'What does HTML stand for?',
                    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'],
                    correctAnswer: 0
                },
                {
                    questionText: 'Which language is used for styling web pages?',
                    options: ['HTML', 'JQuery', 'CSS', 'XML'],
                    correctAnswer: 2
                },
                {
                    questionText: 'Which is NOT a JavaScript framework?',
                    options: ['React', 'Angular', 'Django', 'Vue'],
                    correctAnswer: 2
                },
                {
                    questionText: 'What does API stand for?',
                    options: ['Application Programming Interface', 'Application Process Integration', 'Automated Programming Interface', 'Application Protocol Interface'],
                    correctAnswer: 0
                },
                {
                    questionText: 'Which protocol is used to transfer web pages?',
                    options: ['FTP', 'SSH', 'HTTP', 'SMTP'],
                    correctAnswer: 2
                }
            ]
        });

        // 6. Create Coupons
        const couponData = [
            {
                code: 'WELCOME50',
                couponType: 'common',
                discountType: 'percentage',
                discountValue: 50,
                minPurchase: 1000,
                validFrom: new Date(),
                validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                status: 'active'
            },
            {
                code: 'SAVE1000',
                couponType: 'common',
                discountType: 'fixed',
                discountValue: 1000,
                minPurchase: 5000,
                validFrom: new Date(),
                validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
                status: 'active'
            }
        ];
        await Coupon.insertMany(couponData);

        // 7. Create CMS Pages
        const cmsData = [
            {
                title: 'About Us',
                slug: 'about-us',
                content: '<h1>About PrismEd</h1><p>We are a leading provider of high-quality online education.</p>',
                status: 'published',
                pageType: 'page'
            },
            {
                title: 'Terms of Service',
                slug: 'terms',
                content: '<h1>Terms of Service</h1><p>Please read these terms carefully before using our platform.</p>',
                status: 'published',
                pageType: 'page'
            },
            {
                title: 'Privacy Policy',
                slug: 'privacy',
                content: '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>',
                status: 'published',
                pageType: 'page'
            }
        ];
        await CmsPage.insertMany(cmsData);

        // 8. Create Blogs
        const blogData = [
            {
                title: 'Top 10 Web Development Trends in 2024',
                slug: 'web-dev-trends-2024',
                content: '<p>The world of web development is constantly evolving...</p>',
                excerpt: 'Stay ahead of the curve with these top 10 trends.',
                author: instructorDocs[0]._id,
                category: 'Technology',
                tags: ['webdev', 'trends', '2024'],
                status: 'published',
                featuredImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97'
            },
            {
                title: 'How to Start a Career in Data Science',
                slug: 'start-data-science-career',
                content: '<p>Data science is one of the most in-demand fields today...</p>',
                excerpt: 'A comprehensive guide for aspiring data scientists.',
                author: instructorDocs[1]._id,
                category: 'Career',
                tags: ['datascience', 'career', 'guide'],
                status: 'published',
                featuredImage: 'https://images.unsplash.com/photo-1504868584819-f8e90526354c'
            }
        ];
        await Blog.insertMany(blogData);
        await seedGamificationSettings();

        console.log('Database seeded for PrismEd successfully!');
        console.log(`  → ${createdCourses.length} courses (first has 3 lessons)`);
        console.log(`  → 2 Coupons created`);
        console.log(`  → 3 CMS Pages created`);
        console.log(`  → 2 Blogs created`);

        console.log(`  → Student wallet: ₹10,000`);
        console.log(`  → Quiz created for: ${firstCourse.courseTitle}`);

        // 9. Simulation: Scholarly Expansion (15+ Students)
        console.log('Populating 15 additional student personas for competitive ranking...');
        const studentNames = [
            'Arjun Sharma', 'Priya Patel', 'Siddharth Rao', 'Ananya Iyer', 
            'Vikram Singh', 'Ishita Gupta', 'Rohan Das', 'Meera Reddy',
            'Aditya Verma', 'Sana Khan', 'Rahul Malhotra', 'Kriti Sanon',
            'Varun Dhawan', 'Alia Bhatt', 'Ranbir Kapoor'
        ];

        const studentHashedPass = await bcrypt.hash('student123', 10);
        for (let i = 0; i < studentNames.length; i++) {
            const points = i < 3 ? 15000 - (i * 2000) : Math.floor(Math.random() * 8000);
            await User.create({
                name: studentNames[i],
                email: `active_student_${i + 1}@prismed.com`,
                password: studentHashedPass,
                role: 'student',
                customRole: rolesMap['student'],
                isApproved: true,
                referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
                gamification: {
                    totalPoints: points,
                    currentPoints: points,
                    level: Math.floor(points / 3000) + 1,
                    badges: [] // Will be seeded by service if thresholds met (manually added for simulation)
                }
            });
        }
        console.log(`  → 15 Simulated students added.`);

        // 10. Initialization of Course Settings
        console.log('Initializing Platform-Wide Pedagogical Constants...');
        const initialSettings = [
            { key: 'course_approval', value: 'Yes', isSensitive: false },
            { key: 'show_seekbar', value: 'Yes', isSensitive: false },
            { key: 'drip_content', value: 'Show all', isSensitive: false },
            { key: 'hide_qa', value: 'No', isSensitive: false },
            { key: 'hide_review', value: 'No', isSensitive: false },
            { key: 'mail_before_expire', value: '7', isSensitive: false },

            // Advanced Communication Protocols (FCM & Pusher)
            { key: 'fcm_project_id', value: '', isSensitive: false },
            { key: 'fcm_client_email', value: '', isSensitive: false },
            { key: 'fcm_private_key', value: '', isSensitive: true },
            { key: 'pusher_app_id', value: '', isSensitive: false },
            { key: 'pusher_app_key', value: '', isSensitive: false },
            { key: 'pusher_app_secret', value: '', isSensitive: true },
            { key: 'pusher_app_cluster', value: '', isSensitive: false },

            // Notification Trigger Matrix
            { key: 'notify_course_published', value: 'Yes', isSensitive: false },
            { key: 'notify_new_enrollment', value: 'Yes', isSensitive: false },
            { key: 'notify_assignment_submitted', value: 'No', isSensitive: false }
        ];
        await Setting.insertMany(initialSettings);
        console.log('  → 16 Global Platform Settings initialized.');

        // 11. Institution Seeding
        console.log('Establishing Institutional Nodes...');
        const institutes = await Institute.insertMany([
            { name: 'PrismEd Main Campus', location: 'New Delhi, India', instructors: [instructorDocs[0]._id], students: [studentUser._id] },
            { name: 'Global Tech Academy', location: 'San Francisco, USA', instructors: [instructorDocs[1]._id], students: [] }
        ]);
        console.log(`  → ${institutes.length} Institutes established.`);

        // 12. Fiscal Simulation: Legacy Payments
        console.log('Simulating Fiscal Ingestions...');
        await Payment.insertMany([
            { user: studentUser._id, course: firstCourse._id, amount: 1299, status: 'completed', paymentMethod: 'razorpay', razorpayOrderId: 'order_1' },
            { user: studentUser._id, course: instructorDocs[0]._id, amount: 999, status: 'completed', paymentMethod: 'bank', razorpayOrderId: 'order_2' }
        ]);
        
        // Synchronize Course Enrollment counts
        await Course.findByIdAndUpdate(firstCourse._id, { $addToSet: { enrolledStudents: studentUser._id } });
        console.log('  → Course enrollment synchronized for statistics.');
        console.log('  → Legacy payments ingested for revenue reports.');

    } catch (error) {
        console.error('Seed error:', error.message);
    }
};

export default seedDatabase;
