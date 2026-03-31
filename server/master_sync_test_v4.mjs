import axios from 'axios';

const backendUrl = 'http://localhost:5000';

const runMasterTest = async () => {
    console.log('--- Ensuring Server Stabilization (3s) ---');
    await new Promise(r => setTimeout(r, 3000));

    try {
        console.log('--- MASTER SYNC PROTOCOL STARTED ---');

        // 1. INSTRUCTOR
        const instLogin = await axios.post(`${backendUrl}/api/user/login`, {
            email: 'sarah.w@prismed.com',
            password: 'instructor123'
        });
        const instH = { headers: { Authorization: `Bearer ${instLogin.data.token}` } };
        console.log('✅ Instructor Authenticated');

        const cats = await axios.get(`${backendUrl}/api/course/categories`, instH);
        const catId = cats.data.categories[0]._id;
        
        const title = 'Final Sync Integrity Check v7';
        const cData = JSON.stringify({
            courseTitle: title,
            courseDescription: 'End-to-end data flow validation.',
            coursePrice: 1000,
            category: catId,
            level: 'Advanced'
        });
        await axios.post(`${backendUrl}/api/instructor/add-course`, { courseData: cData }, instH);
        
        const instCourses = await axios.get(`${backendUrl}/api/instructor/courses`, instH);
        const courseId = instCourses.data.courses[0]._id;
        console.log('✅ Course Drafted (ID:', courseId, ')');

        // 2. ADMIN
        const adminLogin = await axios.post(`${backendUrl}/api/user/login`, {
            email: 'admin@prismed.com',
            password: 'admin123'
        });
        const adminH = { headers: { Authorization: `Bearer ${adminLogin.data.token}` } };
        console.log('✅ Admin Authenticated');

        await axios.put(`${backendUrl}/api/admin/courses/${courseId}/status`, { status: 'approved' }, adminH);
        console.log('✅ Admin Approved Course');

        // 3. STUDENT
        const studentLogin = await axios.post(`${backendUrl}/api/user/login`, {
            email: 'student@prismed.com',
            password: 'student123'
        });
        const studentH = { headers: { Authorization: `Bearer ${studentLogin.data.token}` } };
        console.log('✅ Student Authenticated');

        await axios.post(`${backendUrl}/api/wallet/deposit`, { amount: 2000, paymentMethod: 'master_sync_test' }, studentH);
        console.log('✅ Student Deposited ₹2,000');

        await axios.post(`${backendUrl}/api/course/enroll`, { courseId: courseId }, studentH);
        console.log('✅ Student Enrolled Successfully');

        // 4. VERIFICATION
        console.log('--- Performing Cross-Panel Audit ---');
        await new Promise(r => setTimeout(r, 1000)); 

        const instDash = await axios.get(`${backendUrl}/api/instructor/dashboard`, instH);
        const enrollment = instDash.data.dashboardData.enrolledStudentsData.find(e => e.courseTitle === title);
        
        if (enrollment) {
            console.log('🔥🔥 MASTER SYNC SUCCESS: Data integrity verified! 🔥🔥');
        } else {
            console.log('❌ SYNC FAILURE: Could not find enrollment in Instructor Dashboard.');
            console.log('Available Enrollments:', instDash.data.dashboardData.enrolledStudentsData.map(e => e.courseTitle));
        }

        console.log('--- MASTER SYNC PROTOCOL COMPLETED ---');
    } catch (error) {
        console.error('❌ Sync Failure:', error.response?.data || error.message);
    }
};

runMasterTest();
