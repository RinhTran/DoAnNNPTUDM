const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let salesSchema = new mongoose.Schema(
  {
    salesName: {
      type: String,
      required: true,
      unique: true
    },
    content: {
      type: String,
      required: true,
    },
    percent:{
        type: Number,
        required: true,
    },
    banner:{
        type: String,
        required: true,
    },
    startDay:{
        type: Date,
        required: true,
    },
    endDay:{
        type: Date,
        required: true,
    },
    createDate: {
      type: Date,
      default: () => Date.now(),
    },
  },
);

salesSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.salesId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

module.exports = mongoose.model("Sales", salesSchema);