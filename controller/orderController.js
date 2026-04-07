const Product = require("../models/product");
const Status = require("../models/status");
const Order = require("../models/order");
const OrderDetails = require("../models/orderDetails");
const OrderOrderDetails = require("../models/OrderOrderDetails");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    validateMongoDbId(userId);

    const orderModel = req.body.orderModel;
    const listOrderDetails = req.body.listOrderDetails;

    const newOrder = await Order.create({
      userId: userId,
      firstName: orderModel.firstName,
      lastName: orderModel.lastName,
      phone: orderModel.phone,
      email: orderModel.email,
      note: orderModel.note,
      address: orderModel.address,
      total: 0,
      momo: null,
      payment: false,
    });

    const newArray = [];
    return Promise.all([
      fastFunction(listOrderDetails, newOrder, newArray),
      slowFunction(newOrder, newArray, res),
    ]);
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: null,
    });
  }
});

function fastFunction(listOrderDetails, newOrder, newArray) {
  return new Promise((resolve) => {
    setTimeout(async function () {
      listOrderDetails.forEach(async (element) => {
        const newOrderDetails = await OrderDetails.create({
          orderId: newOrder._id,
          productId: element.productId,
          quantity: element.quantity,
          size: element.size,
          price: element.price,
          total: element.price * element.quantity,
        });
        newOrder.total += newOrderDetails.total;
        newArray.push(newOrderDetails);
      });
      const findStatus = await Status.find();
      newOrder.statusId = findStatus[0]._id;
      newOrder.save();
      resolve();
    }, 100);
  });
}

function slowFunction(newOrder, newArray, res) {
  return new Promise((resolve) => {
    setTimeout(function () {
      const orderOrderDetails = new OrderOrderDetails(newOrder, newArray);
      res.status(HttpStatusCode.OK).json({
        success: true,
        status: 200,
        message: "Successfully",
        data: orderOrderDetails,
      });
      resolve();
    }, 300);
  });
}

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find();
    const myArray = [];
    return Promise.all([fastFunction1(orders, myArray), slowFunction1(myArray, res)]);
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: null,
    });
  }
});

function fastFunction1(orders, myArray) {
  return new Promise((resolve) => {
    setTimeout(async function () {
      orders.forEach((element) => {
        configOrder(element, myArray);
      });
      resolve();
    }, 100);
  });
}

function fastFunction2(order, myArray) {
  return new Promise((resolve) => {
    setTimeout(function () {
      configOrder(order, myArray);
      resolve();
    }, 100);
  });
}

async function configOrder(element, myArray) {
  const findStatus = await Status.findOne({ _id: element.statusId });
  const firstValue = findStatus?.statusName || null;
  element.statusName = firstValue;

  const orderDetails = await OrderDetails.find({ orderId: element._id });
  orderDetails.forEach(async (detail) => {
    const product = await Product.findOne({ _id: detail.productId });
    if (product) {
      detail.name = product.name;
      detail.imageUrl = product.image;
    }
  });

  const orderOrderDetails = new OrderOrderDetails(element, orderDetails);
  myArray.push(orderOrderDetails);
}

function slowFunction1(myArray, res) {
  return new Promise((resolve) => {
    setTimeout(function () {
      res.status(HttpStatusCode.OK).json({
        success: true,
        status: 200,
        message: "Successfully",
        data: myArray,
      });
      resolve();
    }, 300);
  });
}

const getOrderDetails = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    validateMongoDbId(orderId);

    await Order.findOne({ _id: orderId })
      .then(async (order) => {
        if (order) {
          const Array = [];
          return Promise.all([fastFunction2(order, Array), slowFunction1(Array, res)]);
        } else {
          res.status(HttpStatusCode.NOT_FOUND).json({
            success: false,
            status: 404,
            message: "Cannot find orders.",
            data: null,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          status: 500,
          message: "An error occurred while searching for sales details.",
          data: null,
        });
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

const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    validateMongoDbId(userId);

    await Order.find({ userId: userId })
      .then(async (order) => {
        const Array = [];
        return Promise.all([fastFunction1(order, Array), slowFunction1(Array, res)]);
      })
      .catch((err) => {
        console.error(err);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          status: 500,
          message: "An error occurred while searching for orders.",
          data: null,
        });
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

const updateOrder = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    validateMongoDbId(orderId);

    await Order.findByIdAndUpdate({ _id: orderId })
      .then(async (order) => {
        if (order) {
          order.statusId = req.body.statusId;
          order.save();
          res.status(HttpStatusCode.OK).json({
            success: true,
            status: 200,
            message: "Successfully",
            data: order,
          });
        } else {
          res.status(HttpStatusCode.NOT_FOUND).json({
            success: false,
            status: 404,
            message: "Cannot find order.",
            data: null,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          status: 500,
          message: "An error occurred while payment for order.",
          data: null,
        });
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

const payment = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    validateMongoDbId(orderId);

    await Order.findByIdAndUpdate({ _id: orderId })
      .then(async (order) => {
        if (order) {
          order.payment = true;
          order.save();
          res.status(HttpStatusCode.OK).json({
            success: true,
            status: 200,
            message: "Successfully",
            data: order,
          });
        } else {
          res.status(HttpStatusCode.NOT_FOUND).json({
            success: false,
            status: 404,
            message: "Cannot find order.",
            data: null,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          status: 500,
          message: "An error occurred while payment for order.",
          data: null,
        });
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

const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    validateMongoDbId(orderId);

    const findStatus = await Status.find();
    await Order.findByIdAndUpdate({ _id: orderId })
      .then(async (order) => {
        if (order) {
          if (
            order.payment == true ||
            order.statusId == findStatus[3]._id ||
            order.statusId == findStatus[4]._id
          ) {
            res.status(HttpStatusCode.OK).json({
              success: true,
              status: 200,
              message: "Cannot cancel order.",
              data: null,
            });
          } else {
            order.statusId = findStatus[findStatus.length - 1]._id;
            order.save();
            var o = new Order(order);
            o.statusName = findStatus[findStatus.length - 1].statusName;
            res.status(HttpStatusCode.OK).json({
              success: true,
              status: 200,
              message: "Successfully",
              data: o,
            });
          }
        } else {
          res.status(HttpStatusCode.NOT_FOUND).json({
            success: false,
            status: 404,
            message: "Cannot find order.",
            data: null,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          status: 500,
          message: "An error occurred while cancel for order.",
          data: null,
        });
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
  createOrder,
  getAllOrders,
  getOrderDetails,
  updateOrder,
  payment,
  cancelOrder,
  getMyOrders,
};