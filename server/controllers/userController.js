import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRole = role === 'instructor' ? 'instructor' : 'student';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
            isApproved: userRole === 'student' ? true : false
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                isApproved: user.isApproved
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                isApproved: user.isApproved
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Google Login
export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Register new user via Google
             user = await User.create({
                name,
                email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10), // Random password
                role: 'student',
                profilePicture: picture,
                isApproved: true
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Google Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture || picture,
                isApproved: user.isApproved
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('enrolledCourses');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Profile (Universal Identity Sync)
export const updateProfile = async (req, res) => {
    try {
        const { 
            name, phone, about, headline, language, dob, 
            education, experience, skills, socialLinks, 
            payoutSettings 
        } = req.body;
        
        const updateData = {};

        // Primary Identity
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (about) updateData.about = about;
        if (headline) updateData.headline = headline;
        if (language) updateData.language = language;
        if (dob) updateData.dob = dob;

        // Secondary Vectors (Parsed if stringified from form-data)
        if (education) updateData.education = typeof education === 'string' ? JSON.parse(education) : education;
        if (experience) updateData.experience = typeof experience === 'string' ? JSON.parse(experience) : experience;
        if (skills) updateData.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
        if (socialLinks) updateData.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
        if (payoutSettings) updateData.payoutSettings = typeof payoutSettings === 'string' ? JSON.parse(payoutSettings) : payoutSettings;

        // Avatar Handling
        if (req.file) updateData.avatar = req.file.path;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password');

        res.json({ 
            success: true, 
            message: 'Global identity synchronized successfully', 
            user 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get User Data (for context)
export const getUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.json({ success: false, message: 'User Not Found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Account Profile (Name, Phone, About, Avatar)
export const updateAccountProfile = async (req, res) => {
    try {
        const { name, phone, about } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (about) updateData.about = about;
        
        if (req.file) {
            updateData.avatar = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password');

        res.json({ success: true, message: 'Primary identity synchronized', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password verification failed' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: 'Security layer updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Secondary Details (Education, Experience, Skills, Financial, Social, Settings)
export const updateSecondaryDetails = async (req, res) => {
    try {
        const { 
            education, experience, skills, 
            financial, socialLinks, notificationSettings, language 
        } = req.body;
        
        const updateData = {};
        if (education) updateData.education = education;
        if (experience) updateData.experience = experience;
        if (skills) updateData.skills = skills;
        if (financial) updateData.financial = financial;
        if (socialLinks) updateData.socialLinks = socialLinks;
        if (notificationSettings) updateData.notificationSettings = notificationSettings;
        if (language) updateData.language = language;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        ).select('-password');

        res.json({ success: true, message: 'Extended profile synchronized', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Account
export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Authorization failed for account termination' });
        }

        await User.findByIdAndDelete(req.user._id);
        res.json({ success: true, message: 'Account permanently removed from registry' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};