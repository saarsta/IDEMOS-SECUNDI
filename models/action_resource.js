var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var ActionResource = module.exports =  {
    category: {type: ObjectId, ref: 'Category', required: true},
    name: {type: String, required: true},
    is_approved: {type: Boolean, 'default': true}
//    is_hidden:{type:Boolean,'default':true}
};
