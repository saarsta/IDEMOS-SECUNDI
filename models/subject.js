var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    mongoose_types = require('j-forms').types;

var Subject  = module.exports = new Schema({
    name:{type:String,required:true},
    tooltip:String,
    description: {type:mongoose_types.Text},
    text_field_preview:{type:mongoose_types.Text},
    image_field:mongoose_types.File,
        tags:[String],
        gui_order: {type:Number,'default':9999999, editable:false},
    is_hot_object: {type:Boolean,'default':false},
    is_uru:{type:Boolean,'default':false}

}, {strict: true});
