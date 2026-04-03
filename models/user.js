const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

mongoose.Promise = global.Promise;

let userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    utype:{
        type: String,
        default: "USR",
    },
    active: {
      type: Boolean,
      default: true
    },
    profile: {
      type: Object,
    },
    token: { type: String },
  },
);

userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.userId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
}); 

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken= crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
  return resetToken;
};

//Export the model
module.exports = mongoose.model("User", userSchema);
