const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  rate: {
    type: Number,
  },
  productNew: {
    type: Boolean,
  },
  purchase: {
    type: Number,
  },
  stock: {
    type: Number,
  },
  active: {
    type: Boolean,
  },
  createDate: {
    type: Date,
    default: () => Date.now(),
  },
  dateUpdate: {
    type: Date,
    default: () => Date.now(),
  },
  updateBy: {
    type: String,
    required: true,
  },
  brandId: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
  sizeTable: {
    type: Object,
  },
  sales: {
    type: Object,
  },
  brandName: { type: String},
  categoryName: { type: String},
});

productSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.productId = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

productSchema.pre("save", function (next) {
  if (!this.rate) this.rate = 0;
  if (!this.active) this.active = true;
  if (!this.purchase) this.purchase = 0;
  if (!this.stock) this.stock = 0;
  if (!this.productNew) this.productNew = true;
  next();
});

module.exports = mongoose.model("Product", productSchema);
