var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async');

var Subject  = module.exports = new Schema({
    name:{type:String,required:true},
    tooltip:String,
    description: {type:Schema.Types.Text},
    text_field_preview:{type:Schema.Types.Text},
    image_field:Schema.Types.File,
        tags:[String],
        gui_order: {type:Number,'default':9999999, editable:false},
    is_hot_object: {type:Boolean,'default':false},
    is_uru:{type:Boolean,'default':false}

}, {strict: true});

Subject.methods.toString = function(){
    return this.name;
};
