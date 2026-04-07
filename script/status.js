
require("dotenv").config(); 

const mongoose = require("mongoose");
const Status = require("../models/status");


mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedStatus = async () => {
  try {
    await Status.deleteMany(); // reset cho sạch

    const statuses = await Status.insertMany([
      { statusName: "Pending" },
      { statusName: "Confirmed" },
      { statusName: "Shipping" },
      { statusName: "Completed" },
      { statusName: "Cancelled" }
    ]);

    console.log("✅ Seed Status thành công:");
    console.log(statuses);
    process.exit();
  } catch (error) {
    console.log("❌ Lỗi:", error);
    process.exit(1);
  }
};

seedStatus();