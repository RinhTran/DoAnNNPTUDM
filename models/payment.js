const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
  },
  reservationId: {
    type: String,
  },
  method: {
    type: String,
    required: true,
    default: "COD",
  },
  transactionId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "failed", "paid", "refunded"],
    default: "pending",
  },
  currency: {
    type: String,
    default: "VND",
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  providerResponse: {
    type: Object,
  },
  pendingAt: {
    type: Date,
    default: () => Date.now(),
  },
  failedAt: {
    type: Date,
  },
  paidAt: {
    type: Date,
  },
  refundedAt: {
    type: Date,
  },
  idempotencyKey: {
    type: String,
  },
  note: {
    type: String,
  }
});

paymentSchema.set('toJSON', {
  transform: function (doc, ret, options) {
      ret.paymentId = ret._id;
      delete ret._id;
      delete ret.__v;
  }
});

paymentSchema.pre("save", function (next) {
  if (this.status === "paid" && !this.paidAt) {
    this.paidAt = Date.now();
  }
  if (this.status === "failed" && !this.failedAt) {
    this.failedAt = Date.now();
  }
  if (this.status === "refunded" && !this.refundedAt) {
    this.refundedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("payment", paymentSchema);
