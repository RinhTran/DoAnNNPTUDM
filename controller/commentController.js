const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const Comment = require("../models/comment");
const Product = require("../models/product");
const Profile = require("../models/profile");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createComment = asyncHandler(async (req, res) => {
  try {
    const id = req.body.productId;
    validateMongoDbId(id);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "product is not found",
        data: null
      });
    }

    const payload = {
      ...req.body,
      userId: req.user?._id ?? req.body.userId
    };

    const comment = await Comment.create(payload);

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: comment
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

const getAllComments = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);

    const comments = await Comment.find({ productId: id }).sort({ createDate: -1 });

    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        const profile = await Profile.findOne({ userId: comment.userId.toString() });

        let name = "Người dùng";
        if (profile) {
          name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
          if (!name) name = "Người dùng";
        }

        return {
          ...comment.toObject(),
          user: {
            name: name,
            avatar: profile ? profile.imageUrl : null
          }
        };
      })
    );

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: formattedComments
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
  createComment,
  getAllComments
};