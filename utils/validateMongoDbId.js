const mongoose = require("mongoose");

module.exports = function validateMongoDbId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid MongoDB id");
  }
};