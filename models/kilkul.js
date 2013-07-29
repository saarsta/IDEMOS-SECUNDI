
var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,ObjectId = Schema.ObjectId
    ,common = require('./common');

var Kilkul = module.exports = new Schema({
    user:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY},
    user_name:{type:String, editable:false},
    title:{type:String},
    tooltip:String,
        text_field:{type:Schema.Types.Text},
    text_field_preview:{type:Schema.Types.Html},
    image_field:Schema.Types.File,
        tags:{type:[String], index:true},
    is_visible:{type:Boolean, 'default':true},
    me_too_counter:{type:Number, 'default':0},
    creation_date:{type:Date, 'default':Date.now, editable:false},
    gui_order:{type:Number, 'default':9999999, editable:false},
    is_hidden:{type:Boolean, 'default':true}
}, {strict:true});

Kilkul.methods.toString = function(){
    return this.title;
}