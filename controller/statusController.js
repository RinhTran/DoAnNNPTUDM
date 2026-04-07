const Status = require("../models/status");
const asyncHandler = require("express-async-handler");
const HttpStatusCode = require("../config/HttpStatusCode");
const validateMongoDbId = require("../utils/validateMongodbId");

const createStatus = asyncHandler(async (req, res) => {
    try {
        const statusName = req.body.statusName;
        const findStatus = await Status.findOne({ statusName: statusName });
        if (findStatus) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: "status name is already", data: null });
        } else {
            const newStatus = await Status.create(req.body);
            res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: newStatus });
        }
    } catch (error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
    }
});

const getAllStatus = asyncHandler(async (req, res) => {
    try {
        const status = await Status.find();
        res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: status });
    } catch (error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
    }
});

const getStatusDetails = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        await Status.findOne({ _id: id }).then(status => {
            if (status) {
                res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: status });
            } else {
                res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 401, message: "status is not found", data: null });
            }
        }).catch((err) => {
            console.error(err);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, status: 500, message: "An error occurred while searching status details.", data: null });
        });
    } catch (error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
    }
});

const updateStatus = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);
        const updatedStatus = await Status.findOneAndUpdate(
            { _id: id },
            {
                statusName: req?.body?.statusName ?? updatedStatus.statusName,
            },
            {
                new: true,
            }
        );
        res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: updatedStatus });
    } catch (error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
    }
});

const deleteStatus = asyncHandler(async (req, res) => {
    try {
      const statusId = req.params.id;
      await Status.findOneAndDelete({ _id: statusId })
        .then((details) => {
          if (details) {
            res.status(HttpStatusCode.OK).json({ success: true, status: 200, message: "Successfully", data: null });
          }
          else{
            res.status(HttpStatusCode.NOT_FOUND).json({ success: false, status: 404, message: "Status is not found", data: null });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, status: 500, message: "An error occurred while deleting the status.", data: null });
        });
    } catch (error) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ success: false, status: 400, message: error.message, data: null });
    }
  });

module.exports = {
    createStatus,
    getAllStatus,
    getStatusDetails,
    updateStatus,
    deleteStatus
};
