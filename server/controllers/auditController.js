import Institute from "../models/Institute.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Institute Management
export const createInstitute = asyncHandler(async (req, res, next) => {
    const institute = await Institute.create(req.body);
    return responseHelper.success(res, { institute }, 'Institutional alliance provisioned successfully', 201);
});

export const getInstitutes = asyncHandler(async (req, res, next) => {
    const institutes = await Institute.find().populate('instructors students');
    const mappedInstitutes = institutes.map(inst => ({
        ...inst.toObject(),
        instructorsCount: inst.instructors.length,
        studentsCount: inst.students.length
    }));
    return responseHelper.success(res, { institutes: mappedInstitutes }, 'Institutional registry synchronized');
});

// Department Management
export const createDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.create(req.body);
    return responseHelper.success(res, { department }, 'Institutional department capacity provisioned', 201);
});

export const getDepartments = asyncHandler(async (req, res, next) => {
    const departments = await Department.find({ institute: req.params.instituteId }).populate('staff');
    return responseHelper.success(res, { departments }, 'Departmental registry synchronized');
});

// Role & Staff Management
export const createRole = asyncHandler(async (req, res, next) => {
    const role = await Role.create(req.body);
    return responseHelper.success(res, { role }, 'Strategic institutional role provisioned', 201);
});

export const getRoles = asyncHandler(async (req, res, next) => {
    const roles = await Role.find();
    return responseHelper.success(res, { roles }, 'Identity role registry synchronized');
});

export const assignUserToInstitute = asyncHandler(async (req, res, next) => {
    const { userId, instituteId, role } = req.body;
    const updateField = role === 'instructor' ? 'instructors' : 'students';
    
    const institute = await Institute.findByIdAndUpdate(instituteId, { $addToSet: { [updateField]: userId } });
    if (!institute) return next(new AppError('Institutional alliance node not found', 404));

    const user = await User.findByIdAndUpdate(userId, { institute: instituteId });
    if (!user) return next(new AppError('Academic identity not found', 404));
    
    return responseHelper.success(res, {}, 'Scholar assigned to institutional alliance successfully');
});
