const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
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

roleSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.roleId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

roleSchema.pre("save", function (next) {
  this.dateUpdate = Date.now();
  next();
});

module.exports = mongoose.model("role", roleSchema);
