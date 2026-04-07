const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let ratingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  }
});

ratingSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

module.exports = mongoose.model("rating", ratingSchema);
