require("dotenv").config();

const mongoose = require("mongoose");
const Category = require("../models/category"); // sửa path nếu cần

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const categories = [
  { categoryName: "Sneakers" },
  { categoryName: "Running Shoes" },
  { categoryName: "Basketball Shoes" },
  { categoryName: "Sandals" },
  { categoryName: "Boots" },
  { categoryName: "Loafers" },
  { categoryName: "Formal Shoes" },
  { categoryName: "Slippers" },
  { categoryName: "High Heels" },
  { categoryName: "Local Brand Shoes" }
];

async function seedCategories() {
  try {
    console.log("👉 DB đang dùng:", mongoose.connection.name);

    await Category.deleteMany({});
    const result = await Category.insertMany(categories);

    console.log("✅ Seed thành công:", result.length, "categories");
    console.log("👉 Collection:", Category.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedCategories();