import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import WalletTransaction from '../models/WalletTransaction.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateBranding = async () => {
    try {
        console.log('🚀 Starting Institutional Rebranding Migration...');
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Registry Database.');

        // 1. Migrate User Roles
        console.log('🔄 Migrating user roles: student -> scholar, instructor -> educator...');
        const scholarUpdate = await User.updateMany({ role: 'student' }, { $set: { role: 'scholar' } });
        const educatorUpdate = await User.updateMany({ role: 'instructor' }, { $set: { role: 'educator' } });
        console.log(`   - Updated ${scholarUpdate.modifiedCount} Scholars.`);
        console.log(`   - Updated ${educatorUpdate.modifiedCount} Educators.`);

        // 2. Migrate Schema Flags (if any)
        console.log('🔄 Synchronizing institutional flags...');
        await User.updateMany({ isInstructor: { $exists: true } }, [
            { $set: { isEducator: "$isInstructor" } },
            { $unset: ["isInstructor"] }
        ]);
        console.log('   - Merged isInstructor into isEducator.');

        // 3. Update Course References (Metadata only if applicable)
        // Note: No explicit terminology fields in Course schema were identified yet, 
        // but we ensure consistency in logs/meta if they existed.

        // 4. Update Wallet Transaction Sources
        console.log('🔄 Aligning treasury ledger terminology...');
        const commissionUpdate = await WalletTransaction.updateMany(
            { source: 'course_commission' }, 
            { $set: { source: 'institutional_commission' } }
        );
        const earningUpdate = await WalletTransaction.updateMany(
            { source: 'instructor_earnings' }, 
            { $set: { source: 'educator_earnings' } }
        );
        console.log(`   - Updated ${commissionUpdate.modifiedCount} revenue records.`);
        console.log(`   - Updated ${earningUpdate.modifiedCount} earnings records.`);

        console.log('🏁 Institutional Rebranding Migration Complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration Critical Failure:', error);
        process.exit(1);
    }
};

migrateBranding();
