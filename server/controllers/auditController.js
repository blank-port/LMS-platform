import Institute from "../models/Institute.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

// Institute Management
export const createInstitute = async (req, res) => {
    try {
        const institute = await Institute.create(req.body);
        res.json({ success: true, institute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInstitutes = async (req, res) => {
    try {
        const institutes = await Institute.find().populate('instructors students');
        const mappedInstitutes = institutes.map(inst => ({
            ...inst.toObject(),
            instructorsCount: inst.instructors.length,
            studentsCount: inst.students.length
        }));
        res.json({ success: true, institutes: mappedInstitutes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Department Management
export const createDepartment = async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.json({ success: true, department });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ institute: req.params.instituteId }).populate('staff');
        res.json({ success: true, departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Role & Staff Management
export const createRole = async (req, res) => {
    try {
        const role = await Role.create(req.body);
        res.json({ success: true, role });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.json({ success: true, roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const assignUserToInstitute = async (req, res) => {
    try {
        const { userId, instituteId, role } = req.body;
        const updateField = role === 'instructor' ? 'instructors' : 'students';
        
        await Institute.findByIdAndUpdate(instituteId, { $addToSet: { [updateField]: userId } });
        await User.findByIdAndUpdate(userId, { institute: instituteId });
        
        res.json({ success: true, message: 'User assigned to institute successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
