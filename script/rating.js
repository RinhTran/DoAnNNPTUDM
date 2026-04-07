require("dotenv").config();

const mongoose = require("mongoose");
const Rating = require("../models/rating");
const User = require("../models/user");
const Product = require("../models/product");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function randomRate() {
  return Math.floor(Math.random() * 5) + 1; // 1 -> 5
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedRatings() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const users = await User.find({ utype: "USR" }, "_id");
    const products = await Product.find({}, "_id");

    if (!users.length) {
      console.log("❌ Không có user");
      return mongoose.connection.close();
    }

    if (!products.length) {
      console.log("❌ Không có product");
      return mongoose.connection.close();
    }

    const ratings = [];
    const used = new Set(); // tránh trùng user + product

    for (let i = 0; i < 50; i++) {
      const user = randomItem(users);
      const product = randomItem(products);

      const key = user._id + "_" + product._id;

      if (used.has(key)) continue;
      used.add(key);

      ratings.push({
        userId: user._id.toString(),
        productId: product._id.toString(),
        rate: randomRate(),
      });
    }

    await Rating.deleteMany({});
    const result = await Rating.insertMany(ratings);

    console.log(`✅ Seed thành công ${result.length} ratings`);
    console.log("👉 Collection:", Rating.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedRatings();