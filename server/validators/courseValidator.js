import { body } from 'express-validator';

/**
 * Course Validation Schemas
 * Ensures academic data integrity for curriculum management.
 */

export const courseSchema = [
    body('courseData')
        .notEmpty().withMessage('Curriculum data is required.')
        .custom((value) => {
            try {
                const parsed = JSON.parse(value);
                if (!parsed.courseTitle) throw new Error('Course title is required.');
                if (!parsed.courseDescription) throw new Error('Course description is required.');
                if (typeof parsed.coursePrice !== 'number') throw new Error('Course price must be a numeric value.');
                return true;
            } catch (err) {
                throw new Error(`Data corruption: ${err.message}`);
            }
        }),
    
    // Thumbnail check is usually handled by multer, but we can verify field presence if needed
];

export const updateCourseSchema = [
    body('courseData')
        .optional()
        .custom((value) => {
            try {
                JSON.parse(value);
                return true;
            } catch (err) {
                throw new Error('Data corruption: Invalid JSON format.');
            }
        })
];
