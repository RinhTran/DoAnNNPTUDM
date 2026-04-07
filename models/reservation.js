const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

let itemReservationSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  name: {
    type: String,
  },
  size: {
    type: String,
  },
  price: {
    type: Number,
    default: 0,
  },
  promotion: {
    type: Number,
    default: 0,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: String,
  }
}, {
  _id: false,
});

let reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: {
    type: [itemReservationSchema],
    default: [],
  },
  status: {
    type: String,
    enum: ["actived", "cancelled", "expired", "transfer"],
    default: "actived",
  },
  expiredIn: {
    type: Date,
  },
  promotion: {
    type: Number,
    default: 0,
  },
  amount: {
    type: Number,
    default: 0,
  },
  idempotencyKey: {
    type: String,
  },
  orderId: {
    type: String,
  },
  createDate: {
    type: Date,
    default: () => Date.now(),
  },
});

reservationSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.reservationId = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

reservationSchema.pre("save", function (next) {
  this.amount = 0;
  if (this.items && this.items.length > 0) {
    this.items = this.items.map((item) => {
      item.subtotal = (Number(item.price || 0) - Number(item.promotion || 0)) * Number(item.quantity || 0);
      this.amount += item.subtotal;
      return item;
    });
  }

  this.amount = this.amount - Number(this.promotion || 0);

  if (!this.expiredIn && this.status === "actived") {
    const exp = new Date();
    exp.setMinutes(exp.getMinutes() + 30);
    this.expiredIn = exp;
  }
  next();
});

module.exports = mongoose.model("reservation", reservationSchema);