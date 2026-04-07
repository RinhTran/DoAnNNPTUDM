const User = require("../models/user");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");

let token;

const verifyToken = asyncHandler(async (req, res, next) => {

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 401,
        message: "Not Authorized token expired, Please Login again",
        data: null
      });
    }
  } else {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 401,
      message: "There is no token attached to header",
      data: null
    });
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findById(decoded?.id);
    if (adminUser.utype != "ADM") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 401,
        message: "You are not an admin",
      });
    } else {
      next();
    }
  } else {
    next();
  }

});

const isStaff = asyncHandler(async (req, res, next) => {
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const staffUser = await User.findById(decoded?.id);
    if (staffUser.utype !== "STF") {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 401,
        message: "You are not an Staff",
      });
    } else {
      next();
    }
  } else {
    next();
  }

});

module.exports = { verifyToken, isAdmin, isStaff };
