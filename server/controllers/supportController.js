import SupportTicket from "../models/SupportTicket.js";
import responseHelper from "../utils/responseHelper.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create Ticket
export const createTicket = asyncHandler(async (req, res, next) => {
    const { subject, category, description, priority } = req.body;
    const userId = req.user._id;

    const ticket = await SupportTicket.create({
        userId, subject, category, description, priority
    });

    return responseHelper.success(res, { ticket }, 'Support enquiry provisioned', 201);
});

// Get User Tickets
export const getUserTickets = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const tickets = await SupportTicket.find({ userId }).sort({ updatedAt: -1 });
    return responseHelper.success(res, { tickets }, 'Personal support registry synchronized');
});

// Add Reply to Ticket
export const addReply = asyncHandler(async (req, res, next) => {
    const { ticketId } = req.params;
    const { message } = req.body;
    const sender = req.user._id;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) return next(new AppError('Institutional support artifact not found', 404));

    ticket.replies.push({ sender, message });
    ticket.status = req.user.role === 'student' ? 'open' : 'in-progress';
    await ticket.save();

    return responseHelper.success(res, { ticket }, 'Institutional commentary verified');
});

// Resolve Ticket
export const resolveTicket = asyncHandler(async (req, res, next) => {
    const { ticketId } = req.params;
    const ticket = await SupportTicket.findByIdAndUpdate(ticketId, { status: 'resolved' }, { new: true });
    if (!ticket) return next(new AppError('Institutional support artifact not found', 404));
    return responseHelper.success(res, { ticket }, 'Support enquiry resolved successfully');
});
