require("dotenv").config();

const mongoose = require("mongoose");
const SaleDetails = require("../models/saledetails");
const Sales = require("../models/sales");
const Product = require("../models/product");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedSaleDetails() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const salesList = await Sales.find({}, "_id salesName percent");
    const products = await Product.find({}, "_id name price");

    if (!salesList.length) {
      console.log("❌ Không có sales. Hãy seed sales trước.");
      await mongoose.connection.close();
      return;
    }

    if (!products.length) {
      console.log("❌ Không có products. Hãy seed product trước.");
      await mongoose.connection.close();
      return;
    }

    const saleDetailsData = [];

    for (const product of products) {
      const sale = randomItem(salesList);

      const salesPrice = Math.round(
        product.price - (product.price * sale.percent) / 100
      );

      saleDetailsData.push({
        salesId: sale._id.toString(),
        productId: product._id.toString(),
        salesPrice: salesPrice,
        updateBy: "admin",
      });
    }

    await SaleDetails.deleteMany({});
    const result = await SaleDetails.insertMany(saleDetailsData);

    console.log(`✅ Seed thành công ${result.length} sale details`);
    console.log("👉 Collection:", SaleDetails.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedSaleDetails();