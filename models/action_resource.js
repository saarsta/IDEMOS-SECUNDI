var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ActionResource = module.exports =  {
    category: {type: ObjectId, ref: 'Category'},
    name:String
};
