require("dotenv").config();

const mongoose = require("mongoose");
const Sales = require("../models/sales"); // sửa path nếu cần

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const salesData = [
  {
    salesName: "Summer Sale 10%",
    content: "Khuyến mãi mùa hè giảm 10% cho nhiều sản phẩm.",
    percent: 10,
    banner: "https://via.placeholder.com/600x200?text=Summer+Sale+10%25",
    startDay: new Date("2026-04-01"),
    endDay: new Date("2026-04-10"),
  },
  {
    salesName: "Flash Sale 15%",
    content: "Flash sale giới hạn thời gian, giảm 15%.",
    percent: 15,
    banner: "https://via.placeholder.com/600x200?text=Flash+Sale+15%25",
    startDay: new Date("2026-04-05"),
    endDay: new Date("2026-04-07"),
  },
  {
    salesName: "Weekend Deal 20%",
    content: "Ưu đãi cuối tuần, giảm 20% toàn bộ giày thể thao.",
    percent: 20,
    banner: "https://via.placeholder.com/600x200?text=Weekend+Deal+20%25",
    startDay: new Date("2026-04-11"),
    endDay: new Date("2026-04-13"),
  },
  {
    salesName: "Back To School 12%",
    content: "Mua sắm mùa tựu trường, giảm 12% cho học sinh sinh viên.",
    percent: 12,
    banner: "https://via.placeholder.com/600x200?text=Back+To+School+12%25",
    startDay: new Date("2026-04-15"),
    endDay: new Date("2026-04-25"),
  },
  {
    salesName: "Hot Brand Sale 18%",
    content: "Giảm giá thương hiệu hot lên đến 18%.",
    percent: 18,
    banner: "https://via.placeholder.com/600x200?text=Hot+Brand+Sale+18%25",
    startDay: new Date("2026-04-20"),
    endDay: new Date("2026-04-30"),
  },
  {
    salesName: "Sneaker Fest 25%",
    content: "Lễ hội sneaker, ưu đãi cực mạnh 25%.",
    percent: 25,
    banner: "https://via.placeholder.com/600x200?text=Sneaker+Fest+25%25",
    startDay: new Date("2026-05-01"),
    endDay: new Date("2026-05-07"),
  },
  {
    salesName: "Member Day 8%",
    content: "Ưu đãi riêng cho thành viên thân thiết.",
    percent: 8,
    banner: "https://via.placeholder.com/600x200?text=Member+Day+8%25",
    startDay: new Date("2026-05-08"),
    endDay: new Date("2026-05-10"),
  },
  {
    salesName: "Mega Sale 30%",
    content: "Siêu sale toàn sàn, giảm đến 30%.",
    percent: 30,
    banner: "https://via.placeholder.com/600x200?text=Mega+Sale+30%25",
    startDay: new Date("2026-05-15"),
    endDay: new Date("2026-05-20"),
  },
  {
    salesName: "Mid Month Sale 14%",
    content: "Khuyến mãi giữa tháng cho nhiều mẫu mới.",
    percent: 14,
    banner: "https://via.placeholder.com/600x200?text=Mid+Month+Sale+14%25",
    startDay: new Date("2026-05-21"),
    endDay: new Date("2026-05-25"),
  },
  {
    salesName: "Clearance Sale 35%",
    content: "Xả kho cuối mùa, giảm sâu 35%.",
    percent: 35,
    banner: "https://via.placeholder.com/600x200?text=Clearance+Sale+35%25",
    startDay: new Date("2026-05-26"),
    endDay: new Date("2026-05-31"),
  },
];

async function seedSales() {
  try {
    console.log("👉 DB đang dùng:", mongoose.connection.name);

    await Sales.deleteMany({});
    const result = await Sales.insertMany(salesData);

    console.log("✅ Seed thành công:", result.length, "sales");
    console.log("👉 Collection:", Sales.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedSales();