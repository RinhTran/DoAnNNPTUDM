const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let statusSchema = new mongoose.Schema(
  {
    statusName: {
      type: String,
      required: true,
      unique: true
    }
  },
);

statusSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.statusId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

module.exports = mongoose.model("Status", statusSchema);