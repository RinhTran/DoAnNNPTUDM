require("dotenv").config();

const mongoose = require("mongoose");
const Order = require("../models/order");
const OrderDetails = require("../models/orderdetails");
const OrderOrderDetails = require("../models/OrderOrderDetails"); // sửa path đúng file của anh

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function buildOrderOrderDetails() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const orders = await Order.find();
    const orderDetails = await OrderDetails.find();

    if (!orders.length) {
      console.log("❌ Không có order nào.");
      await mongoose.connection.close();
      return;
    }

    const result = orders.map((order) => {
      const listOrderDetails = orderDetails.filter(
        (detail) => detail.orderId === order._id.toString()
      );

      return new OrderOrderDetails(order, listOrderDetails);
    });

    console.log("✅ Tạo danh sách OrderOrderDetails thành công");
    console.log(JSON.stringify(result, null, 2));

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

buildOrderOrderDetails();