import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function debugCourses() {
    try {
        console.log('--- Fetching all courses ---');
        const allRes = await axios.get(`${BASE_URL}/api/course/all`);
        if (!allRes.data.success) {
            console.error('Failed to fetch all courses:', allRes.data.message);
            return;
        }

        const courses = allRes.data.courses;
        console.log(`Found ${courses.length} courses.`);

        for (const course of courses) {
            console.log(`\nTesting Course: ${course.courseTitle} (${course._id})`);
            try {
                const detailRes = await axios.get(`${BASE_URL}/api/course/${course._id}`);
                if (detailRes.data.success) {
                    console.log('✅ Detail fetch successful');
                    const courseData = detailRes.data.courseData;
                    if (!courseData.courseContent) {
                        console.warn('⚠️ Missing courseContent');
                    } else {
                        console.log(`- Chapters: ${courseData.courseContent.length}`);
                    }
                } else {
                    console.error('❌ Detail fetch failed:', detailRes.data.message);
                }
            } catch (err) {
                console.error(`❌ Axios error for ${course._id}:`, err.response?.status || err.message);
                if (err.response?.data) {
                    console.error('Response Data:', JSON.stringify(err.response.data));
                }
            }
        }

    } catch (error) {
        console.error('Debug script crash:', error.message);
    }
}

debugCourses();
