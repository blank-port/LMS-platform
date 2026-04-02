import mongoose from 'mongoose';
import Setting from './models/Setting.js';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';

const seedCourseSettings = async () => {
    try {
        await connectDB();
        console.log('🌱 Seeding Course Settings into Repository...');

        const initialSettings = [
            { key: 'course_approval', value: 'Yes', isSensitive: false },
            { key: 'show_seekbar', value: 'Yes', isSensitive: false },
            { key: 'drip_content', value: 'Show all', isSensitive: false },
            { key: 'hide_qa', value: 'No', isSensitive: false },
            { key: 'hide_review', value: 'No', isSensitive: false },
            { key: 'mail_before_expire', value: '7', isSensitive: false }
        ];

        for (const s of initialSettings) {
            const exists = await Setting.findOne({ key: s.key });
            if (!exists) {
                await Setting.create(s);
                console.log(` ✅ Initialized: ${s.key}`);
            } else {
                console.log(` ◽ Skipped (Exists): ${s.key}`);
            }
        }

        console.log('🏁 Strategic Constants Seeding Complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Failure:', error.message);
        process.exit(1);
    }
};

seedCourseSettings();
