require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user");
const Payment = require("../models/payment");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedPayments() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const users = await User.find({ active: true, utype: "USR" });

    if (!users.length) {
      console.log("⚠️ Chưa có user nào để seed payments");
      await mongoose.connection.close();
      return;
    }

    let count = 0;

    for (const user of users.slice(0, 3)) {
      const existed = await Payment.findOne({
        userId: user._id.toString(),
        note: "Seed payment demo",
      });

      if (!existed) {
        await Payment.create({
          userId: user._id.toString(),
          method: "COD",
          status: "pending",
          currency: "VND",
          amount: 500000,
          transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          idempotencyKey: `IDEMP_${user._id.toString()}`,
          providerResponse: {
            message: "Cho thanh toan khi nhan hang",
          },
          note: "Seed payment demo",
        });
        count++;
      }
    }

    console.log(`✅ Seed thành công ${count} payments mới`);
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedPayments();