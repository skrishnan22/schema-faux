const mongoose = require('mongoose');

module.exports.isMongooseSchema = function isMongooseSchema(schema) {
  return schema instanceof mongoose.Schema;
};
