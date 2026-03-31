import axios from 'axios';

const API = 'http://localhost:5000';
const adminCreds = { email: 'admin@prismed.com', password: 'admin123' };

const h = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const runTest = async () => {
    try {
        console.log('🔬 STARTING REPORT SYSTEM TEST\n');
        
        const { data: login } = await axios.post(`${API}/api/user/login`, adminCreds);
        const token = login.token;
        console.log('✅ Admin Auth Passed.');

        // 1. Admin Revenue
        console.log('\nTesting: Admin Revenue Report...');
        const response = await axios.get(`${API}/api/finance/admin-revenue`, h(token));
        const adminRev = response.data;
        console.log('DEBUG: Received Admin Revenue Response:', JSON.stringify(adminRev, null, 2));

        if (adminRev.success && adminRev.report) {
            console.log(`✅ Success. Total Revenue: ₹${adminRev.report.totalRevenue}`);
        } else {
            console.log('DEBUG: Condition Failed. adminRev.success:', adminRev.success, 'adminRev.report:', !!adminRev.report);
            throw new Error('Failed Admin Rev');
        }

        // 2. Instructor Revenue
        console.log('Testing: Instructor Revenue Report...');
        const { data: instRev } = await axios.get(`${API}/api/finance/instructor-revenue`, h(token));
        if (instRev.success && instRev.report) {
            console.log(`✅ Success. Instructor Share: ₹${instRev.report.instructorShare}`);
        } else throw new Error('Failed Instructor Rev');

        // 3. Course Stats
        console.log('Testing: Course Popularity Stats...');
        const { data: courseStats } = await axios.get(`${API}/api/course/popularity-stats`, h(token));
        if (courseStats.success && courseStats.stats.length >= 0) {
            console.log(`✅ Success. Found ${courseStats.stats.length} curriculum data points.`);
        } else throw new Error('Failed Course Stats');

        // 4. Institution Reports
        console.log('Testing: Institution Benchmarking...');
        const { data: instStats } = await axios.get(`${API}/api/audit/institute/all`, h(token));
        if (instStats.success && instStats.institutes.length >= 0) {
            console.log(`✅ Success. Analyzed ${instStats.institutes.length} institutional nodes.`);
        } else throw new Error('Failed Institution Stats');

        // 5. Payments Ledger
        console.log('Testing: Global Payments Ledger...');
        const { data: payments } = await axios.get(`${API}/api/finance/payments`, h(token));
        if (payments.success && payments.data.length >= 0) {
            console.log(`✅ Success. Ledger contains ${payments.data.length} transactions.`);
        } else throw new Error('Failed Payments Ledger');

        console.log('\n🔥 ALL REPORTING SYSTEMS OPERATIONAL — FULL PASS 🔥');

    } catch (e) {
        console.error('\n❌ TEST FAILED:', e.response?.data?.message || e.message);
        if (e.response) console.error('Response Data:', JSON.stringify(e.response.data, null, 2));
    }
};

runTest();
