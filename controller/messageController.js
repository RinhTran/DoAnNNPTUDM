const Message = require("../models/message");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createMessage = asyncHandler(async (req, res) => {
  try {
    const fromUserId = req.user?._id?.toString() || req.body.fromUserId;
    const toUserId = req.body.toUserId;
    validateMongoDbId(fromUserId);
    validateMongoDbId(toUserId);

    const findFromUser = await User.findById(fromUserId);
    const findToUser = await User.findById(toUserId);
    if (!findFromUser || !findToUser) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "user is not found",
        data: null,
      });
    }

    const newMessage = await Message.create({
      fromUserId,
      toUserId,
      messageContent: {
        type: req?.body?.type ?? "text",
        text: req?.body?.text,
      },
    });
 

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: null,
    });
  }
});

const getMessagesByUsers = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id?.toString();
    const otherUserId = req.params.id;
    validateMongoDbId(userId);
    validateMongoDbId(otherUserId);

    const messages = await Message.find({
      $or: [
        { fromUserId: userId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: userId },
      ],
    }).sort({ createDate: 1 });

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      currentUserId: userId, 
      data: messages,
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: null,
    });
  }
});

const getConversationList = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id?.toString();
    validateMongoDbId(userId);

    const messages = await Message.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    }).sort({ createDate: -1 });

    const messageMap = new Map();
    messages.forEach((message) => {
      const otherUserId =
        userId == message.fromUserId ? message.toUserId : message.fromUserId;
      if (!messageMap.has(otherUserId)) {
        messageMap.set(otherUserId, message);
      }
    });

    const data = [];
    messageMap.forEach((value, key) => {
      data.push({ userId: key, message: value });
    });

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data,
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: null,
    });
  }
});

module.exports = { createMessage, getMessagesByUsers, getConversationList };