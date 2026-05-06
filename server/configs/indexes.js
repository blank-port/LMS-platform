import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Course from '../models/Course.js';
import QuizAttempt from '../models/QuizAttempt.js';

/**
 * Institutional Performance Indexing Engine
 * Ensures sub-millisecond query performance for high-traffic dashboards.
 */
export const ensureIndexes = async () => {
    try {
        console.log('--- Initializing Strategic Performance Indexes ---');

        // User Indexes
        await User.collection.createIndex({ role: 1, 'gamification.totalPoints': -1 });
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ name: 1 });
        
        // Enrollment Indexes
        await Enrollment.collection.createIndex({ userId: 1, createdAt: -1 });
        await Enrollment.collection.createIndex({ courseId: 1, createdAt: -1 });
        await Enrollment.collection.createIndex({ userId: 1, progress: 1 });

        // Wallet Transaction Indexes
        await WalletTransaction.collection.createIndex({ userId: 1, source: 1, status: 1 });
        await WalletTransaction.collection.createIndex({ createdAt: -1 });
        
        // Course Indexes
        await Course.collection.createIndex({ instructor: 1, status: 1 });
        await Course.collection.createIndex({ isPublished: 1, status: 1 });
        
        try {
            await Course.collection.createIndex({ 
                courseTitle: "text", 
                courseDescription: "text" 
            }, {
                name: "CourseTextIndex",
                weights: { courseTitle: 10, courseDescription: 2 }
            });
        } catch (idxError) {
            // Error 85 is IndexOptionsConflict
            // We also check for IndexKeySpecsConflict (86) in case the name is correct but keys differ, 
            // though here we specifically suffer from name mismatch
            if (idxError.code === 85 || idxError.code === 86 || idxError.message.includes('Conflict')) {
                console.log('Detected index conflict. Syncing CourseTextIndex...');
                
                // Fetch all indexes to find the one that's causing the trouble
                const existingIndexes = await Course.collection.listIndexes().toArray();
                
                // Drop any text index that is not named CourseTextIndex
                for (const index of existingIndexes) {
                    if (index.name !== 'CourseTextIndex' && Object.values(index.key).includes('text')) {
                        console.log(`Dropping legacy text index: ${index.name}`);
                        await Course.collection.dropIndex(index.name);
                    }
                }
                
                // Also drop CourseTextIndex if it somehow existed with wrong options
                try { await Course.collection.dropIndex("CourseTextIndex"); } catch (e) {}

                // Re-create it
                await Course.collection.createIndex({ 
                    courseTitle: "text", 
                    courseDescription: "text" 
                }, {
                    name: "CourseTextIndex",
                    weights: { courseTitle: 10, courseDescription: 2 }
                });
                console.log('CourseTextIndex synchronized successfully.');
            } else {
                throw idxError;
            }
        }

        // Quiz Attempt Indexes
        await QuizAttempt.collection.createIndex({ userId: 1, createdAt: -1 });

        console.log('--- Strategic Indexes Synchronized ---');
    } catch (error) {
        console.error('Performance Indexing Failure:', error.message);
    }
};
