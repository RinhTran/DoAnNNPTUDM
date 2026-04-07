const Sales = require("../models/sales");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongodbId");

const createSales = asyncHandler(async (req, res) => {
  try {
    const salesName = req.body.salesName;
    await Sales.findOne({ salesName: salesName }).then(async sales => {
      if (sales) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: "salesName is already", data: null });
      }
      else{
        const newSales = await Sales.create(req.body);
        res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: newSales });
      }
    }).catch((err) => {
      console.error(err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, status: 500, message: "An error occurred while creating the sales.", data: null });
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

const getAllSales = asyncHandler(async (req, res) => {
  const sales = await Sales.find();

  res.status(HttpStatusCode.OK).json({
    success: true,
    status: 200,
    message: "Successfully",
    data: sales
  });
});

const getAllSalesActive = asyncHandler(async (req, res) => {

  try {
    let list = [];
    const listSales = await Sales.find();
    let date = new Date().getTime();

    listSales.forEach(element => {
      if ((element.endDay > date || element.endDay == date) && element.startDay < date) {
        list.push(element);
      }
    });

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: list
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const getAllSalesComingSoon = asyncHandler(async (req, res) => {
  try {
    let list = [];
    const listSales = await Sales.find();
    let date = new Date().getTime();

    listSales.forEach(element => {
      if (element.startDay > date) {
        list.push(element);
      }
    });

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: list
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const getSalesById = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    await Sales.findOne({ _id: id }).then(sales => {
      if (sales) {
        res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: sales });
      } res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 401, message: "sales is not found", data: null });
    }).catch((err) => {
      console.error(err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, status: 500, message: "An error occurred while creating the sales.", data: null });
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const updateSales = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const updatedSales = await Sales.findOneAndUpdate(
      { _id: id },
      {
        salesName: req?.body?.salesName ?? updatedSales.SalesName,
        content: req?.body?.content ?? updatedSales.content,
        percent: req?.body?.percent ?? updatedSales.percent,
        startDay: req?.body?.startDay ?? updatedSales.startDay,
        endDay: req?.body?.endDay ?? updatedSales.endDay,
        banner: req?.body?.banner ?? updatedSales.banner,
      },
      {
        new: true,
      }
    );
    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: updatedSales });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

module.exports = {
  createSales,
  getAllSales,
  getSalesById,
  updateSales,
  getAllSalesActive,
  getAllSalesComingSoon
};
