const SaleDetails = require("../models/saleDetails");
const Sales = require("../models/sales");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");

const createSaleDetails = asyncHandler(async (req, res) => {
  try {
    const listSaleDetails = req.body.listProduct;
    let list = [];
    return await Promise.all([fastFunction(list, listSaleDetails, req), slowFunction(list, res)]);
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

function fastFunction(list, listSaleDetails, req) {
  return new Promise((resolve) => {
    setTimeout(async function () {
      listSaleDetails.forEach(async element => {
        const findSales = await Sales.findOne({ _id: req.body.salesId });
        const findProduct = await Product.findOne({ _id: element.productId });
        const saleDetails = await SaleDetails.findOne({ productId: element.productId });
        if (!saleDetails) {
          const newSaleDetails = await new SaleDetails({
            salesId: req.body.salesId,
            productId: element.productId,
            salesPrice:
              findProduct.price - (findProduct.price * findSales.percent) / 100,
            updateBy: req.body.updateBy,
          }).save();
          list.push(newSaleDetails);
        }
      });
      resolve()
    }, 100)
  })
}

function slowFunction(list, res) {
  return new Promise((resolve) => {
    setTimeout(function () {
      res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: list });
      resolve()
    }, 300)
  })
}

const getSaleDetailsBySalesId = asyncHandler(async (req, res) => {
  try {
    const salesId = req.params.id;
    await SaleDetails.find({ salesId: salesId })
      .then((details) => {
        res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: details });
      })
      .catch((err) => {
        console.error(err);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, status: 500, message: "An error occurred while searching for sales details.", data: null });
      });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const getAllSaleDetailsActive = asyncHandler(async (req, res) => {
  try {
    let list = [];
    const listSales = await Sales.find();
    return await Promise.all([fastFunctionActive(list, listSales), slowFunction(list, res)]);
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

function fastFunctionActive(list, listSales) {
  return new Promise((resolve) => {
    setTimeout(async function () {
      let date = new Date().getTime();
      listSales.forEach(async element => {
        if ((element.endDay > date || element.endDay == date) && element.startDay < date) {
          const listSaleDetails = await SaleDetails.find({ salesId: element.salesId });
          list.push(listSaleDetails);
          console.log(listSaleDetails);
        }
      });
      resolve()
    }, 100)
  })
}

const getAllSaleDetailsComingSoon = asyncHandler(async (req, res) => {
  try {
    let list = [];
    const listSales = await Sales.find();
    let date = new Date().getTime();

    listSales.forEach(async element => {
      if (element.startDay > date) {
        const listSaleDetails = await SaleDetails.find({ salesId: element.salesId });
        list.push(listSaleDetails);
      }
    });
    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: list });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const deleteSaleDetails = asyncHandler(async (req, res) => {
  try {
    const salesId = req.params.id;

    const listSaleDetails = await SaleDetails.find({ salesId: salesId });

    listSaleDetails.forEach(async element => {
      await SaleDetails.findOneAndDelete({ productId: element.productId });
    });

    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: null });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const deleteSaleDetailsByList = asyncHandler(async (req, res) => {
  try {
    const listSaleDetails = await req.body.listSalesDetails;
    listSaleDetails.forEach(async element => {
      await SaleDetails.findOneAndDelete({ productId: element.productId });
    });
    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: null });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});


module.exports = {
  createSaleDetails,
  getSaleDetailsBySalesId,
  deleteSaleDetails,
  getAllSaleDetailsComingSoon,
  getAllSaleDetailsActive,
  deleteSaleDetailsByList
};
