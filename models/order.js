const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  statusId: {
    type: String,
  },
  createDate: {
    type: Date,
    default: () => Date.now(),
  },
  bookingDate: {
    type: Date,
    default: () => Date.now(),
  },
  deliveryDate: {
    type: Date,
    default: () => Date.now(),
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  note: {
    type: String,
  },
  total: {
    type: Number,
  },
  payment: {
    type: Boolean,
  },
  momo: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  statusName: {
    type: String,
  }
});

orderSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.orderId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

orderSchema.pre("save", function (next) {
  this.deliveryDate.setDate(this.deliveryDate.getDate() + 3);
  next();
});

module.exports = mongoose.model("order", orderSchema);
