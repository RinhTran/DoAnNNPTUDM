require("dotenv").config();

const mongoose = require("mongoose");
const Role = require("../models/role");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const roles = [
  {
    name: "ADM",
    description: "Quan tri vien",
    active: true,
  },
  {
    name: "STF",
    description: "Nhan vien",
    active: true,
  },
  {
    name: "USR",
    description: "Khach hang",
    active: true,
  },
];

async function seedRoles() {
  try {
    console.log("👉 DB:", mongoose.connection.name);

    for (const roleData of roles) {
      await Role.updateOne(
        { name: roleData.name },
        {
          $set: {
            description: roleData.description,
            active: roleData.active,
            dateUpdate: Date.now(),
          },
        },
        { upsert: true }
      );
    }

    console.log("✅ Seed/upsert thành công 3 roles");
    console.log("👉 ADM");
    console.log("👉 STF");
    console.log("👉 USR");

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    await mongoose.connection.close();
  }
}

seedRoles();