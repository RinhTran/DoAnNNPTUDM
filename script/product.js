require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../models/product");
const Brand = require("../models/brand");
const Category = require("../models/category");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 👉 random helper
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 👉 fake name
const productNames = [
  "Nike Air Force 1",
  "Adidas Ultraboost",
  "Puma RS-X",
  "Jordan 1 Low",
  "Nike Dunk Low",
  "Yeezy Boost 350",
  "Converse Chuck 70",
  "Vans Old Skool",
  "MLB Chunky",
  "New Balance 550"
];

async function seedProducts() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    // 👉 lấy brand + category thật
    const brands = await Brand.find();
    const categories = await Category.find();

    if (!brands.length || !categories.length) {
      console.log("❌ Thiếu brand hoặc category, seed trước đi!");
      return;
    }

    let products = [];

    for (let i = 0; i < 10; i++) {
      const brand = randomItem(brands);
      const category = randomItem(categories);

      products.push({
        name: productNames[i] + " " + i, // tránh trùng unique
        price: Math.floor(Math.random() * 2000000) + 500000,
        image: "https://via.placeholder.com/300",
        description: "Giày đẹp, form chuẩn, chất lượng cao 🔥",
        rate: Math.floor(Math.random() * 5) + 1,
        productNew: Math.random() > 0.5,
        purchase: Math.floor(Math.random() * 100),
        stock: Math.floor(Math.random() * 50),
        active: true,
        updateBy: "admin",

        // 👉 quan trọng
        brandId: brand._id.toString(),
        categoryId: category._id.toString(),

        brandName: brand.brandName,
        categoryName: category.categoryName,

        sizeTable: {
          sizes: [38, 39, 40, 41, 42, 43]
        },

        sales: {
          discount: Math.floor(Math.random() * 30),
          sold: Math.floor(Math.random() * 100)
        }
      });
    }

    await Product.deleteMany({});
    const result = await Product.insertMany(products);

    console.log("✅ Seed thành công:", result.length, "products");
    console.log("👉 Collection:", Product.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedProducts();