const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let itemCartSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  size: {
    type: String,
  },
  price: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: String,
  },
  name: {
    type: String,
  }
}, {
  _id: false,
});

let cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  products: {
    type: [itemCartSchema],
    default: [],
  },
  totalQuantity: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createDate: {
    type: Date,
    default: () => Date.now(),
  },
  dateUpdate: {
    type: Date,
    default: () => Date.now(),
  }
});

cartSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.cartId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

cartSchema.pre("save", function (next) {
  this.totalQuantity = 0;
  this.totalPrice = 0;

  if (this.products && this.products.length > 0) {
    for (const item of this.products) {
      this.totalQuantity += Number(item.quantity || 0);
      this.totalPrice += Number(item.quantity || 0) * Number(item.price || 0);
    }
  }

  this.dateUpdate = Date.now();
  next();
});

module.exports = mongoose.model("cart", cartSchema);
