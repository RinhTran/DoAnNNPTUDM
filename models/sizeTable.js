const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let sizeTableSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  s38: {
    type: Number,
  },
  s39: {
    type: Number,
  },
  s40: {
    type: Number,
  },
  s41: {
    type: Number,
  },
  s42: {
    type: Number,
  },
  s43: {
    type: Number,
  },
  s44: {
    type: Number,
  },
  s45: {
    type: Number,
  },
  s46: {
    type: Number,
  },
  s47: {
    type: Number,
  },
  s48: {
    type: Number,
  },
});

sizeTableSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.sizeTableId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

sizeTableSchema.pre('save',function(next) {
  this.s38 = 0
  this.s39 = 0
  this.s40 = 0
  this.s41 = 0
  this.s42 = 0
  this.s43 = 0
  this.s44 = 0
  this.s45 = 0
  this.s46 = 0
  this.s47 = 0
  this.s48 = 0
  next();
})

module.exports = mongoose.model("SizeTable", sizeTableSchema);