const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let saleDetailsSchema = new mongoose.Schema(
  {
    salesId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    salesPrice:{
        type: Number,
    },
    updateBy:{
        type: String,
        required: true,
    }
  },
);

saleDetailsSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.saleDetailsId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

module.exports = mongoose.model("SaleDetails", saleDetailsSchema);