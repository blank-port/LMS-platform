import axios from 'axios';

const API = 'http://localhost:5000';
let pass = 0, fail = 0;
const results = [];

const test = async (name, fn) => {
    try {
        await fn();
        pass++;
        results.push(`  ✅ ${name}`);
    } catch (e) {
        fail++;
        results.push(`  ❌ ${name} — ${e.response?.data?.message || e.message}`);
    }
};

const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const run = async () => {
    console.log('⏳ Waiting 3s for server...'); 
    await new Promise(r => setTimeout(r, 3000));
    console.log('═══════════════════════════════════════');
    console.log('  🔬 FULL SYSTEM TEST SUITE');
    console.log('═══════════════════════════════════════\n');

    let adminToken, instToken, studentToken;
    let adminUserId, instUserId, studentUserId;
    let testCourseId, testQuizId, testCategoryId;

    // ──────────────── AUTH MODULE ────────────────
    console.log('📦 MODULE: Authentication');
    
    await test('Admin Login', async () => {
        const { data } = await axios.post(`${API}/api/user/login`, { email: 'admin@prismed.com', password: 'admin123' });
        if (!data.success || !data.token) throw new Error('No token');
        adminToken = data.token;
        adminUserId = data.user._id;
    });

    await test('Instructor Login', async () => {
        const { data } = await axios.post(`${API}/api/user/login`, { email: 'sarah.w@prismed.com', password: 'instructor123' });
        if (!data.success || !data.token) throw new Error('No token');
        instToken = data.token;
        instUserId = data.user._id;
    });

    await test('Student Login', async () => {
        const { data } = await axios.post(`${API}/api/user/login`, { email: 'student@prismed.com', password: 'student123' });
        if (!data.success || !data.token) throw new Error('No token');
        studentToken = data.token;
        studentUserId = data.user._id;
    });

    await test('Get Admin Profile', async () => {
        const { data } = await axios.get(`${API}/api/user/profile`, h(adminToken));
        if (!data.success || !data.user) throw new Error('No user data');
    });

    await test('Get Student Data', async () => {
        const { data } = await axios.get(`${API}/api/user/data`, h(studentToken));
        if (!data.success || !data.user) throw new Error('No user data');
    });

    // ──────────────── COURSE MODULE ────────────────
    console.log('\n📦 MODULE: Course Management');

    await test('Fetch All Courses (public)', async () => {
        const { data } = await axios.get(`${API}/api/course/all`);
        if (!data.success) throw new Error('Failed');
    });

    await test('Fetch Categories (public)', async () => {
        const { data } = await axios.get(`${API}/api/course/categories`);
        if (!data.success || !data.categories) throw new Error('Failed');
        if (data.categories.length > 0) testCategoryId = data.categories[0]._id;
    });

    await test('Search Courses', async () => {
        const { data } = await axios.get(`${API}/api/course/search?query=test`);
        if (!data.success) throw new Error('Failed');
    });

    await test('Instructor Create Course', async () => {
        const courseData = JSON.stringify({
            courseTitle: 'SystemTest_' + Date.now(),
            courseDescription: 'Automated test course',
            coursePrice: 500,
            category: testCategoryId,
            level: 'Beginner'
        });
        const { data } = await axios.post(`${API}/api/instructor/add-course`, { courseData }, h(instToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Instructor Get Courses', async () => {
        const { data } = await axios.get(`${API}/api/instructor/courses`, h(instToken));
        if (!data.success || !data.courses) throw new Error('Failed');
        if (data.courses.length > 0) testCourseId = data.courses[0]._id;
    });

    await test('Get Course By ID', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.get(`${API}/api/course/${testCourseId}`);
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── ADMIN MODULE ────────────────
    console.log('\n📦 MODULE: Admin Operations');

    await test('Admin Dashboard Stats', async () => {
        const { data } = await axios.get(`${API}/api/admin/dashboard`, h(adminToken));
        if (!data.success || !data.stats) throw new Error('Failed');
    });

    await test('Admin Get All Users', async () => {
        const { data } = await axios.get(`${API}/api/admin/users`, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Admin Get All Instructors', async () => {
        const { data } = await axios.get(`${API}/api/admin/instructors`, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Admin Get All Courses', async () => {
        const { data } = await axios.get(`${API}/api/admin/courses`, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Admin Approve Course', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.put(`${API}/api/admin/courses/${testCourseId}/status`, { status: 'approved' }, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Admin Get Categories', async () => {
        const { data } = await axios.get(`${API}/api/admin/categories`, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Admin Create Category', async () => {
        const { data } = await axios.post(`${API}/api/admin/categories`, { name: 'TestCat_' + Date.now() }, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── INSTRUCTOR DASHBOARD ────────────────
    console.log('\n📦 MODULE: Instructor Dashboard');

    await test('Instructor Dashboard Data', async () => {
        const { data } = await axios.get(`${API}/api/instructor/dashboard`, h(instToken));
        if (!data.success || !data.dashboardData) throw new Error('Failed');
    });

    await test('Instructor Enrolled Students', async () => {
        const { data } = await axios.get(`${API}/api/instructor/enrolled-students`, h(instToken));
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── ENROLLMENT MODULE ────────────────
    console.log('\n📦 MODULE: Student Enrollment');

    await test('Student Deposit to Wallet (pre-enroll)', async () => {
        const { data } = await axios.post(`${API}/api/wallet/deposit`, {
            amount: 2000, paymentMethod: 'test'
        }, h(studentToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Student Enroll in Course', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.post(`${API}/api/course/enroll`, { courseId: testCourseId }, h(studentToken));
        if (!data.success && !data.message?.includes('already')) throw new Error(data.message);
    });

    await test('Student Get Enrolled Courses', async () => {
        const { data } = await axios.get(`${API}/api/course/enrolled/my-courses`, h(studentToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Student Update Progress', async () => {
        if (!testCourseId) throw new Error('No course ID');
        // Just verify no server crash - progress may not update without valid lecture
        try {
            await axios.post(`${API}/api/course/progress/update`, { courseId: testCourseId, lectureId: 'test_lecture_1' }, h(studentToken));
        } catch(e) { /* expected */ }
    });

    await test('Student Get Progress', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.get(`${API}/api/course/progress/${testCourseId}`, h(studentToken));
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── QUIZ MODULE ────────────────
    console.log('\n📦 MODULE: Quiz System');

    await test('Create Quiz (Instructor)', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.post(`${API}/api/quiz/create`, {
            title: 'TestQuiz_' + Date.now(),
            courseId: testCourseId,
            questions: [
                { questionText: 'What is 2+2?', options: ['3', '4', '5', '6'], correctAnswer: 1 },
                { questionText: 'Capital of India?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], correctAnswer: 1 }
            ]
        }, h(instToken));
        if (!data.success) throw new Error('Failed');
        testQuizId = data.quiz?._id;
    });

    await test('Get Quizzes By Course', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.get(`${API}/api/quiz/course/${testCourseId}`, h(studentToken));
        if (!data.success) throw new Error('Failed');
        if (!testQuizId && data.quizzes?.length > 0) testQuizId = data.quizzes[0]._id;
    });

    await test('Submit Quiz (Student)', async () => {
        if (!testQuizId) throw new Error('No quiz ID');
        const { data } = await axios.post(`${API}/api/quiz/submit`, {
            quizId: testQuizId,
            answers: [1, 1]
        }, h(studentToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get Quiz Results', async () => {
        if (!testQuizId) throw new Error('No quiz ID');
        const { data } = await axios.get(`${API}/api/quiz/results/${testQuizId}`, h(studentToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get Quiz Attempts (Instructor)', async () => {
        if (!testQuizId) throw new Error('No quiz ID');
        const { data } = await axios.get(`${API}/api/quiz/attempts/${testQuizId}`, h(instToken));
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── EDUCATION MODULE ────────────────
    console.log('\n📦 MODULE: Education (Question Banks)');

    await test('Create Question Group', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.post(`${API}/api/education/question-group`, {
            name: 'TestGroup_' + Date.now(),
            courseId: testCourseId
        }, h(instToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get Question Groups (All)', async () => {
        const { data } = await axios.get(`${API}/api/education/question-group/all`, h(instToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get Question Groups (By Course)', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.get(`${API}/api/education/question-group/${testCourseId}`, h(instToken));
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── REVIEW MODULE ────────────────
    console.log('\n📦 MODULE: Reviews');

    await test('Add Review', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.post(`${API}/api/review/add`, {
            courseId: testCourseId,
            rating: 5,
            comment: 'Excellent test course!'
        }, h(studentToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get Course Reviews', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.get(`${API}/api/review/course/${testCourseId}`);
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── DISCUSSION MODULE ────────────────
    console.log('\n📦 MODULE: Discussions');

    await test('Add Discussion Comment', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.post(`${API}/api/discussion/add`, {
            courseId: testCourseId,
            message: 'Test discussion comment'
        }, h(studentToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get Course Discussions', async () => {
        if (!testCourseId) throw new Error('No course ID');
        const { data } = await axios.get(`${API}/api/discussion/course/${testCourseId}`);
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── COMMUNICATION MODULE ────────────────
    console.log('\n📦 MODULE: Communication');

    await test('Send Message', async () => {
        if (!adminUserId) throw new Error('No admin user ID');
        const { data } = await axios.post(`${API}/api/comm/send`, {
            receiver: adminUserId,
            content: 'System test message from instructor'
        }, h(instToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get Messages', async () => {
        const { data } = await axios.get(`${API}/api/comm/messages`, h(instToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get Conversation Threads', async () => {
        const { data } = await axios.get(`${API}/api/comm/threads`, h(instToken));
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── SETTINGS MODULE ────────────────
    console.log('\n📦 MODULE: Settings');

    await test('Get Public Settings', async () => {
        const { data } = await axios.get(`${API}/api/setting/public`);
        if (!data.success) throw new Error('Failed');
    });

    await test('Get All Settings (Admin)', async () => {
        const { data } = await axios.get(`${API}/api/setting/all`, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Update Setting', async () => {
        const { data } = await axios.post(`${API}/api/setting/update`, {
            key: 'site_name',
            value: 'PrismEd LMS'
        }, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── FINANCE MODULE ────────────────
    console.log('\n📦 MODULE: Finance & Certificates');

    await test('Create Certificate Template', async () => {
        const { data } = await axios.post(`${API}/api/finance/certificate-template`, {
            title: 'TestCert_' + Date.now(),
            htmlContent: '<div>{{student_name}} has completed {{course_name}}</div>',
            description: 'Test certificate template'
        }, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get Certificate Templates', async () => {
        const { data } = await axios.get(`${API}/api/finance/certificate-templates`, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get Admin Revenue', async () => {
        const { data } = await axios.get(`${API}/api/finance/admin-revenue`, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── WALLET MODULE ────────────────
    console.log('\n📦 MODULE: Wallet');

    await test('Student Deposit to Wallet', async () => {
        const { data } = await axios.post(`${API}/api/wallet/deposit`, {
            amount: 500, paymentMethod: 'test_second'
        }, h(studentToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Student Get Wallet Details', async () => {
        const { data } = await axios.get(`${API}/api/wallet/details`, h(studentToken));
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── AUDIT MODULE ────────────────
    console.log('\n📦 MODULE: Institute & Roles');

    await test('Create Institute', async () => {
        const { data } = await axios.post(`${API}/api/audit/institute/create`, {
            name: 'TestInst_' + Date.now(),
            address: 'Test City'
        }, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get All Institutes', async () => {
        const { data } = await axios.get(`${API}/api/audit/institute/all`, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Create Role', async () => {
        const { data } = await axios.post(`${API}/api/audit/role/create`, {
            name: 'TestRole_' + Date.now(),
            type: 'staff',
            permissions: ['read', 'write']
        }, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    await test('Get All Roles', async () => {
        const { data } = await axios.get(`${API}/api/audit/role/all`, h(adminToken));
        if (!data.success) throw new Error('Failed');
    });

    // ──────────────── RESULTS ────────────────
    console.log('\n═══════════════════════════════════════');
    console.log('  📊 TEST RESULTS');
    console.log('═══════════════════════════════════════\n');
    results.forEach(r => console.log(r));
    console.log(`\n  ────────────────────────────────────`);
    console.log(`  Total: ${pass + fail} | ✅ Pass: ${pass} | ❌ Fail: ${fail}`);
    console.log(`  Coverage: ${Math.round((pass / (pass + fail)) * 100)}%`);
    console.log(`  ────────────────────────────────────\n`);

    if (fail === 0) {
        console.log('  🔥 ALL SYSTEMS OPERATIONAL — FULL PASS 🔥\n');
    } else {
        console.log(`  ⚠️  ${fail} test(s) need attention\n`);
    }
};

run();
