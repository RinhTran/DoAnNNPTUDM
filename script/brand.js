require("dotenv").config(); 

const mongoose = require("mongoose");
const Brand = require("../models/brand");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const brands = [
  {
    brandName: "Nike",
    information: "Thương hiệu thể thao nổi tiếng",
    logo: "https://logo.clearbit.com/nike.com"
  },
  {
    brandName: "Adidas",
    information: "Đối thủ lớn của Nike",
    logo: "https://logo.clearbit.com/adidas.com"
  },
  {
    brandName: "Puma",
    information: "Phong cách thể thao trẻ trung",
    logo: "https://logo.clearbit.com/puma.com"
  },
  {
    brandName: "Uniqlo",
    information: "Thời trang basic Nhật Bản",
    logo: "https://logo.clearbit.com/uniqlo.com"
  },
  {
    brandName: "Zara",
    information: "Fast fashion nổi tiếng",
    logo: "https://logo.clearbit.com/zara.com"
  },
  {
    brandName: "H&M",
    information: "Thời trang giá rẻ",
    logo: "https://logo.clearbit.com/hm.com"
  },
  {
    brandName: "Louis Vuitton",
    information: "Luxury brand",
    logo: "https://logo.clearbit.com/louisvuitton.com"
  },
  {
    brandName: "Gucci",
    information: "Thời trang cao cấp Ý",
    logo: "https://logo.clearbit.com/gucci.com"
  },
  {
    brandName: "Balenciaga",
    information: "Streetwear luxury",
    logo: "https://logo.clearbit.com/balenciaga.com"
  },
  {
    brandName: "Local Brand VN",
    information: "Thương hiệu local Việt Nam",
    logo: "https://via.placeholder.com/150"
  }
];

async function seedBrands() {
  try {
    console.log("👉 DB đang dùng:", mongoose.connection.name);

    await Brand.deleteMany({});
    const result = await Brand.insertMany(brands);

    console.log("✅ Seed thành công:", result.length);
    console.log("👉 Collection:", Brand.collection.name);

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Lỗi:", err);
  }
}

seedBrands();