const SizeTable = require("../models/sizeTable");
const Product = require("../models/product");
const validateMongoDbId = require("../utils/validateMongoDbId");
const HttpStatusCode = require("../config/HttpStatusCode");
const asyncHandler = require("express-async-handler");

const getAllSizeTables = asyncHandler(async (req, res) => {
  const sizeTables = await SizeTable.find();

  res.status(HttpStatusCode.OK).json({
    success: true,
    status: 200,
    message: "Successfully",
    data: sizeTables,
  });
});

const getSizeTableDetails = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const sizeTable = await SizeTable.findOne({ _id: id });
    if (sizeTable) {
      res.status(HttpStatusCode.OK).json({
        success: true,
        status: 200,
        message: "Successfully",
        data: sizeTable,
      });
    }
    res.status(HttpStatusCode.NOT_FOUND).json({
      success: false,
      status: 401,
      message: "SizeTable is not found",
      data: [],
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

const updateSizeTable = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const updatedSizeTable = await SizeTable.findOneAndUpdate(
      { _id: id },
      {
        s38: req?.body?.s38 ?? 0,
        s39: req?.body?.s39 ?? 0,
        s40: req?.body?.s40 ?? 0,
        s41: req?.body?.s41 ?? 0,
        s42: req?.body?.s42 ?? 0,
        s43: req?.body?.s43 ?? 0,
        s44: req?.body?.s44 ?? 0,
        s45: req?.body?.s45 ?? 0,
        s46: req?.body?.s46 ?? 0,
        s47: req?.body?.s47 ?? 0,
        s48: req?.body?.s48 ?? 0,
      },
      {
        new: true,
      }
    );
    let number =
      req?.body?.s38 +
      req?.body?.s39 +
      req?.body?.s40 +
      req?.body?.s41 +
      req?.body?.s42 +
      req?.body?.s43 +
      req?.body?.s44 +
      req?.body?.s45 +
      req?.body?.s46 +
      req?.body?.s47 +
      req?.body?.s48;
    await Product.findByIdAndUpdate(updatedSizeTable.productId, {
      stock: number,
    });
    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: updatedSizeTable,
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
    });
  }
});

module.exports = { getAllSizeTables, getSizeTableDetails, updateSizeTable };
