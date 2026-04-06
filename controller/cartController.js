const Cart = require("../models/cart");
const Product = require("../models/product");
const Inventory = require("../models/inventory");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongoDbId");

const getMyCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    validateMongoDbId(userId);

    const cart = await Cart.findOne({ userId: userId });

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: cart || { userId, products: [] },
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

const addToCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity, size } = req.body;

    validateMongoDbId(userId);
    validateMongoDbId(productId);

    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      cart = await Cart.create({ userId: userId, products: [] });
    }

    const product = await Product.findById(productId);
    const inventory = await Inventory.findOne({ productId: productId });

    if (!product || !inventory) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "product is not found",
        data: null,
      });
    }

    const qty = Number(quantity || 1);
    if (qty <= 0) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: "quantity must be greater than 0",
        data: null,
      });
    }

    const findIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId.toString() &&
        (item.size || "") === (size || "")
    );

    let currentQty = 0;
    if (findIndex >= 0) {
      currentQty = Number(cart.products[findIndex].quantity || 0);
    }

    if (inventory.stock < currentQty + qty) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: "quantity in stock is not enough",
        data: null,
      });
    }

    if (findIndex >= 0) {
      cart.products[findIndex].quantity += qty;
    } else {
      cart.products.push({
        productId: productId,
        quantity: qty,
        size: size,
        price: product.price,
        imageUrl: product.image,
        name: product.name,
      });
    }

    await cart.save();

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: cart,
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

const updateCartItem = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity, size } = req.body;

    validateMongoDbId(userId);
    validateMongoDbId(productId);

    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "cart is not found",
        data: null,
      });
    }

    const inventory = await Inventory.findOne({ productId: productId });
    if (!inventory) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "inventory is not found",
        data: null,
      });
    }

    const findIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId.toString() &&
        (item.size || "") === (size || "")
    );

    if (findIndex < 0) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "product is not found in cart",
        data: null,
      });
    }

    const qty = Number(quantity || 0);

    if (qty < 0) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: "quantity cannot be less than 0",
        data: null,
      });
    }

    if (qty === 0) {
      cart.products.splice(findIndex, 1);
    } else {
      if (inventory.stock < qty) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          status: 400,
          message: "quantity in stock is not enough",
          data: null,
        });
      }

      cart.products[findIndex].quantity = qty;
    }

    await cart.save();

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: cart,
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

const removeCartItem = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, size } = req.body;

    validateMongoDbId(userId);
    validateMongoDbId(productId);

    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "cart is not found",
        data: null,
      });
    }

    const findIndex = cart.products.findIndex(
      (item) =>
        item.productId.toString() === productId.toString() &&
        (item.size || "") === (size || "")
    );

    if (findIndex < 0) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "product is not found in cart",
        data: null,
      });
    }

    cart.products.splice(findIndex, 1);
    await cart.save();

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: cart,
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

module.exports = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};