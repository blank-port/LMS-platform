import fs from 'fs';
import QuestionBank from "../models/QuestionBank.js";
import QuestionGroup from "../models/QuestionGroup.js";
import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Question Group Management
export const createQuestionGroup = asyncHandler(async (req, res, next) => {
    const group = await QuestionGroup.create(req.body);
    return responseHelper.success(res, { group }, 'Pedagogical organisation group provisioned', 201);
});

export const getQuestionGroups = asyncHandler(async (req, res, next) => {
    const groups = await QuestionGroup.find({ course: req.params.courseId });
    return responseHelper.success(res, { groups }, 'Institutional organisation groups synchronized');
});

export const getAllQuestionGroups = asyncHandler(async (req, res, next) => {
    const groups = await QuestionGroup.find().populate('course', 'courseTitle');
    return responseHelper.success(res, { groups }, 'Global organisation group registry synchronized');
});

// Question Bank Management
export const addQuestionToBank = asyncHandler(async (req, res, next) => {
    const question = await QuestionBank.create(req.body);
    return responseHelper.success(res, { question }, 'Intelligence unit integrated into bank', 201);
});

export const getQuestionsFromBank = asyncHandler(async (req, res, next) => {
    const questions = await QuestionBank.find({ group: req.params.groupId });
    return responseHelper.success(res, { questions }, 'Intelligence units synchronized from bank');
});

export const updateQuestionInBank = asyncHandler(async (req, res, next) => {
    const question = await QuestionBank.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return next(new AppError('Intelligence unit not found', 404));
    return responseHelper.success(res, { question }, 'Intelligence unit recalibrated');
});

export const deleteQuestionFromBank = asyncHandler(async (req, res, next) => {
    const question = await QuestionBank.findByIdAndDelete(req.params.id);
    if (!question) return next(new AppError('Intelligence unit not found', 404));
    return responseHelper.success(res, {}, 'Intelligence unit decommissioned');
});

// Advanced Quiz Setup
export const setupQuiz = asyncHandler(async (req, res, next) => {
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

    const bankQuestions = await QuestionBank.find({
        group: { $in: questionGroups }
    });

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

    return responseHelper.success(res, { quiz }, 'Assessment blueprint finalized and integrated', 201);
});

// Course Levels & Subjects Tracking (Static/Dynamic)
export const updateCourseEducationFields = asyncHandler(async (req, res, next) => {
    const { courseId, level, subject } = req.body;
    const course = await Course.findByIdAndUpdate(courseId, { level, subject }, { new: true });
    if (!course) return next(new AppError('Curriculum unit not found', 404));
    return responseHelper.success(res, { course }, 'Curriculum domain fields synchronized');
});

export const importQuestions = asyncHandler(async (req, res, next) => {
    try {
        const { group } = req.body;
        const file = req.file;

        if (!file || !group) {
            return next(new AppError('Source node and organisation group required for synchronization', 400));
        }

        const data = fs.readFileSync(file.path, 'utf8');
        const lines = data.split('\n');
        const importedQuestions = [];

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            if (row.length >= 8) {
                const [questionText, opt1, opt2, opt3, opt4, correctIndex, marks, typeCode] = row;
                
                let type = 'Multiple Choice';
                const code = typeCode?.trim().toUpperCase();
                if (code === 'S') type = 'Short Answer';
                else if (code === 'L') type = 'Long Answer';
                else if (code === 'T') type = 'True/False';

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

        fs.unlinkSync(file.path);

        return responseHelper.success(res, {}, `Bulk synchronization successful. ${importedQuestions.length} assets integrated.`);
    } catch (error) {
        // Ensure file cleanup on error
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw error; // Let asyncHandler handle it
    }
});

export const getAllQuizzes = asyncHandler(async (req, res, next) => {
    const quizzes = await Quiz.find()
        .populate('categoryId', 'name')
        .populate('subCategoryId', 'name')
        .sort({ createdAt: -1 });
    return responseHelper.success(res, { quizzes }, 'Assessment blueprint registry synchronized');
});

// Subject Management
export const getAllSubjects = asyncHandler(async (req, res, next) => {
    const subjects = await Subject.find().sort({ name: 1 });
    return responseHelper.success(res, { subjects }, 'Scholarly domain registry synchronized');
});

export const createSubject = asyncHandler(async (req, res, next) => {
    const { name, icon } = req.body;
    const subject = await Subject.create({ name, icon });
    return responseHelper.success(res, { subject }, 'Pedagogical domain stabilized', 201);
});

export const deleteSubject = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) return next(new AppError('Scholarly domain not found', 404));
    return responseHelper.success(res, {}, 'Pedagogical domain excised');
});
