const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let brandSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true,
    unique: true
  },
  information: {
    type: String,
  },
  logo: {
    type: String,
    required: true,
  }
});

brandSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.brandId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

module.exports = mongoose.model("Brand", brandSchema);
