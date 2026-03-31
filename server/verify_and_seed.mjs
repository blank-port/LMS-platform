import axios from 'axios';

const API = 'http://localhost:5000/api';

const verifyAndSeed = async () => {
    try {
        console.log('🔍 VERIFYING TEST ENVIRONMENT...');

        // 1. Try Admin Login
        let adminToken;
        try {
            const res = await axios.post(`${API}/user/login`, { email: 'admin@prismed.com', password: 'admin123' });
            adminToken = res.data.token;
            console.log('✅ Admin Session Active.');
        } catch (e) {
            console.log('⚠️ Admin missing or invalid. Attempting targeted initialization...');
            // We can't easily register a role 'admin' via public API if there are guards,
            // but for this project, let's see if the server has a hidden way or if we can just re-trigger the seed.
            // Actually, I'll just try to register as admin if the API allows it (usually it doesn't).
            console.log('Trying to register admin account...');
            try {
                // If the system allows role choice (unlikely for admin)
                await axios.post(`${API}/user/register`, { name: 'Admin User', email: 'admin@prismed.com', password: 'admin123', role: 'admin' });
                const res = await axios.post(`${API}/user/login`, { email: 'admin@prismed.com', password: 'admin123' });
                adminToken = res.data.token;
                console.log('✅ Admin Session Initialized.');
            } catch (regErr) {
                console.error('❌ CRITICAL: Could not establish admin context.', regErr.response?.data || regErr.message);
                process.exit(1);
            }
        }

        const ah = { headers: { Authorization: `Bearer ${adminToken}` } };

        // 2. Ensure Category
        console.log('Ensuring categories...');
        const { data: catData } = await axios.get(`${API}/course/categories`);
        if (catData.categories.length === 0) {
            await axios.post(`${API}/admin/categories`, { name: 'General', description: 'Universal Knowledge' }, ah);
            console.log('✅ Category created.');
        }

        console.log('\n--- ENVIRONMENT READY ---');
        process.exit(0);
    } catch (error) {
        console.error('VERIFICATION ERROR:', error.response?.data || error.message);
        process.exit(1);
    }
};

verifyAndSeed();
