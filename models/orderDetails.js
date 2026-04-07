const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let orderDetailsSchema = new mongoose.Schema({
  orderId: {
    type: String,
  },
  productId: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
  },
  imageUrl: {
    type: String,
  },
  name: {
    type: String,
  }
});

orderDetailsSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

module.exports = mongoose.model("orderDetails", orderDetailsSchema);
