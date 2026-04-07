require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/product");
const Inventory = require("../models/inventory");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedInventories() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const products = await Product.find({ active: true });

    if (!products.length) {
      console.log("⚠️ Chưa có sản phẩm nào để seed inventory");
      await mongoose.connection.close();
      return;
    }

    let count = 0;

    for (const product of products) {
      await Inventory.updateOne(
        { productId: product._id.toString() },
        {
          $set: {
            stock: product.stock || 0,
            reserved: 0,
            soldCount: product.purchase || 0,
            active: true,
            dateUpdate: Date.now(),
          },
          $setOnInsert: {
            productId: product._id.toString(),
            createDate: Date.now(),
            
          },
        },
        { upsert: true }
      );

      count++;
    }

    console.log(`✅ Seed/upsert thành công ${count} inventories`);
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedInventories();