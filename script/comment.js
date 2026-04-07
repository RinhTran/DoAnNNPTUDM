require("dotenv").config();

const mongoose = require("mongoose");
const Comment = require("../models/comment");
const User = require("../models/user");
const Product = require("../models/product");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const commentContents = [
  "Giày đẹp, mang êm chân.",
  "Form chuẩn, đúng như hình.",
  "Chất lượng ổn trong tầm giá.",
  "Màu đẹp, dễ phối đồ.",
  "Đóng gói cẩn thận, giao hàng nhanh.",
  "Mang đi chơi rất hợp.",
  "Sản phẩm ok, sẽ ủng hộ tiếp.",
  "Đẹp hơn mong đợi.",
  "Đi khá thoải mái, không đau chân.",
  "Rất đáng tiền."
];

const commentImages = [
  "",
  "https://via.placeholder.com/150",
  "https://via.placeholder.com/300"
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDateInLast15Days() {
  const now = new Date();
  const past = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

async function seedComments() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    // Chỉ lấy khách hàng, không lấy admin/staff
    const users = await User.find({ utype: "USR" }, "_id email utype");
    const products = await Product.find({}, "_id name");

    if (!users.length) {
      console.log("❌ Không có user USR nào. Hãy seed user trước.");
      await mongoose.connection.close();
      return;
    }

    if (!products.length) {
      console.log("❌ Không có product nào. Hãy seed product trước.");
      await mongoose.connection.close();
      return;
    }

    const comments = [];

    // Mỗi product tạo 2 comment
    for (const product of products) {
      const usedUserIds = new Set();

      for (let i = 0; i < 2; i++) {
        let randomUser = randomItem(users);

        // hạn chế trùng user trên cùng 1 product
        while (usedUserIds.has(randomUser._id.toString()) && usedUserIds.size < users.length) {
          randomUser = randomItem(users);
        }

        usedUserIds.add(randomUser._id.toString());

        comments.push({
          userId: randomUser._id.toString(),
          productId: product._id.toString(),
          content: `${randomItem(commentContents)} (${product.name})`,
          image: randomItem(commentImages),
          createDate: randomDateInLast15Days(),
        });
      }
    }

    await Comment.deleteMany({});
    const result = await Comment.insertMany(comments);

    console.log(`✅ Seed thành công ${result.length} comments`);
    console.log("👉 Collection:", Comment.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedComments();