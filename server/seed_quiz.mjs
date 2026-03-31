import axios from 'axios';
import mongoose from 'mongoose';

const backendUrl = 'http://localhost:5000';
const token = 'ADMIN_TOKEN_HERE'; // Replace with a valid admin/instructor token for testing

const seedQuiz = async () => {
    try {
        // 1. Get a course to add quiz to
        const { data: coursesData } = await axios.get(`${backendUrl}/api/course/all`);
        if (!coursesData.success || coursesData.courses.length === 0) {
            console.log('No courses found to seed quiz for.');
            return;
        }

        const course = coursesData.courses[0];
        console.log(`Seeding quiz for course: ${course.courseTitle}`);

        const quizData = {
            courseId: course._id,
            title: "Final Mastery Validation: " + course.courseTitle,
            passingScore: 70,
            questions: [
                {
                    questionText: "What is the primary objective of this module?",
                    options: ["Knowledge Acquisition", "Skill Mastery", "Certification", "All of the above"],
                    correctAnswer: 3
                },
                {
                    questionText: "Which of these is a core competency discussed in the lectures?",
                    options: ["Strategic Thinking", "Time Management", "Technical Proficiency", "Communication"],
                    correctAnswer: 0
                },
                {
                    questionText: "Assessment results are primarily used for:",
                    options: ["Grading", "Performance Benchmarking", "Instructor Feedback", "Scholar Development"],
                    correctAnswer: 1
                }
            ]
        };

        const { data: quizResult } = await axios.post(`${backendUrl}/api/quiz/create`, quizData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (quizResult.success) {
            console.log('Quiz seeded successfully:', quizResult.quiz._id);
        } else {
            console.log('Failed to seed quiz:', quizResult.message);
        }
    } catch (error) {
        console.error('Seeding Error:', error.response?.data || error.message);
    }
};

// If running directly, we need a token. 
// For automation, we'll try to get one from the login endpoint.
const run = async () => {
    try {
        const { data: loginData } = await axios.post(`${backendUrl}/api/user/login`, {
            email: 'admin@prismed.com',
            password: 'admin123'
        });
        if (loginData.success) {
            const actualToken = loginData.token;
            // Now run seeding
            const { data: coursesData } = await axios.get(`${backendUrl}/api/course/all`);
            const course = coursesData.courses[0];
            
            const quizData = {
                courseId: course._id,
                title: "Expert Mastery Validation",
                passingScore: 70,
                questions: [
                    {
                        questionText: "What defines strategic excellence?",
                        options: ["Long-term Vision", "Short-term Gains", "Resource Loading", "Operational Speed"],
                        correctAnswer: 0
                    },
                    {
                        questionText: "High-impact leadership requires:",
                        options: ["Control", "Empathy & Strategy", "Strict Hierarchies", "Minimal Communication"],
                        correctAnswer: 1
                    }
                ]
            };

            const { data: quizResult } = await axios.post(`${backendUrl}/api/quiz/create`, quizData, {
                headers: { Authorization: `Bearer ${actualToken}` }
            });
            console.log('Quiz Seed Status:', quizResult.success ? 'SUCCESS' : 'FAILED', quizResult.message);
        }
    } catch (err) {
        console.log('Seeding failed (Login required). Please ensure an admin account exists.');
    }
};

run();
