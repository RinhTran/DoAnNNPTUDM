require("dotenv").config();

const mongoose = require("mongoose");
const SizeTable = require("../models/sizetable");
const Product = require("../models/product");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function randomStock(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedSizeTables() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const products = await Product.find({}, "_id name");

    if (!products.length) {
      console.log("❌ Không có product nào. Hãy seed product trước.");
      await mongoose.connection.close();
      return;
    }

    const sizeTables = products.map((product) => ({
      productId: product._id.toString(),
      s38: randomStock(0, 10),
      s39: randomStock(0, 10),
      s40: randomStock(0, 10),
      s41: randomStock(0, 10),
      s42: randomStock(0, 10),
      s43: randomStock(0, 10),
      s44: randomStock(0, 10),
      s45: randomStock(0, 10),
      s46: randomStock(0, 10),
      s47: randomStock(0, 10),
      s48: randomStock(0, 10),
    }));

    await SizeTable.deleteMany({});
    const result = await SizeTable.insertMany(sizeTables);

    console.log(`✅ Seed thành công ${result.length} size tables`);
    console.log("👉 Collection:", SizeTable.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedSizeTables();