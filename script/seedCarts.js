require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedCarts() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const users = await User.find({ active: true });
    const products = await Product.find({ active: true });

    if (!users.length) {
      console.log("⚠️ Chưa có user nào để seed cart");
      await mongoose.connection.close();
      return;
    }

    if (!products.length) {
      console.log("⚠️ Chưa có product nào để seed cart");
      await mongoose.connection.close();
      return;
    }

    let count = 0;

    for (const user of users) {
      const selectedProducts = products.slice(0, Math.min(2, products.length));

      const cartProducts = selectedProducts.map((product, index) => ({
        productId: product._id.toString(),
        quantity: index + 1,
        size: "42",
        price: product.price || 0,
        imageUrl: product.image || "",
        name: product.name || "",
      }));

      const totalQuantity = cartProducts.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const totalPrice = cartProducts.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
        0
      );

      await Cart.updateOne(
        { userId: user._id.toString() },
        {
          $set: {
            products: cartProducts,
            totalQuantity: totalQuantity,
            totalPrice: totalPrice,
            active: true,
            dateUpdate: Date.now(),
          },
          $setOnInsert: {
            userId: user._id.toString(),
            createDate: Date.now(),
          },
        },
        { upsert: true }
      );

      count++;
    }

    console.log(`✅ Seed/upsert thành công ${count} carts`);
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedCarts();