const Reservation = require("../models/reservation");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongoDbId");
const Product = require("../models/product");        
const Inventory = require("../models/inventory");   

 const createReservation = asyncHandler(async (req, res) => {
  try {
    const body = req.body;
    const items = body.items || [];
    if (items.length === 0) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: "items is required", data: null });
    }

    for (const item of items) {
      validateMongoDbId(item.productId);
      const product = await Product.findById(item.productId);
      const inventory = await Inventory.findOne({ productId: item.productId });

      if (!product || !inventory) {
        return res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 404, message: "product is not found", data: null });
      }
      if (inventory.stock < Number(item.quantity || 0)) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: `quantity in stock is not enough for ${product.name}`, data: null });
      }

      item.name = item.name || product.name;
      item.price = item.price ?? product.price;
      item.imageUrl = item.imageUrl || product.image;
    }

    const newReservation = await Reservation.create(body);

    for (const item of newReservation.items) {
      const inventory = await Inventory.findOne({ productId: item.productId });
      inventory.stock -= Number(item.quantity || 0);
      inventory.reserved += Number(item.quantity || 0);
      await inventory.save();

      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = inventory.stock;
        await product.save();
      }
    }

    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: newReservation });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});
const getAllReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate({
      path: "userId",
      select: "email utype",
      populate: {
        path: "profile",
        select: "firstName lastName phone address"
      }
    })
    .sort({ createDate: -1 });

  res.status(HttpStatusCode.OK).json({ 
    success: true, 
    status: 200, 
    message: "Successfully", 
    data: reservations 
  });
});

 const getReservationDetails = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const reservation = await Reservation.findById(id)
      .populate({
        path: "userId",
        select: "email utype",
        populate: {
          path: "profile",
          select: "firstName lastName phone address"
        }
      });

    if (reservation) {
      return res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: reservation });
    }
    res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 404, message: "reservation is not found", data: null });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});
const getReservationsByUserId = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    validateMongoDbId(userId);
    const reservations = await Reservation.find({ userId: userId });
    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: reservations });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

async function rollbackInventory(items) {
  for (const item of items) {
    const inventory = await Inventory.findOne({ productId: item.productId });
    if (inventory) {
      inventory.stock += Number(item.quantity || 0);
      inventory.reserved = Math.max(0, Number(inventory.reserved || 0) - Number(item.quantity || 0));
      await inventory.save();
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = inventory.stock;
        await product.save();
      }
    }
  }
}

const updateReservation = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 404, message: "reservation is not found", data: null });
    }
    reservation.status = req?.body?.status ?? reservation.status;
    reservation.promotion = req?.body?.promotion ?? reservation.promotion;
    reservation.idempotencyKey = req?.body?.idempotencyKey ?? reservation.idempotencyKey;
    reservation.orderId = req?.body?.orderId ?? reservation.orderId;
    await reservation.save();
    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: reservation });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const cancelReservation = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 404, message: "reservation is not found", data: null });
    }
    if (reservation.status !== "actived") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: "reservation cannot cancel", data: null });
    }
    await rollbackInventory(reservation.items);
    reservation.status = "cancelled";
    await reservation.save();
    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: reservation });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const transferReservation = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 404, message: "reservation is not found", data: null });
    }
    reservation.status = "transfer";
    reservation.orderId = req?.body?.orderId ?? reservation.orderId;
    await reservation.save();
    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: reservation });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

module.exports = { 
  createReservation, 
  getAllReservations, 
  getReservationDetails, 
  getReservationsByUserId, 
  updateReservation, 
  cancelReservation, 
  transferReservation 
};