const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true
  },
});

categorySchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.categoryId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

module.exports = mongoose.model("Category", categorySchema);
