require("dotenv").config();

const mongoose = require("mongoose");
const Order = require("../models/order");
const User = require("../models/user");
const Status = require("../models/status");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng"];
const lastNames = ["Anh", "Bình", "Cường", "Dũng", "Hùng", "Nam"];

const addresses = [
  "Quận 1, TP.HCM",
  "Quận Bình Thạnh, TP.HCM",
  "Thủ Đức, TP.HCM",
  "Quận 7, TP.HCM",
  "Gò Vấp, TP.HCM",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  return "0" + Math.floor(100000000 + Math.random() * 900000000);
}

function randomDate() {
  const now = new Date();
  const past = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

async function seedOrders() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const users = await User.find({ utype: "USR" }, "_id email");
    const statuses = await Status.find({}, "_id statusName");

    if (!users.length) {
      console.log("❌ Không có user USR.");
      await mongoose.connection.close();
      return;
    }

    if (!statuses.length) {
      console.log("❌ Không có status.");
      await mongoose.connection.close();
      return;
    }

    const orders = [];

    for (let i = 0; i < 20; i++) {
      const user = randomItem(users);
      const status = randomItem(statuses);
      const createDate = randomDate();
      const deliveryDate = new Date(createDate);
      deliveryDate.setDate(deliveryDate.getDate() + 3);

      orders.push({
        userId: user._id.toString(),
        firstName: randomItem(firstNames),
        lastName: randomItem(lastNames),
        statusId: status._id.toString(),
        statusName: status.statusName,
        createDate,
        bookingDate: createDate,
        deliveryDate,
        phone: randomPhone(),
        email: user.email,
        note: "Giao giờ hành chính",
        total: 0,
        payment: Math.random() > 0.5,
        momo: "MOMO_" + Math.floor(Math.random() * 1000000),
        address: randomItem(addresses),
      });
    }

    await Order.deleteMany({});
    const result = await Order.insertMany(orders);

    console.log(`✅ Seed thành công ${result.length} orders`);
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedOrders();