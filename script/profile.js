require("dotenv").config();

const mongoose = require("mongoose");
const Profile = require("../models/profile");
const User = require("../models/user");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const firstNames = ["Anh", "Bình", "Cường", "Dũng", "Hùng", "Nam"];
const lastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng"];

const addresses = [
  "Quận 1, TP.HCM",
  "Quận Bình Thạnh, TP.HCM",
  "Thủ Đức, TP.HCM",
  "Quận 7, TP.HCM",
  "Gò Vấp, TP.HCM"
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  return "0" + Math.floor(100000000 + Math.random() * 900000000);
}

async function seedProfiles() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    const users = await User.find({}, "_id");

    if (!users.length) {
      console.log("❌ Không có user. Seed user trước.");
      await mongoose.connection.close();
      return;
    }

    const profiles = [];

    for (const user of users) {
      profiles.push({
        userId: user._id.toString(),
        firstName: randomItem(firstNames),
        lastName: randomItem(lastNames),
        address: randomItem(addresses),
        phone: randomPhone(),
        imageUrl: "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
      });
    }

    await Profile.deleteMany({});
    const result = await Profile.insertMany(profiles);

    console.log(`✅ Seed thành công ${result.length} profiles`);
    console.log("👉 Collection:", Profile.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedProfiles();