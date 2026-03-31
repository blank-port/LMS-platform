import express from 'express';
import { createTicket, getUserTickets, addReply, resolveTicket } from '../controllers/supportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const supportRouter = express.Router();

supportRouter.post('/create', authMiddleware, createTicket);
supportRouter.get('/my-tickets', authMiddleware, getUserTickets);
supportRouter.post('/reply/:ticketId', authMiddleware, addReply);
supportRouter.post('/resolve/:ticketId', authMiddleware, resolveTicket);

export default supportRouter;
