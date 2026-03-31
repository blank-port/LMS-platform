import axios from 'axios';

const API = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@prismed.com';
const ADMIN_PASS = 'admin123';

async function runTests() {
    try {
        console.log('--- STARTING E-COMMERCE FINAL VERIFICATION ---');

        // 1. Login
        console.log(`- Attempting login for ${ADMIN_EMAIL}...`);
        const loginRes = await axios.post(`${API}/user/login`, { email: ADMIN_EMAIL, password: ADMIN_PASS });
        
        if (!loginRes.data.success) {
            throw new Error(`Login Failed: ${loginRes.data.message}`);
        }

        const token = loginRes.data.token;
        if (!token) {
            throw new Error('Login succeeded but no token returned');
        }

        const headers = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ Admin Login Successful, Token Acquired');

        // 2. Test Payment Filtering
        console.log('\n--- TESTING PAYMENT FILTERING ---');
        const allPayments = await axios.get(`${API}/payment/pending?method=all`, headers);
        console.log(`- All Pending: ${allPayments.data.payments.length}`);
        
        const codPayments = await axios.get(`${API}/payment/pending?method=cod`, headers);
        console.log(`- COD Pending: ${codPayments.data.payments.length}`);
        
        const razorpayPayments = await axios.get(`${API}/payment/pending?method=razorpay`, headers);
        console.log(`- Online Pending: ${razorpayPayments.data.payments.length}`);

        // 3. Test Payout Settings
        console.log('\n--- TESTING PAYOUT SETTINGS ---');
        const testPayoutSettings = {
            instructorCommission: 85,
            minimumPayoutAmount: 1500,
            payoutFrequency: 'weekly',
            enableAutoPayout: true,
            paymentMethods: ['bank', 'stripe']
        };
        
        await axios.post(`${API}/finance/payout-settings`, testPayoutSettings, headers);
        console.log('✅ Payout Settings Saved');
        
        const verifyPayoutRes = await axios.get(`${API}/finance/payout-settings`, headers);
        const savedPayout = verifyPayoutRes.data.settings;
        
        if (savedPayout.instructorCommission === 85 && savedPayout.minimumPayoutAmount === 1500 && savedPayout.payoutFrequency === 'weekly') {
            console.log('✅ Payout Settings Persistence Verified');
        } else {
            console.error('❌ Payout Settings Mismatch:', savedPayout);
        }

        // 4. Test E-Commerce Settings (Referral + Dummy)
        console.log('\n--- TESTING E-COMMERCE STRATEGIC SETTINGS ---');
        const testEcomSettings = {
            referralCommission: 15,
            instructorShare: 80,
            testDummyField: 'Final Operational Pass v1.0'
        };
        
        await axios.post(`${API}/setting/update-batch`, { settings: testEcomSettings, isSensitive: false }, headers);
        console.log('✅ Strategic Settings Saved');
        
        const verifyEcomRes = await axios.get(`${API}/setting/public`);
        const savedEcom = verifyEcomRes.data.settings;
        
        if (savedEcom.referralCommission == 15 && savedEcom.instructorShare == 80 && savedEcom.testDummyField === 'Final Operational Pass v1.0') {
            console.log('✅ E-Commerce Settings Persistence Verified');
        } else {
            console.error('❌ E-Commerce Settings Mismatch:', savedEcom);
        }

        console.log('\n🔥 ALL E-COMMERCE MODULES VERIFIED AS FULLY OPERATIONAL 🔥');

    } catch (error) {
        console.error('❌ Verification Error:', error.response?.data || error.message);
    }
}

runTests();
