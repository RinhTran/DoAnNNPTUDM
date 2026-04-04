const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let inventorySchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  stock: {
    type: Number,
    min: 0,
    default: 0,
  },
  reserved: {
    type: Number,
    min: 0,
    default: 0,
  },
  soldCount: {
    type: Number,
    min: 0,
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

inventorySchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.inventoryId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

inventorySchema.pre("save", function (next) {
  this.dateUpdate = Date.now();
  next();
});

module.exports = mongoose.model("inventory", inventorySchema);
