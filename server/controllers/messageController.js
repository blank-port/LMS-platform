import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import { broadcast } from "../services/pusherService.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, message, targetType = 'private', targetId } = req.body;
  const senderId = req.user._id;

  if (!message) {
    return res.status(400).json({ success: false, message: "Message content required" });
  }

  let conversationId = null;

  if (targetType === 'private') {
    if (!receiverId) {
      return res.status(400).json({ success: false, message: "Receiver ID required for private message" });
    }

    // 1. Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    conversationId = conversation._id;

    // 2. Create message
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: message,
      targetType: 'private',
      conversationId: conversationId,
    });

    // 3. Update conversation last message
    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    // 4. Populate for real-time
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name avatar role")
      .populate("receiver", "name avatar role");

    // 5. Trigger Pusher
    await broadcast(`chat-${receiverId}`, "new-message", populatedMessage);
    await broadcast(`chat-${senderId}`, "new-message", populatedMessage);

    return res.status(201).json({ success: true, data: populatedMessage });
  } else {
    // Group/Broadcast logic (Placeholder for now, can be expanded)
    const newMessage = await Message.create({
      sender: senderId,
      content: message,
      targetType,
      targetId,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name avatar role");

    await broadcast(`chat-${targetType}-${targetId}`, "new-message", populatedMessage);

    return res.status(201).json({ success: true, data: populatedMessage });
  }
});

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "name avatar role email lastActive")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name" }
    })
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: conversations });
});

// @desc    Get chat history between two users
// @route   GET /api/messages/history/:otherUserId
// @access  Private
export const getChatHistory = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user._id;

  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId },
    ],
    targetType: 'private'
  })
    .populate("sender", "name avatar role")
    .populate("receiver", "name avatar role")
    .sort({ createdAt: 1 });

  res.json({ success: true, data: messages });
});

// @desc    Mark messages as read
// @route   PATCH /api/messages/read/:otherUserId
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user._id;

  await Message.updateMany(
    { sender: otherUserId, receiver: userId, read: false },
    { $set: { read: true } }
  );

  res.json({ success: true, message: "Messages marked as read" });
});

// @desc    Search for users to start a conversation
// @route   GET /api/messages/search-users?q=...
// @access  Private
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const userId = req.user._id;
  const userRole = req.user.role;

  console.log(`[Messaging Search] Query: "${q}", UserRole: ${userRole}, UserId: ${userId}`);

  let query = { _id: { $ne: userId } };

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  // Role-based restrictions
  if (userRole === 'student') {
    query.role = { $in: ['instructor', 'admin', 'staff'] };
  } else if (userRole === 'instructor') {
    query.role = { $in: ['student', 'admin', 'staff'] };
  } else if (userRole === 'admin' || userRole === 'staff') {
    // Admin/Staff can search everyone, no role restriction needed
    // But we can add it explicitly if we want to be safe
    // query.role = { $in: ['student', 'instructor', 'admin', 'staff'] };
  }

  try {
    const users = await User.find(query)
      .select("name avatar role email lastActive")
      .limit(20);

    console.log(`[Messaging Search] Found ${users.length} users`);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error(`[Messaging Search] Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Search failed" });
  }
});
