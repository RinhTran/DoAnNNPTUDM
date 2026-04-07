const Inventory = require("../models/inventory");
const Product = require("../models/product");
const SizeTable = require("../models/sizeTable");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createInventory = asyncHandler(async (req, res) => {
  try {
    const productId = req.body.productId;
    validateMongoDbId(productId);

    const findProduct = await Product.findById(productId);
    if (!findProduct) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ 
        success: false, 
        status: 404, 
        message: "product is not found", 
        data: null 
      });
    }

    const findInventory = await Inventory.findOne({ productId });
    if (findInventory) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ 
        success: false, 
        status: 400, 
        message: "inventory already exists", 
        data: findInventory 
      });
    }

    const sizeTable = await SizeTable.findOne({ productId });

    let totalStock = 0;
    let sizeStockData = {};

    if (sizeTable) {
      const sizeObj = sizeTable.toObject();
      delete sizeObj._id;
      delete sizeObj.productId;
      delete sizeObj.__v;
      sizeStockData = sizeObj;
      totalStock = Object.values(sizeObj).reduce((sum, val) => sum + (Number(val) || 0), 0);
    }

    const newInventory = await Inventory.create({
      productId,
      stock: totalStock,
      reserved: 0,
      soldCount: 0,
      sizeStock: sizeStockData,
      active: true
    });

    res.status(HttpStatusCode.OK).json({ 
      success: true, 
      status: 200, 
      message: "Tạo inventory thành công", 
      data: newInventory 
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

const getAllInventories = asyncHandler(async (req, res) => {
  try {
    const inventories = await Inventory.find().lean();

    const enrichedInventories = await Promise.all(
      inventories.map(async (inv) => {
        const product = await Product.findById(inv.productId).select("name price image");
        return {
          ...inv,
          productName: product ? product.name : "Sản phẩm không tồn tại",
          productPrice: product ? product.price : 0,
          productImage: product ? product.image : null,
        };
      })
    );

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: enrichedInventories
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

const getInventoryDetails = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const inventory = await Inventory.findById(id);
    if (inventory) {
      return res.status(HttpStatusCode.OK).json({ 
        success: true, 
        status: 200, 
        message: "Successfully", 
        data: inventory 
      });
    }
    res.status(HttpStatusCode.NOT_FOUND).json({ 
      success: false, 
      status: 404, 
      message: "inventory is not found", 
      data: null 
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

const getInventoryByProductId = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    validateMongoDbId(productId);
    const inventory = await Inventory.findOne({ productId });
    if (inventory) {
      return res.status(HttpStatusCode.OK).json({ 
        success: true, 
        status: 200, 
        message: "Successfully", 
        data: inventory 
      });
    }
    res.status(HttpStatusCode.NOT_FOUND).json({ 
      success: false, 
      status: 404, 
      message: "inventory is not found", 
      data: null 
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

const updateInventory = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const inventory = await Inventory.findById(id);
    if (!inventory) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ 
        success: false, 
        status: 404, 
        message: "inventory is not found", 
        data: null 
      });
    }

    inventory.stock = req?.body?.stock ?? inventory.stock;
    inventory.reserved = req?.body?.reserved ?? inventory.reserved;
    inventory.soldCount = req?.body?.soldCount ?? inventory.soldCount;
    inventory.active = req?.body?.active ?? inventory.active;
    if (req.body.sizeStock) inventory.sizeStock = req.body.sizeStock;

    await inventory.save();

    const product = await Product.findById(inventory.productId);
    if (product) {
      product.stock = inventory.stock;
      await product.save();
    }

    res.status(HttpStatusCode.OK).json({ 
      success: true, 
      status: 200, 
      message: "Successfully", 
      data: inventory 
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

const addStock = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    validateMongoDbId(productId);
    const quantity = Number(req.body.quantity || 0);
    const size = req.body.size;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ 
        success: false, 
        status: 404, 
        message: "inventory is not found", 
        data: null 
      });
    }

    if (size && inventory.sizeStock) {
      inventory.sizeStock[size] = (inventory.sizeStock[size] || 0) + quantity;
    }
    inventory.stock += quantity;
    await inventory.save();

    const product = await Product.findById(productId);
    if (product) {
      product.stock = inventory.stock;
      await product.save();
    }

    res.status(HttpStatusCode.OK).json({ 
      success: true, 
      status: 200, 
      message: "Successfully", 
      data: inventory 
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

const removeStock = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;
    validateMongoDbId(productId);
    const quantity = Number(req.body.quantity || 0);
    const size = req.body.size;

    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ 
        success: false, 
        status: 404, 
        message: "inventory is not found", 
        data: null 
      });
    }

    if (size && inventory.sizeStock) {
      const current = inventory.sizeStock[size] || 0;
      if (current < quantity) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({ 
          success: false, 
          status: 400, 
          message: "quantity in this size is not enough", 
          data: null 
        });
      }
      inventory.sizeStock[size] = current - quantity;
    } else if (inventory.stock < quantity) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ 
        success: false, 
        status: 400, 
        message: "quantity in stock is not enough", 
        data: null 
      });
    }

    inventory.stock -= quantity;
    await inventory.save();

    const product = await Product.findById(productId);
    if (product) {
      product.stock = inventory.stock;
      await product.save();
    }

    res.status(HttpStatusCode.OK).json({ 
      success: true, 
      status: 200, 
      message: "Successfully", 
      data: inventory 
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
  createInventory, 
  getAllInventories, 
  getInventoryDetails, 
  getInventoryByProductId, 
  updateInventory, 
  addStock, 
  removeStock 
};