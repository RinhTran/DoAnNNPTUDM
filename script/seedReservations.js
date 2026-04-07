require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user");
const Product = require("../models/product");
const Reservation = require("../models/reservation");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedReservations() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const users = await User.find({ active: true, utype: "USR" });
    const products = await Product.find({ active: true });

    if (!users.length) {
      console.log("⚠️ Chưa có user nào để seed reservations");
      await mongoose.connection.close();
      return;
    }

    if (!products.length) {
      console.log("⚠️ Chưa có product nào để seed reservations");
      await mongoose.connection.close();
      return;
    }

    let count = 0;

    for (const user of users.slice(0, 3)) {
      const selectedProducts = products.slice(0, Math.min(2, products.length));

      const items = selectedProducts.map((product, index) => {
        const quantity = index + 1;
        const price = Number(product.price || 0);
        const promotion = 0;

        return {
          productId: product._id.toString(),
          quantity: quantity,
          name: product.name || "",
          size: "42",
          price: price,
          promotion: promotion,
          subtotal: (price - promotion) * quantity,
          imageUrl: product.image || "",
        };
      });

      const existed = await Reservation.findOne({
        userId: user._id.toString(),
        idempotencyKey: `RES_${user._id.toString()}`,
      });

      if (!existed) {
        await Reservation.create({
          userId: user._id.toString(),
          items: items,
          status: "actived",
          promotion: 0,
          idempotencyKey: `RES_${user._id.toString()}`,
        });
        count++;
      }
    }

    console.log(`✅ Seed thành công ${count} reservations mới`);
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedReservations();