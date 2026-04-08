const Payment = require("../models/payment");
const Reservation = require("../models/reservation");
const Inventory = require("../models/inventory");
const Order = require("../models/order");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongoDbId");
const axios = require("axios");
const crypto = require("crypto");

const MOMO_ENDPOINT =
  process.env.MOMO_ENDPOINT ||
  "https://test-payment.momo.vn/v2/gateway/api/create";
const MOMO_PARTNER_CODE =
  process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529";
const MOMO_ACCESS_KEY =
  process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j";
const MOMO_SECRET_KEY =
  process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
const MOMO_REDIRECT_URL =
  process.env.MOMO_REDIRECT_URL ||
  "http://localhost:8081/payment/momo-return";
const MOMO_IPN_URL =
  process.env.MOMO_IPN_URL || "http://localhost:5000/api/momo-ipn";

const createPayment = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    validateMongoDbId(userId);

    const payload = {
      ...req.body,
      userId,
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
        for (const item of reservation.items || []) {
          const inventory = await Inventory.findOne({
            productId: item.productId,
          });
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

    return res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: newPayment,
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

const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find();
  return res.status(HttpStatusCode.OK).json({
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

    return res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: payment,
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

const getMyPayments = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    validateMongoDbId(userId);

    const payments = await Payment.find({ userId });

    return res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: payments,
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
    findPayment.transactionId =
      req?.body?.transactionId ?? findPayment.transactionId;
    findPayment.status = req?.body?.status ?? findPayment.status;
    findPayment.currency = req?.body?.currency ?? findPayment.currency;
    findPayment.amount = req?.body?.amount ?? findPayment.amount;
    findPayment.providerResponse =
      req?.body?.providerResponse ?? findPayment.providerResponse;
    findPayment.idempotencyKey =
      req?.body?.idempotencyKey ?? findPayment.idempotencyKey;
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
        for (const item of reservation.items || []) {
          const inventory = await Inventory.findOne({
            productId: item.productId,
          });
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

    return res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: findPayment,
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

const createMomoPayment = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    validateMongoDbId(userId);

    const { orderId, reservationId, orderInfo } = req.body;

    if (!orderId) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: "orderId is required",
        data: null,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "order is not found",
        data: null,
      });
    }

    if (String(order.userId) !== String(userId) && req.user.utype === "USR") {
      return res.status(HttpStatusCode.FORBIDDEN).json({
        success: false,
        status: 403,
        message: "You cannot pay this order",
        data: null,
      });
    }

    const amount = Math.round(Number(order.total || 0));
    if (!Number.isFinite(amount) || amount < 1000 || amount > 10000000) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: "Amount must be from 1,000 to 10,000,000 VND",
        data: null,
      });
    }

    const requestId = `RE${Date.now()}`;
    const momoOrderId = `OD${Date.now()}`;
const requestType = "payWithMethod";


    const finalOrderInfo = orderInfo || `Thanh toan don hang ${orderId}`;
    const finalRedirectUrl = MOMO_REDIRECT_URL;
    const finalIpnUrl = MOMO_IPN_URL;

    const extraData = Buffer.from(
      JSON.stringify({
        orderId,
        reservationId: reservationId || "",
        userId: String(userId),
      }),
      "utf8"
    ).toString("base64");

    const userInfo = {
      name: `${req.user?.profile?.lastName || ""} ${req.user?.profile?.firstName || ""}`.trim(),
      phoneNumber: req.user?.profile?.phone || "",
      email: req.user?.email || req.body?.email || "",
    };

    if (!userInfo.email) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: "Email is required for credit card payment",
        data: null,
      });
    }

    const rawSignature =
      `accessKey=${MOMO_ACCESS_KEY}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${finalIpnUrl}` +
      `&orderId=${momoOrderId}` +
      `&orderInfo=${finalOrderInfo}` +
      `&partnerCode=${MOMO_PARTNER_CODE}` +
      `&redirectUrl=${finalRedirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: MOMO_PARTNER_CODE,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount,
      orderId: momoOrderId,
      orderInfo: finalOrderInfo,
      userInfo,
      redirectUrl: finalRedirectUrl,
      ipnUrl: finalIpnUrl,
      requestType,
      extraData,
      autoCapture: true,
      lang: "vi",
      signature,
    };

    const momoRes = await axios.post(MOMO_ENDPOINT, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });

    const momoData = momoRes.data;

    if (Number(momoData?.resultCode) !== 0 || !momoData?.payUrl) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: momoData?.message || "MoMo create credit card payment failed",
        data: momoData || null,
      });
    }

    const paymentDoc = await Payment.create({
      userId,
      orderId,
      reservationId: reservationId || null,
      method: "MOMO_CC",
      transactionId: null,
      status: "pending",
      currency: "VND",
      amount,
      providerResponse: momoData,
      idempotencyKey: requestId,
      note: momoData?.message || "Create momo credit card payment",
    });

    return res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Create momo credit card payment successfully",
      data: {
        payment: paymentDoc,
        momo: momoData,
      },
    });
  } catch (error) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error?.response?.data?.message || error.message,
      data: error?.response?.data || null,
    });
  }
});

const momoIpn = asyncHandler(async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    const rawSignature =
      `accessKey=${MOMO_ACCESS_KEY}` +
      `&amount=${amount}` +
      `&extraData=${extraData || ""}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: "Invalid signature",
        data: null,
      });
    }

    let decodedExtraData = {};
    try {
      decodedExtraData = extraData
        ? JSON.parse(Buffer.from(extraData, "base64").toString("utf8"))
        : {};
    } catch (e) {
      decodedExtraData = {};
    }

    const realOrderId = decodedExtraData.orderId || null;
    const reservationId = decodedExtraData.reservationId || null;
    const paidSuccess = Number(resultCode) === 0;

    let payment = await Payment.findOne({ idempotencyKey: requestId });

    if (!payment) {
      payment = await Payment.create({
        userId: decodedExtraData.userId || null,
        orderId: realOrderId,
        reservationId,
        method: "MOMO",
        transactionId: transId ? String(transId) : null,
        status: paidSuccess ? "paid" : "failed",
        currency: "VND",
        amount: Number(amount || 0),
        providerResponse: req.body,
        idempotencyKey: requestId,
        note: message || "MoMo IPN",
      });
    } else {
      payment.transactionId = transId ? String(transId) : payment.transactionId;
      payment.status = paidSuccess ? "paid" : "failed";
      payment.providerResponse = req.body;
      payment.note = message || payment.note;
      await payment.save();
    }

    if (realOrderId) {
      const order = await Order.findById(realOrderId);
      if (order) {
        order.payment = paidSuccess;
        if (transId) {
          order.momo = String(transId);
        }
        await order.save();
      }
    }

    if (paidSuccess && reservationId) {
      const reservation = await Reservation.findById(reservationId);
      if (reservation && reservation.status === "actived") {
        for (const item of reservation.items || []) {
          const inventory = await Inventory.findOne({
            productId: item.productId,
          });
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

    return res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "IPN processed successfully",
      data: payment,
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
  createPayment,
  getAllPayments,
  getPaymentDetails,
  getMyPayments,
  updatePayment,
  createMomoPayment,
  momoIpn,
};