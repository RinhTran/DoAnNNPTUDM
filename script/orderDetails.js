require("dotenv").config();

const mongoose = require("mongoose");
const OrderDetails = require("../models/orderdetails");
const Order = require("../models/order");
const Product = require("../models/product");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sizes = ["38", "39", "40", "41", "42", "43", "44"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomQuantity() {
  return Math.floor(Math.random() * 3) + 1;
}

async function seedOrderDetails() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const orders = await Order.find({}, "_id");
    const products = await Product.find({}, "_id name price image");

    if (!orders.length) {
      console.log("❌ Không có order nào. Hãy seed order trước.");
      await mongoose.connection.close();
      return;
    }

    if (!products.length) {
      console.log("❌ Không có product nào. Hãy seed product trước.");
      await mongoose.connection.close();
      return;
    }

    const orderDetailsData = [];

    await OrderDetails.deleteMany({});

    for (const order of orders) {
      const numberOfItems = Math.floor(Math.random() * 2) + 2;
      const usedProductIds = new Set();
      let orderTotal = 0;

      for (let i = 0; i < numberOfItems; i++) {
        let product = randomItem(products);

        while (
          usedProductIds.has(product._id.toString()) &&
          usedProductIds.size < products.length
        ) {
          product = randomItem(products);
        }

        usedProductIds.add(product._id.toString());

        const quantity = randomQuantity();
        const price = product.price;
        const total = price * quantity;

        orderTotal += total;

        orderDetailsData.push({
          orderId: order._id.toString(),
          productId: product._id.toString(),
          quantity: quantity.toString(),
          size: randomItem(sizes),
          price: price,
          total: total,
          imageUrl: product.image,
          name: product.name,
        });
      }

      await Order.findByIdAndUpdate(order._id, {
        total: orderTotal,
      });
    }

    const result = await OrderDetails.insertMany(orderDetailsData);

    console.log(`✅ Seed thành công ${result.length} order details`);
    console.log("👉 Collection:", OrderDetails.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedOrderDetails();