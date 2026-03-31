/**
 * ============================================================
 *  PrismEd LMS — End-to-End Multi-Role Lifecycle Test
 * ============================================================
 * 
 * This script exercises the FULL user journey via API calls:
 *   Instructor ➜ Student ➜ Admin
 * 
 * Run:  node e2e-test.js
 * Requires: Server running at http://localhost:5000
 * ============================================================
 */

const BASE = 'http://localhost:5000/api';
let passed = 0;
let failed = 0;
const results = [];

// ─── Helpers ───────────────────────────────────────────────

async function api(method, path, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json();
    return data;
}

function assert(label, condition) {
    if (condition) {
        passed++;
        results.push({ step: label, status: '✅ PASS' });
        console.log(`  ✅ ${label}`);
    } else {
        failed++;
        results.push({ step: label, status: '❌ FAIL' });
        console.log(`  ❌ ${label}`);
    }
}

// ─── Test Flow ─────────────────────────────────────────────

async function runTest() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   PrismEd LMS — End-to-End Lifecycle Test            ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    // ════════════ STEP 1: LOGIN ALL USERS ════════════
    console.log('📋 STEP 1: Authenticating all users...');

    const instructorLogin = await api('POST', '/user/login', {
        email: 'sarah.w@prismed.com', password: 'instructor123'
    });
    assert('Instructor login', instructorLogin.success && instructorLogin.token);
    const instructorToken = instructorLogin.token;

    const studentLogin = await api('POST', '/user/login', {
        email: 'student@prismed.com', password: 'student123'
    });
    assert('Student login', studentLogin.success && studentLogin.token);
    const studentToken = studentLogin.token;

    const adminLogin = await api('POST', '/user/login', {
        email: 'admin@prismed.com', password: 'admin123'
    });
    assert('Admin login', adminLogin.success && adminLogin.token);
    const adminToken = adminLogin.token;

    // ════════════ STEP 2: GET COURSES ════════════
    console.log('\n📋 STEP 2: Fetching available courses...');

    const coursesRes = await api('GET', '/course/all');
    assert('Courses fetched', coursesRes.success && coursesRes.courses.length > 0);

    // Find the Full-Stack course (the one with 3 lessons and a quiz)
    const targetCourse = coursesRes.courses.find(c => c.courseTitle.includes('Full-Stack')) || coursesRes.courses[0];
    const courseId = targetCourse._id;
    console.log(`  → Target course: "${targetCourse.courseTitle}" (₹${targetCourse.coursePrice})`);

    // ════════════ STEP 3: VERIFY STUDENT WALLET ════════════
    console.log('\n📋 STEP 3: Verifying student wallet...');

    const studentData = await api('GET', '/user/data', null, studentToken);
    assert('Student has wallet balance', studentData.success && studentData.user.walletBalance >= 10000);
    console.log(`  → Student wallet: ₹${studentData.user.walletBalance}`);

    // ════════════ STEP 4: PURCHASE COURSE ════════════
    console.log('\n📋 STEP 4: Student purchasing course via wallet...');

    const enrollRes = await api('POST', '/course/enroll', { courseId }, studentToken);
    if (!enrollRes.success) {
        console.log(`  ⚠️  Enrollment response: ${JSON.stringify(enrollRes)}`);
    }
    assert('Course enrolled via wallet', enrollRes.success || enrollRes.message === 'Already enrolled in this course');

    // Verify enrollment exists
    const enrolledRes = await api('GET', '/course/enrolled/my-courses', null, studentToken);
    assert('Enrollment appears in my-courses', enrolledRes.success && enrolledRes.enrollments.length > 0);
    console.log(`  → Enrolled courses: ${enrolledRes.enrollments.length}`);

    // ════════════ STEP 5: GET FULL COURSE CONTENT ════════════
    console.log('\n📋 STEP 5: Accessing full course content...');

    const fullCourse = await api('GET', `/course/full/${courseId}`, null, studentToken);
    assert('Full course content accessible', fullCourse.success && fullCourse.courseData);

    // Collect all lesson IDs
    const lessonIds = [];
    if (fullCourse.courseData && fullCourse.courseData.courseContent) {
        fullCourse.courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lesson => {
                lessonIds.push(lesson._id);
            });
        });
    }
    console.log(`  → Total lessons found: ${lessonIds.length}`);
    assert('Course has 3 lessons', lessonIds.length === 3);

    // ════════════ STEP 6: COMPLETE ALL LESSONS ════════════
    console.log('\n📋 STEP 6: Student completing all lessons...');

    for (let i = 0; i < lessonIds.length; i++) {
        const progressRes = await api('POST', '/course/progress/update', {
            courseId,
            lessonId: lessonIds[i],
            markAsComplete: true,
            lastWatchedTime: 300
        }, studentToken);
        assert(`Lesson ${i + 1} completed (progress: ${progressRes.enrollment?.progress}%)`, progressRes.success);
    }

    // Verify 100% progress
    const progressCheck = await api('GET', `/course/progress/${courseId}`, null, studentToken);
    assert('Course progress = 100%', progressCheck.success && progressCheck.enrollment?.progress === 100);
    assert('Course marked completed', progressCheck.enrollment?.completed === true);

    // ════════════ STEP 7: ATTEMPT QUIZ ════════════
    console.log('\n📋 STEP 7: Student attempting quiz...');

    const quizzesRes = await api('GET', `/quiz/course/${courseId}`, null, studentToken);
    assert('Quiz available for course', quizzesRes.success && quizzesRes.quizzes.length > 0);

    const quizId = quizzesRes.quizzes[0]._id;
    console.log(`  → Quiz: "${quizzesRes.quizzes[0].title}"`);

    // Submit correct answers (all correct = indices 0, 2, 2, 0, 2)
    const quizSubmit = await api('POST', '/quiz/submit', {
        quizId,
        answers: [0, 2, 2, 0, 2]
    }, studentToken);
    assert('Quiz submitted successfully', quizSubmit.success);
    assert('Quiz passed', quizSubmit.result?.isPassed === true);
    assert('Quiz score = 100%', quizSubmit.result?.percentage === 100);
    console.log(`  → Score: ${quizSubmit.result?.score}/${quizSubmit.result?.totalQuestions} (${quizSubmit.result?.percentage}%)`);

    // ════════════ STEP 8: CREATE SUPPORT TICKET ════════════
    console.log('\n📋 STEP 8: Student creating support ticket...');

    const ticketRes = await api('POST', '/support/create', {
        subject: 'Certificate Request for Completed Course',
        category: 'content',
        priority: 'medium',
        description: 'I have completed the Full-Stack Web Development course and passed the quiz. Please issue my certificate.'
    }, studentToken);
    assert('Support ticket created', ticketRes.success);

    // Verify ticket appears in list
    const ticketsRes = await api('GET', '/support/my-tickets', null, studentToken);
    assert('Ticket appears in my-tickets', ticketsRes.success && ticketsRes.tickets.length > 0);

    // ════════════ STEP 9: INSTRUCTOR VERIFICATION ════════════
    console.log('\n📋 STEP 9: Instructor verifying student activity...');

    // Instructor views quiz attempts
    const instQuizAttempts = await api('GET', `/quiz/attempts/${quizId}`, null, instructorToken);
    assert('Instructor sees quiz attempts', instQuizAttempts.success && instQuizAttempts.attempts.length > 0);
    console.log(`  → Quiz attempts visible: ${instQuizAttempts.attempts.length}`);

    // Instructor views quiz reports
    const instReports = await api('GET', '/quiz/reports/unified', null, instructorToken);
    assert('Instructor sees unified quiz reports', instReports.success && instReports.reports.length > 0);

    // ════════════ STEP 10: ADMIN VERIFICATION ════════════
    console.log('\n📋 STEP 10: Admin verifying platform activity...');

    // Admin views quiz reports
    const adminReports = await api('GET', '/quiz/reports/unified', null, adminToken);
    assert('Admin sees quiz reports', adminReports.success && adminReports.reports.length > 0);

    // Admin views dashboard stats (includes total enrollments)
    const adminDashboard = await api('GET', '/admin/dashboard', null, adminToken);
    assert('Admin dashboard loads', adminDashboard.success && adminDashboard.stats);
    assert('Admin sees enrollments in stats', adminDashboard.stats?.totalEnrollments > 0);
    console.log(`  → Total enrollments: ${adminDashboard.stats?.totalEnrollments}`);
    console.log(`  → Total students: ${adminDashboard.stats?.totalStudents}`);
    console.log(`  → Total courses: ${adminDashboard.stats?.totalCourses}`);

    // Admin views all courses
    const adminCourses = await api('GET', '/admin/courses', null, adminToken);
    assert('Admin sees all courses', adminCourses.success && adminCourses.courses.length > 0);

    // Admin views student performance (quiz analytics)
    const scholarPerf = await api('GET', '/quiz/reports/unified', null, adminToken);
    assert('Admin sees student quiz analytics', scholarPerf.success && scholarPerf.reports.length > 0);


    // ════════════ STEP 11: VERIFY WALLET DEDUCTION ════════════
    console.log('\n📋 STEP 11: Verifying financial integrity...');

    const finalStudentData = await api('GET', '/user/data', null, studentToken);
    const expectedBalance = 10000 - targetCourse.coursePrice;
    assert('Wallet deducted correctly', finalStudentData.success && finalStudentData.user.walletBalance <= expectedBalance + 1);
    console.log(`  → Final wallet: ₹${finalStudentData.user.walletBalance} (expected ~₹${expectedBalance})`);

    // Wallet transaction history
    const walletDetails = await api('GET', '/wallet/details', null, studentToken);
    assert('Wallet transaction history available', walletDetails.success);

    // ════════════ FINAL REPORT ════════════
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║                  TEST REPORT                         ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`\n  Total:  ${passed + failed}`);
    console.log(`  Passed: ${passed} ✅`);
    console.log(`  Failed: ${failed} ❌`);
    console.log(`  Rate:   ${Math.round((passed / (passed + failed)) * 100)}%\n`);

    if (failed === 0) {
        console.log('  🎉 ALL TESTS PASSED — Full lifecycle validated!\n');
        console.log('  Flow verified:');
        console.log('  Student Login → Wallet → Purchase → Lessons → Quiz → Support');
        console.log('  Instructor Login → Quiz Reports → Student Tracking');
        console.log('  Admin Login → Enrollments → Payments → Analytics\n');
    } else {
        console.log('  ⚠️  Some tests failed. Review the output above.\n');
    }

    // Return summary table
    console.log('┌─────────────────────────────────────────────────┬────────┐');
    console.log('│ Step                                            │ Status │');
    console.log('├─────────────────────────────────────────────────┼────────┤');
    results.forEach(r => {
        const step = r.step.padEnd(47);
        console.log(`│ ${step} │ ${r.status}  │`);
    });
    console.log('└─────────────────────────────────────────────────┴────────┘');
}

runTest().catch(err => {
    console.error('\n❌ Test script crashed:', err.message);
    process.exit(1);
});
