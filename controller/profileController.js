const Profile = require("../models/profile");
const HttpStatusCode = require("../config/HttpStatusCode");
const asyncHandler = require("express-async-handler");

 const getProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    const profile = await Profile.findOne({ userId: userId });

    if (profile) {
      return res.status(HttpStatusCode.OK).json({
        success: true,
        status: 200,
        message: "Successfully",
        data: profile,
      });
    }

    return res.status(HttpStatusCode.NOT_FOUND).json({
      success: false,
      status: 404,
      message: "Profile is not found.",
      data: null,
    });

  } catch (error) {
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 500,
      message: error.message,
      data: null,
    });
  }
});
const updateProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: userId },
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        phone: req?.body?.phone,
        address: req?.body?.address,
        imageUrl: req?.body?.imageUrl,
      },
      {
        new: true,
      }
    );
    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Successfully",
      data: updatedProfile,
    });
  } catch (error) {
    res.status(HttpStatusCode.badRequest).json({
      success: false,
      status: 400,
      message: error.message,
    });
  }
});

module.exports = { getProfile, updateProfile };