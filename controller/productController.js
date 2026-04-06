
const Product = require("../models/product");
const Brand = require("../models/brand");
const Sales = require("../models/sales");
const SaleDetails = require("../models/saleDetails");
const Category = require("../models/category");
const SizeTable = require("../models/sizeTable");
const Inventory = require("../models/inventory");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongodbId");

const createProduct = asyncHandler(async (req, res) => {
  try {
    const name = req.body.name;
    const findProduct = await Product.findOne({ name: name });
    if (findProduct) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: "product name is already", data: null });
    }
    else {
      const newProduct = await Product.create(req.body);
      const newSizeTable = await new SizeTable({
        productId: newProduct._id,
      }).save();
      const findInventory = await Inventory.findOne({ productId: newProduct._id.toString() });
      if (!findInventory) {
        await new Inventory({ productId: newProduct._id.toString(), stock: newProduct.stock || 0 }).save();
      }
      newProduct.sizeTable = newSizeTable;
      const findBrand = await Brand.findOne({ _id: newProduct.brandId });
      const findCategory = await Category.findOne({ _id: newProduct.categoryId });
      newProduct.brandName = findBrand.brandName;
      newProduct.categoryName = findCategory.categoryName;
      res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: newProduct });
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const mongoose = require("mongoose");

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find();

    const enrichedProducts = await Promise.all(
      products.map(async (element) => {
        const product = element.toObject();

        const findSizeTable = await SizeTable.findOne({ productId: element._id });

        let findBrand = null;
        let findCategory = null;
        let sales = null;

        if (element.brandId && mongoose.Types.ObjectId.isValid(element.brandId)) {
          findBrand = await Brand.findById(element.brandId);
        }

        if (element.categoryId && mongoose.Types.ObjectId.isValid(element.categoryId)) {
          findCategory = await Category.findById(element.categoryId);
        }

        const saleDetails = await SaleDetails.findOne({ productId: element._id });
        if (saleDetails && mongoose.Types.ObjectId.isValid(saleDetails.salesId)) {
          sales = await Sales.findById(saleDetails.salesId);
        }

        product.sales = sales || null;
        product.brandName = findBrand ? findBrand.brandName : null;
        product.categoryName = findCategory ? findCategory.categoryName : null;
        product.sizeTable = findSizeTable || null;

        return product;
      })
    );

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: enrichedProducts
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

function fastFunction(products) {
  return new Promise((resolve) => {
    setTimeout(function () {
      products.forEach(async (element) => {
        const findSizeTable = await SizeTable.findOne({ productId: element._id });
        const findBrand = await Brand.findOne({ _id: element.brandId });
        const findCategory = await Category.findOne({ _id: element.categoryId });
        const saleDetails = await SaleDetails.findOne({ productId: element._id });
        if (saleDetails) {
          const sales = await Sales.findOne({ _id: saleDetails.salesId });
          element.sales = sales;
        } else {
          element.sales = null;
        }
        element.brandName = findBrand.brandName;
        element.categoryName = findCategory.categoryName;
        element.sizeTable = findSizeTable;
      });
      resolve()
    }, 100)
  })
}

function slowFunction(products, res) {
  return new Promise((resolve) => {
    setTimeout(function () {
      res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: products });
      resolve()
    }, 300)
  })
}

const getProductDetails = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const product = await Product.findOne({ _id: id });
    if (product) {
      const findSizeTable = await SizeTable.findOne({ productId: product._id });
      const findBrand = await Brand.findOne({ _id: product.brandId });
      const findCategory = await Category.findOne({ _id: product.categoryId });
      const saleDetails = await SaleDetails.findOne({ productId: product._id });
      if (saleDetails) {
        const sales = await Sales.findOne({ _id: saleDetails.salesId });
        product.sales = sales;
      } else {
        product.sales = null;
      }
      product.brandName = findBrand.brandName;
      product.categoryName = findCategory.categoryName;
      product.sizeTable = findSizeTable;
      res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: product, });
    }
    else {
      res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 404, message: "cannot find product", data: null });
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const findProduct = await Product.findOne({ _id: id });
    if (!findProduct) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 404, message: "cannot find product", data: null });
    }
    else {
      const updatedProduct = await Product.findByIdAndUpdate(
        { _id: id },
        {
          name: req?.body?.name ?? findProduct.name,
          description: req?.body?.description ?? findProduct.description,
          brandId: req?.body?.brandId ?? findProduct.brandId,
          categoryId: req?.body?.categoryId ?? findProduct.categoryId,
          price: req?.body?.price ?? findProduct.price,
          rate: req?.body?.rate ?? findProduct.rate,
          productNew: req?.body?.productNew ?? findProduct.productNew,
          purchase: req?.body?.purchase ?? findProduct.purchase,
          stock: req?.body?.stock ?? findProduct.stock,
          active: req?.body?.active ?? findProduct.active,
          image: req?.body?.image ?? findProduct.image,
          dateUpdated: Date.now(),
          updateBy: req?.body?.updateBy,
        }, { new: true }
      );
      res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: updatedProduct });
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);

    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "cannot find product",
        data: null,
      });
    }

    await Product.findByIdAndDelete(id);

    
    await SizeTable.deleteOne({ productId: id });
    await Inventory.deleteOne({ productId: id });
    await SaleDetails.deleteMany({ productId: id });

    return res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Delete product successfully",
      data: findProduct,
    });
  } catch (error) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: null,
    });
  }
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductDetails,
  updateProduct,
  deleteProduct,
};