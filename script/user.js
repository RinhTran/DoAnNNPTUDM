require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user");
const Profile = require("../models/profile");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const defaultAvatar =
  "https://cdn-icons-png.flaticon.com/512/6596/6596121.png";

const users = [
  {
    email: "admin@gmail.com",
    password: "123456",
    utype: "ADM",
    active: true,
  },
  {
    email: "staff@gmail.com",
    password: "123456",
    utype: "STF",
    active: true,
  },
  {
    email: "user1@gmail.com",
    password: "123456",
    utype: "USR",
    active: true,
  },
  {
    email: "user2@gmail.com",
    password: "123456",
    utype: "USR",
    active: true,
  },
  {
    email: "user3@gmail.com",
    password: "123456",
    utype: "USR",
    active: true,
  },
  {
    email: "user4@gmail.com",
    password: "123456",
    utype: "USR",
    active: true,
  },
  {
    email: "user5@gmail.com",
    password: "123456",
    utype: "USR",
    active: true,
  },
  {
    email: "user6@gmail.com",
    password: "123456",
    utype: "USR",
    active: true,
  },
  {
    email: "user7@gmail.com",
    password: "123456",
    utype: "USR",
    active: true,
  },
  {
    email: "user8@gmail.com",
    password: "123456",
    utype: "USR",
    active: true,
  },
];

async function seedUsers() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    await User.deleteMany({});
    await Profile.deleteMany({});

    for (const userData of users) {
      const newUser = await User.create(userData);

      const newProfile = await Profile.create({
        userId: newUser._id.toString(),
        imageUrl: defaultAvatar,
      });

      newUser.profile = newProfile;
      await newUser.save();
    }

    console.log("✅ Seed thành công 10 users");
    console.log("👉 Admin: admin@gmail.com / 123456");
    console.log("👉 Staff: staff@gmail.com / 123456");
    console.log("👉 User: user1@gmail.com ... user8@gmail.com / 123456");

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedUsers();