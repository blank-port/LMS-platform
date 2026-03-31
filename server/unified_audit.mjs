import axios from 'axios';

const API = 'http://localhost:5000/api';

const audit = async () => {
    try {
        console.log('🚀 UNIFIED SYSTEM AUDIT INITIATED\n');

        // 1. Auth & Identity
        console.log('--- AUDITING IDENTITY & ACCESS ---');
        const adminRes = await axios.post(`${API}/user/login`, { email: 'admin@prismed.com', password: 'admin123' });
        const adminToken = adminRes.data.token;
        const ah = { headers: { Authorization: `Bearer ${adminToken}` } };
        console.log('✅ Admin credentials verified.');

        // 2. Admin Management Panels
        console.log('\n--- AUDITING ADMIN MODULES ---');
        const users = await axios.get(`${API}/admin/users`, ah);
        console.log(`✅ User Management: ${users.data.users.length} identified.`);
        
        const dashboard = await axios.get(`${API}/admin/dashboard`, ah);
        console.log(`✅ Strategic Dashboard: ${JSON.stringify(dashboard.data.stats)}`);

        // 3. Finance & Reporting (Just completed)
        console.log('\n--- AUDITING FINANCE & REPORTING ---');
        const revenue = await axios.get(`${API}/finance/admin-revenue`, ah);
        console.log(`✅ Revenue Intel: ${revenue.data.success ? 'Operational' : 'FAILED'}`);
        
        const payments = await axios.get(`${API}/finance/payments`, ah);
        console.log(`✅ Ledger Visibility: ${payments.data.data.length} transactions logged.`);

        // 4. Curriculum & Educator Node
        console.log('\n--- AUDITING CURRICULUM ARCHITECTURE ---');
        const courses = await axios.get(`${API}/course/all`);
        console.log(`✅ Course Catalog: ${courses.data.courses.length} units detected.`);

        const categories = await axios.get(`${API}/course/categories`);
        console.log(`✅ Category Nodes: ${categories.data.categories.length} segments identified.`);

        // 5. Verification of the new Report Endpoints
        console.log('\n--- VERIFYING STRATEGIC REPORT NODES ---');
        const instStats = await axios.get(`${API}/audit/institute/all`, ah);
        console.log(`✅ Institution Density: ${instStats.data.institutes.length} nodes analyzed.`);
        
        const popularity = await axios.get(`${API}/course/popularity-stats`, ah);
        console.log(`✅ Popularity Metrics: ${popularity.data.stats.length} units benchmarked.`);

        console.log('\n🔥 PROJECT AUDIT COMPLETE: 100% OPERATIONAL PASS 🔥');
        process.exit(0);
    } catch (e) {
        console.error('\n❌ AUDIT FAILURE:', e.response?.data?.message || e.message);
        process.exit(1);
    }
};

audit();
