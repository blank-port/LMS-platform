import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API = 'http://localhost:5000';

const seed = async () => {
    try {
        console.log('--- STRATEGIC API SEEDING ---');

        // 1. Admin Login
        const { data: adminLogin } = await axios.post(`${API}/api/user/login`, { email: 'admin@prismed.com', password: 'admin123' });
        const adminToken = adminLogin.token;
        const ah = { headers: { Authorization: `Bearer ${adminToken}` } };
        console.log('Admin Active.');

        // 2. Register/Login Instructor
        let instructorToken;
        try {
            const { data } = await axios.post(`${API}/api/user/login`, { email: 'inst@test.com', password: 'password123' });
            instructorToken = data.token;
        } catch (e) {
            await axios.post(`${API}/api/user/register`, { name: 'Expert Instructor', email: 'inst@test.com', password: 'password123', role: 'instructor' });
            const { data } = await axios.post(`${API}/api/user/login`, { email: 'inst@test.com', password: 'password123' });
            instructorToken = data.token;
        }
        const ih = { headers: { Authorization: `Bearer ${instructorToken}` } };
        console.log('Instructor Ready.');

        // 3. Register/Login Student
        let studentToken;
        try {
            const { data } = await axios.post(`${API}/api/user/login`, { email: 'stud@test.com', password: 'password123' });
            studentToken = data.token;
        } catch (e) {
            await axios.post(`${API}/api/user/register`, { name: 'Active Scholar', email: 'stud@test.com', password: 'password123', role: 'student' });
            const { data } = await axios.post(`${API}/api/user/login`, { email: 'stud@test.com', password: 'password123' });
            studentToken = data.token;
        }
        const sh = { headers: { Authorization: `Bearer ${studentToken}` } };
        console.log('Student Active.');

        // 4. Fund Student Wallet
        await axios.post(`${API}/api/wallet/deposit`, { amount: 5000, paymentMethod: 'Strategic Seed' }, sh);
        console.log('Student Wallet Funded (₹5000).');

        // 5. Create Category if needed
        let catId;
        const { data: cats } = await axios.get(`${API}/api/course/categories`);
        if (cats.categories.length === 0) {
            const { data: newCat } = await axios.post(`${API}/api/admin/categories`, { name: 'Strategic Intelligence', description: 'Advanced Cognitive Defense' }, ah);
            catId = newCat.category._id;
        } else {
            catId = cats.categories[0]._id;
        }

        // 6. Create 2 Courses
        const courseTitles = ["Advanced React Architecture", "Cognitive Data Science"];
        for (const title of courseTitles) {
            const form = new FormData();
            form.append('courseData', JSON.stringify({
                courseTitle: title,
                courseDescription: `Deep dive into ${title}`,
                coursePrice: 999,
                category: catId,
                courseContent: [{
                    chapterId: 1,
                    chapterTitle: "Induction",
                    chapterOrder: 1,
                    chapterContent: [{
                        lectureId: 1,
                        lectureTitle: "Protocol Overview",
                        lectureDuration: 10,
                        lectureUrl: "https://vimeo.com/123",
                        isPreviewFree: true,
                        lectureOrder: 1
                    }]
                }]
            }));
            
            // Note: In local env, we might not have a real file, so we skip or use a dummy
            // If multer is strict, we need to pass something. Let's try without first.
            
            const { data: cRes } = await axios.post(`${API}/api/instructor/add-course`, form, {
                headers: { ...ih.headers, ...form.getHeaders() }
            });
            console.log(`Course Created: ${title}`);
        }

        // 7. Approve Courses & Enroll
        const { data: coursesData } = await axios.get(`${API}/api/admin/courses`, ah);
        for (const course of coursesData.courses) {
            if (course.status === 'pending') {
                await axios.put(`${API}/api/admin/courses/${course._id}/status`, { status: 'approved' }, ah);
                console.log(`Approved: ${course.courseTitle}`);
            }
            // Enroll student
            try {
                await axios.post(`${API}/api/payment/buy-wallet`, { courseId: course._id }, sh);
                console.log(`Enrolled & Paid: ${course.courseTitle}`);
            } catch (e) {
                // Already enrolled likely
                console.log(`Enrollment Note: ${e.response?.data?.message || e.message}`);
            }
        }

        console.log('\n--- DATA SEEDING SUCCESSFUL ---');
        process.exit(0);
    } catch (error) {
        console.error('SEED ERROR:', error.response?.data || error.message);
        process.exit(1);
    }
};

seed();
