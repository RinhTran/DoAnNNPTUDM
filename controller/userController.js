const User = require("../models/user");
const Profile = require("../models/profile");
const validateMongoDbId = require("../utils/validateMongoDbId");
const HttpStatusCode = require("../config/HttpStatusCode");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshtoken");

const createUser = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (findUser) {
      res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: "User already exists",
        data: {},
      });
    }
    const newUser = await User.create(req.body);
    let newProfile = await new Profile({
      userId: newUser._id,
      imageUrl: "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
    }).save();
    newUser.profile = newProfile;
    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: {},
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findUser?._id);
      const updatedUser = await User.findByIdAndUpdate(
        findUser.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      const profile = await Profile.findOne({ userId: findUser.id });
      updatedUser.profile = profile;
      updatedUser.token = refreshToken;
      console.log(updatedUser.token);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.status(HttpStatusCode.OK).json({
        success: true,
        status: 200,
        message: "successfully",
        data: updatedUser,
      });
    } else {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 401,
        message: "username or password incorrect",
        data: {},
      });
    }
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: {},
    });
  }
});

const index = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(HttpStatusCode.OK).json({
    success: true,
    status: 200,
    message: "Successfully",
    data: users,
  });
});

const detail = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    const users = await User.findOne({ _id: id });

    if (users !== null) {
      res.status(HttpStatusCode.OK).json({
        success: true,
        status: 200,
        message: "Successfully",
        data: users,
      });
    }
    res.status(HttpStatusCode.NOT_FOUND).json({
      success: false,
      status: 401,
      message: "user is not found",
      data: [],
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
      data: [],
    });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        utype: req?.body?.utype,
        active: req?.body?.active,
      },
      {
        new: true,
      }
    );
    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
    });
  }
});

function fastFunction(newPassword, findUser) {
  return new Promise((resolve) => {
    setTimeout(async function () {
      findUser.password = newPassword;
      findUser.save();
      resolve()
    }, 100)
  })
}

function slowFunction(findUser, res) {
  return new Promise((resolve) => {
    setTimeout(function () {
      res.status(HttpStatusCode.OK).json({
        success: true,
        status: 200,
        message: "Successfully",
        data: findUser,
      });
      resolve()
    }, 300)
  })
}

const changePassword = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const oldPassword = await req.body.oldPassword;
    const newPassword = await req.body.newPassword;
    const findUser = await User.findOne({ _id: id });

    if (findUser && (await findUser.isPasswordMatched(oldPassword))) {
      return await Promise.all([fastFunction(newPassword, findUser), slowFunction(findUser, res)]);
    } else {
      res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 401,
        message: "password is not matched",
        data: [],
      });
    }

  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      status: 400,
      message: error.message,
    });
  }
});

module.exports = { createUser, loginUser, index, detail, updateUser, changePassword };
