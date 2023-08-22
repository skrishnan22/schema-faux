
const mongoose = require('mongoose');

module.exports.isMongooseSchema = function(schema){
    return schema instanceof mongoose.Schema
}