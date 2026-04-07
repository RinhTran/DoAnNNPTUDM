const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const SearchHistory = require("../models/searchHistory");
const Product = require("../models/product");

const insertOrUpdateKeyword = asyncHandler(async (req, res) => {
  try {
    const userId = req?.body?.userId;

    await SearchHistory.findOneAndUpdate({ userId: userId }).then(async (searchHistory) => {
      if (searchHistory) {
        searchHistory.keyword = req?.body?.keyword;
        searchHistory.save();
        res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: searchHistory });
      } else {
        const searchHistory = await SearchHistory.create(req.body);
        res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: searchHistory });
      }
    }).catch((err) => {
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, status: 500, message: "An error occurred while insert or update searchHistory.", data: null });
    });

  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const getProductByUserId = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const docs = await Product.find();
    var arr = [];
    await SearchHistory.findOne({ userId: userId }).then(async searchHistory => {
      if (searchHistory) {
        docs.forEach(element => {
          if(element.name.toLowerCase().includes(searchHistory.keyword.toLowerCase())){
            arr.push(element);
            console.log(element.name);
          }
        });
        res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: arr });
      } else {
        
        res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: docs });
      }
    }).catch((err) => {
      console.log(err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, status: 500, message: "An error occurred while searching searchHistory.", data: null });
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

module.exports = {
  insertOrUpdateKeyword,
  getProductByUserId
};