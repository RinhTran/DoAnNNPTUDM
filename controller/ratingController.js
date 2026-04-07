const Rating = require("../models/rating");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongoDbId");

const rating = asyncHandler(async (req, res) => {
  try {
    const { productId, rate } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!productId || !rate) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: "productId và rate là bắt buộc",
        data: null
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(HttpStatusCode.UNAUTHORIZED).json({
        success: false,
        status: 401,
        message: "Bạn cần đăng nhập để đánh giá sản phẩm",
        data: null
      });
    }

    validateMongoDbId(productId);

    // Lấy userId từ token thay vì từ body
    const userId = req.user._id;

    const result = await Rating.findOneAndUpdate(
      { userId, productId },
      { rate },
      { upsert: true, new: true }
    );

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Đánh giá thành công",
      data: result
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: null
    });
  }
});

 const getProductRatings = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    validateMongoDbId(productId);

    const ratings = await Rating.find({ productId })
      .populate("userId", "name avatar")
      .sort({ createDate: -1 });

    const averageRate = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rate, 0) / ratings.length
      : 0;

    // Tính ratingDistribution
    const ratingDistribution = [0, 0, 0, 0, 0, 0]; // index 0 bỏ, 1-5 dùng
    ratings.forEach(r => {
      if (r.rate >= 1 && r.rate <= 5) {
        ratingDistribution[r.rate] += 1;
      }
    });

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: {
        ratings,
        averageRate: parseFloat(averageRate.toFixed(1)),
        totalRatings: ratings.length,
        ratingDistribution
      }
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: null
    });
  }
});
module.exports = {
  rating,
  getProductRatings
};