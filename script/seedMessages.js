require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user");
const Message = require("../models/message");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedMessages() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const users = await User.find({ active: true });

    if (users.length < 2) {
      console.log("⚠️ Cần ít nhất 2 user để seed messages");
      await mongoose.connection.close();
      return;
    }

    let fromUser = users.find((u) => u.utype === "USR") || users[0];
    let toUser =
      users.find((u) => u.utype === "ADM" && u._id.toString() !== fromUser._id.toString()) ||
      users.find((u) => u._id.toString() !== fromUser._id.toString());

    if (!toUser) {
      console.log("⚠️ Không tìm được user nhận tin nhắn");
      await mongoose.connection.close();
      return;
    }

    const messages = [
      {
        fromUserId: fromUser._id.toString(),
        toUserId: toUser._id.toString(),
        messageContent: {
          type: "text",
          text: "Xin chao shop, san pham nay con hang khong?",
        },
        isRead: false,
      },
      {
        fromUserId: toUser._id.toString(),
        toUserId: fromUser._id.toString(),
        messageContent: {
          type: "text",
          text: "Shop xin chao, san pham van con hang anh nhe.",
        },
        isRead: true,
      },
      {
        fromUserId: fromUser._id.toString(),
        toUserId: toUser._id.toString(),
        messageContent: {
          type: "text",
          text: "Cam on shop, toi se dat hang ngay.",
        },
        isRead: false,
      },
    ];

    let count = 0;

    for (const messageData of messages) {
      const existed = await Message.findOne({
        fromUserId: messageData.fromUserId,
        toUserId: messageData.toUserId,
        "messageContent.text": messageData.messageContent.text,
      });

      if (!existed) {
        await Message.create(messageData);
        count++;
      }
    }

    console.log(`✅ Seed thành công ${count} messages mới`);
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedMessages();