import fs from 'fs';
import QuestionBank from "../models/QuestionBank.js";
import QuestionGroup from "../models/QuestionGroup.js";
import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";

// Question Group Management
export const createQuestionGroup = async (req, res) => {
    try {
        const group = await QuestionGroup.create(req.body);
        res.json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getQuestionGroups = async (req, res) => {
    try {
        const groups = await QuestionGroup.find({ course: req.params.courseId });
        res.json({ success: true, groups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllQuestionGroups = async (req, res) => {
    try {
        const groups = await QuestionGroup.find().populate('course', 'courseTitle');
        res.json({ success: true, groups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Question Bank Management
export const addQuestionToBank = async (req, res) => {
    try {
        const question = await QuestionBank.create(req.body);
        res.json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getQuestionsFromBank = async (req, res) => {
    try {
        const questions = await QuestionBank.find({ group: req.params.groupId });
        res.json({ success: true, questions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateQuestionInBank = async (req, res) => {
    try {
        const question = await QuestionBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, question });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteQuestionFromBank = async (req, res) => {
    try {
        await QuestionBank.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Intelligence unit decommissioned.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Advanced Quiz Setup
export const setupQuiz = async (req, res) => {
    try {
        const { 
            quizTitle, 
            courseId, 
            categoryId,
            subCategoryId,
            questionGroups, 
            duration, 
            passingScore,
            minimumPercentage,
            randomizeQuestions,
            changeDefaultSettings
        } = req.body;
        const createdBy = req.user._id;

        // Fetch questions from the bank for selected groups
        const bankQuestions = await QuestionBank.find({
            group: { $in: questionGroups }
        });

        // Map bank questions to quiz schema
        const questions = bankQuestions.map(q => ({
            questionText: q.question,
            questionType: q.questionType,
            marks: q.marks,
            image: q.image,
            options: q.options,
            correctAnswer: q.correctAnswerIndex
        }));

        const quiz = await Quiz.create({
            title: quizTitle,
            courseId,
            categoryId,
            subCategoryId,
            questionGroups,
            duration,
            passingScore,
            minimumPercentage,
            randomizeQuestions,
            changeDefaultSettings,
            questions,
            createdBy
        });

        res.json({ success: true, message: 'Assessment blueprint finalized and linked.', quiz });
    } catch (error) {
        console.error('Quiz Setup Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Course Levels & Subjects Tracking (Static/Dynamic)
export const updateCourseEducationFields = async (req, res) => {
    try {
        const { courseId, level, subject } = req.body;
        const course = await Course.findByIdAndUpdate(courseId, { level, subject }, { new: true });
        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const importQuestions = async (req, res) => {
    try {
        const { group } = req.body;
        const file = req.file;

        if (!file || !group) {
            return res.status(400).json({ success: false, message: 'Source node and organization group required.' });
        }

        const data = fs.readFileSync(file.path, 'utf8');
        const lines = data.split('\n');
        const importedQuestions = [];

        // Simple CSV parser (skip header)
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            if (row.length >= 8) {
                const [questionText, opt1, opt2, opt3, opt4, correctIndex, marks, typeCode] = row;
                
                let type = 'Multiple Choice';
                if (typeCode?.trim().toUpperCase() === 'S') type = 'Short Answer';
                else if (typeCode?.trim().toUpperCase() === 'L') type = 'Long Answer';
                else if (typeCode?.trim().toUpperCase() === 'T') type = 'True/False';

                importedQuestions.push({
                    group: group,
                    question: questionText.trim(),
                    options: [opt1.trim(), opt2.trim(), opt3.trim(), opt4.trim()],
                    correctAnswerIndex: parseInt(correctIndex.trim()) || 0,
                    marks: parseInt(marks.trim()) || 1,
                    questionType: type
                });
            }
        }

        if (importedQuestions.length > 0) {
            await QuestionBank.insertMany(importedQuestions);
        }

        // Cleanup
        fs.unlinkSync(file.path);

        res.json({ success: true, message: `Bulk synchronization successful. ${importedQuestions.length} assets integrated.` });
    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate('categoryId', 'name')
            .populate('subCategoryId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, quizzes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
