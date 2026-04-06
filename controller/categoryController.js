const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const categoryName = req.body.categoryName;
    const findCategory = await Category.findOne({ categoryName });

    if (findCategory) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: "category name is already in use",
        data: null,
      });
    }

    const newCategory = await Category.create(req.body);
    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: newCategory,
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: [],
    });
  }
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  res.status(HttpStatusCode.OK).json({
    success: true,
    status: 200,
    message: "Successfully",
    data: categories,
  });
});

const getCategoryDetails = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);

    const category = await Category.findOne({ _id: id });

    if (category) {
      return res.status(HttpStatusCode.OK).json({
        success: true,
        status: 200,
        message: "Successfully",
        data: category,
      });
    }

    res.status(HttpStatusCode.NOT_FOUND).json({
      success: false,
      status: 404,
      message: "category is not found",
      data: null,
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: null,
    });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id },
      {
        categoryName: req?.body?.categoryName,
      },
      { new: true }
    );

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
    });
  }
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryDetails,
  updateCategory,
};