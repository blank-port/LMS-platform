import SupportTicket from "../models/SupportTicket.js";

// Create Ticket
export const createTicket = async (req, res) => {
    try {
        const { subject, category, description, priority } = req.body;
        const userId = req.user._id;

        const ticket = await SupportTicket.create({
            userId, subject, category, description, priority
        });

        res.json({ success: true, message: 'Support ticket created', ticket });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get User Tickets
export const getUserTickets = async (req, res) => {
    try {
        const userId = req.user._id;
        const tickets = await SupportTicket.find({ userId }).sort({ updatedAt: -1 });
        res.json({ success: true, tickets });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add Reply to Ticket
export const addReply = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { message } = req.body;
        const sender = req.user._id;

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

        ticket.replies.push({ sender, message });
        ticket.status = req.user.role === 'student' ? 'open' : 'in-progress';
        await ticket.save();

        res.json({ success: true, message: 'Reply added', ticket });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Resolve Ticket
export const resolveTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await SupportTicket.findByIdAndUpdate(ticketId, { status: 'resolved' }, { new: true });
        res.json({ success: true, message: 'Ticket resolved', ticket });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
