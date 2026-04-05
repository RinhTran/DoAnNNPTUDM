const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let messageContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "file"],
    default: "text",
  },
  text: {
    type: String,
    required: true,
  }
}, {
  _id: false,
});

let messageSchema = new mongoose.Schema({
  fromUserId: {
    type: String,
    required: true,
  },
  toUserId: {
    type: String,
    required: true,
  },
  messageContent: {
    type: messageContentSchema,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createDate: {
    type: Date,
    default: () => Date.now(),
  }
});

messageSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.messageId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

module.exports = mongoose.model("message", messageSchema);
