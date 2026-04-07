const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let commentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  image: {
    type: String,
  },
  createDate: {
    type: Date,
    default: () => Date.now(),
  }
});

commentSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.cmtId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});


module.exports = mongoose.model("comment", commentSchema);
