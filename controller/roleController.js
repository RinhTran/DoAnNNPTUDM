const Role = require("../models/role");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongoDbId");

const createRole = asyncHandler(async (req, res) => {
  try {
    const name = req.body.name;
    const findRole = await Role.findOne({ name: name });
    if (findRole) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: "role name is already in use", data: null });
    }
    const newRole = await Role.create(req.body);
    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: newRole });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find();
  res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: roles });
});

const getRoleDetails = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const role = await Role.findOne({ _id: id });
    if (role) {
      return res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: role });
    }
    res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 404, message: "role is not found", data: null });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const updateRole = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);
    const role = await Role.findOne({ _id: id });
    if (!role) {
      return res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 404, message: "role is not found", data: null });
    }
    const updatedRole = await Role.findByIdAndUpdate(id, {
      name: req?.body?.name ?? role.name,
      description: req?.body?.description ?? role.description,
      active: req?.body?.active ?? role.active,
      dateUpdate: Date.now(),
    }, { new: true });
    res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: updatedRole });
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
  }
});

const deleteRole = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;
    validateMongoDbId(id);

    const role = await Role.findById(id);
    if (!role) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        status: 404,
        message: "role is not found",
        data: null,
      });
    }

    await Role.findByIdAndDelete(id);

    res.status(HttpStatusCode.OK).json({
      success: true,
      status: 200,
      message: "Delete role successfully",
      data: role,
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

module.exports = { createRole, getAllRoles, getRoleDetails, updateRole, deleteRole };
