const Payment = require("../models/payment");
const Reservation = require("../models/reservation");
const Inventory = require("../models/inventory");
const Order = require("../models/order");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createPayment = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    validateMongoDbId(userId);

    const payload = {
      ...req.body,
      userId: userId,
    };

    const newPayment = await Payment.create(payload);

    if (newPayment.orderId) {
      const order = await Order.findById(newPayment.orderId);
      if (order) {
        order.payment = newPayment.status === "paid";
        if (newPayment.method === "MOMO") {
          order.momo = newPayment.transactionId;
        }
        await order.save();
      }
    }

    if (newPayment.status === "paid" && newPayment.reservationId) {
      const reservation = await Reservation.findById(newPayment.reservationId);
      if (reservation && reservation.status === "actived") {
        for (const item of reservation.items) {
          const inventory = await Inventory.findOne({ productId: item.productId });
          if (inventory) {
            inventory.reserved = Math.max(
              0,
              Number(inventory.reserved || 0) - Number(item.quantity || 0)
            );
            inventory.soldCount += Number(item.quantity || 0);
            await inventory.save();
          }
        }
        reservation.status = "transfer";
        await reservation.save();
      }
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: newPayment,
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

const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find();
  res.status(HttpStatusCode.OK).json({
    success: true,
    status: 200,
    message: "Successfully",
    data: payments,
  });
});

const getPaymentDetails = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "payment is not found",
        data: null,
      });
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: payment,
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

const getMyPayments = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    validateMongoDbId(userId);

    const payments = await Payment.find({ userId: userId });

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: payments,
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

const updatePayment = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);

    const findPayment = await Payment.findById(id);
    if (!findPayment) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "payment is not found",
        data: null,
      });
    }

    findPayment.method = req?.body?.method ?? findPayment.method;
    findPayment.transactionId = req?.body?.transactionId ?? findPayment.transactionId;
    findPayment.status = req?.body?.status ?? findPayment.status;
    findPayment.currency = req?.body?.currency ?? findPayment.currency;
    findPayment.amount = req?.body?.amount ?? findPayment.amount;
    findPayment.providerResponse = req?.body?.providerResponse ?? findPayment.providerResponse;
    findPayment.idempotencyKey = req?.body?.idempotencyKey ?? findPayment.idempotencyKey;
    findPayment.note = req?.body?.note ?? findPayment.note;

    await findPayment.save();

    if (findPayment.orderId) {
      const order = await Order.findById(findPayment.orderId);
      if (order) {
        order.payment = findPayment.status === "paid";
        if (findPayment.method === "MOMO") {
          order.momo = findPayment.transactionId;
        }
        await order.save();
      }
    }

    if (findPayment.status === "paid" && findPayment.reservationId) {
      const reservation = await Reservation.findById(findPayment.reservationId);
      if (reservation && reservation.status === "actived") {
        for (const item of reservation.items) {
          const inventory = await Inventory.findOne({ productId: item.productId });
          if (inventory) {
            inventory.reserved = Math.max(
              0,
              Number(inventory.reserved || 0) - Number(item.quantity || 0)
            );
            inventory.soldCount += Number(item.quantity || 0);
            await inventory.save();
          }
        }
        reservation.status = "transfer";
        await reservation.save();
      }
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: findPayment,
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
  createPayment,
  getAllPayments,
  getPaymentDetails,
  getMyPayments,
  updatePayment,
};