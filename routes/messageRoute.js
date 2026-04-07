// const express = require("express");
// const router = express.Router();

// const Message = require("../models/message");
// const User = require("../models/user");

// router.get("/", async (req, res) => {
//   try {
//     const messages = await Message.find({});
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get("/:userId1/:userId2", async (req, res) => {
//   try {
//     const { userId1, userId2 } = req.params;

//     const messages = await Message.find({
//       $or: [
//         { fromUserId: userId1, toUserId: userId2 },
//         { fromUserId: userId2, toUserId: userId1 },
//       ],
//     }).sort({ createDate: 1 });

//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.post("/", async (req, res) => {
//   try {
//     const { fromUserId, toUserId, messageContent } = req.body;

//     const fromUser = await User.findById(fromUserId);
//     const toUser = await User.findById(toUserId);

//     if (!fromUser || !toUser) {
//       return res.status(404).json({ message: "User không tồn tại" });
//     }

//     const newMessage = await Message.create({
//       fromUserId,
//       toUserId,
//       messageContent,
//       isRead: false,
//     });

//     if (global._io) {
//       global._io.to(toUserId).emit("receive_message", newMessage);
//     }

//     res.json(newMessage);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;