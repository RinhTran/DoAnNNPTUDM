const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let searchSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  keyword: {
    type: String,
  }
});

searchSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.searchId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});


module.exports = mongoose.model("searchHistory", searchSchema);
