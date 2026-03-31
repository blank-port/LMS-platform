import axios from 'axios';

const backendUrl = 'http://localhost:5000';
const credentials = {
    admin: { email: 'admin@prismed.com', password: 'admin123' },
    instructor: { email: 'sarah.w@prismed.com', password: 'instructor123' },
    student: { email: 'student@prismed.com', password: 'student123' }
};

const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const verify = async () => {
    try {
        console.log('--- Phase 1: Setup & Registration ---');
        const stamp = Date.now();
        const studentEmail = `student_${stamp}@test.com`;
        
        // Register Student
        await axios.post(`${backendUrl}/api/user/register`, {
            name: 'Test Student',
            email: studentEmail,
            password: 'password123'
        });
        
        // Login as all 3
        const { data: sLogin } = await axios.post(`${backendUrl}/api/user/login`, { email: studentEmail, password: 'password123' });
        const { data: iLogin } = await axios.post(`${backendUrl}/api/user/login`, credentials.instructor);
        const { data: aLogin } = await axios.post(`${backendUrl}/api/user/login`, credentials.admin);
        
        const sToken = sLogin.token;
        const iToken = iLogin.token;
        const aToken = aLogin.token;
        console.log('Tokens acquired.');

        console.log('\n--- Phase 2: Enrollment & Progress ---');
        const { data: courses } = await axios.get(`${backendUrl}/api/course/all`);
        if (courses.courses.length === 0) throw new Error('No courses found to test with.');
        const courseId = courses.courses[0]._id;
        console.log(`Using Course: ${courseId}`);

        // Deposit enough to buy (if needed) or just enroll (if free in local seed)
        await axios.post(`${backendUrl}/api/wallet/deposit`, { amount: 5000, paymentMethod: 'test' }, h(sToken));
        await axios.post(`${backendUrl}/api/course/enroll`, { courseId }, h(sToken));
        console.log('Student enrolled.');

        console.log('\n--- Phase 3: Create & Submit Quiz ---');
        // Create a new quiz for this session
        const { data: qResult } = await axios.post(`${backendUrl}/api/quiz/create`, {
            courseId,
            title: 'Final Mastery Assessment',
            passingScore: 70,
            questions: [
                { questionText: 'Is this a test?', options: ['Yes', 'No'], correctAnswer: 0 },
                { questionText: 'Am I passing?', options: ['Yes', 'No'], correctAnswer: 0 }
            ]
        }, h(iToken));
        const quizId = qResult.quiz._id;
        console.log('Quiz created.');

        const { data: submission } = await axios.post(`${backendUrl}/api/quiz/submit`, {
            quizId,
            answers: [0, 0] // 100% score
        }, h(sToken));

        console.log('Submission Result:', submission.success ? 'PASS' : 'FAIL');
        console.log('isPassed:', submission.result.isPassed);

        console.log('\n--- Phase 4: Instructor Reporting ---');
        const { data: iReport } = await axios.get(`${backendUrl}/api/quiz/reports/unified`, h(iToken));
        const myAttempt = iReport.reports.find(r => r.quizId._id === quizId);
        console.log('Found Attempt in Instructor Report:', myAttempt ? 'YES' : 'NO');
        if (myAttempt) {
            console.log(`- Score: ${myAttempt.percentage}%`);
            console.log(`- Status: ${myAttempt.isPassed ? 'Passed' : 'Failed'}`);
        }

        console.log('\n--- Phase 5: Admin Performance Matrix ---');
        const { data: aReport } = await axios.get(`${backendUrl}/api/admin/scholar-performance`, h(aToken));
        const sPerf = aReport.performance.find(p => p.email === studentEmail);
        console.log('Found Student in Admin Matrix:', sPerf ? 'YES' : 'NO');
        if (sPerf) {
            console.log(`- Avg Score: ${sPerf.avgScore}%`);
            console.log(`- Name: ${sPerf.name}`);
        }

    } catch (error) {
        console.error('Verification Error:', error.response?.data || error.message);
    }
};

verify();
