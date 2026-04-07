const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let profileSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    address:{
        type: String,
    },
    phone:{
        type: String,
    },
    imageUrl:{
        type: String,
    },
    userId:{
        type: String,
    },
  },
);

profileSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.profileId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

module.exports = mongoose.model("Profile", profileSchema);