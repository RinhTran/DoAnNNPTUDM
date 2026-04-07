require("dotenv").config();

const mongoose = require("mongoose");
const SearchHistory = require("../models/searchhistory");
const User = require("../models/user");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const keywords = [
  "nike",
  "adidas",
  "puma",
  "giày thể thao",
  "giày chạy bộ",
  "giày sneaker nam",
  "giày sale",
  "air force 1",
  "ultraboost",
  "giày local brand",
  "giày trắng",
  "giày đen",
  "sneaker hot",
  "giày đi học",
  "giày đi chơi"
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedSearchHistory() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const users = await User.find({ utype: "USR" }, "_id email");

    if (!users.length) {
      console.log("❌ Không có user USR. Seed user trước.");
      await mongoose.connection.close();
      return;
    }

    const histories = [];

    // tạo 30 lịch sử tìm kiếm
    for (let i = 0; i < 30; i++) {
      const user = randomItem(users);

      histories.push({
        userId: user._id.toString(),
        keyword: randomItem(keywords),
      });
    }

    await SearchHistory.deleteMany({});
    const result = await SearchHistory.insertMany(histories);

    console.log(`✅ Seed thành công ${result.length} search histories`);
    console.log("👉 Collection:", SearchHistory.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedSearchHistory();