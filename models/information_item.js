var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    common = require('./common'),
    ObjectId = Schema.ObjectId,
    utils = require('./../utils');

var tag_suggestions =  {
    tag_name: String,
    tag_offers: {type:[ObjectId], ref:'User',query:common.FIND_USER_QUERY}
};

var InformationItem = module.exports = utils.revertibleModel(new Schema({
    title: {type: String, required: true},
    tooltip:String,
    subject_id:[{type:ObjectId, ref:'Subject',required:true}],
    category:{type:String, "enum":['test', 'statistics', 'infographic', 'graph'], required:true},
    text_field:{type:Schema.Types.Text, required:true},
    text_field_preview:{type:Schema.Types.Html},
    image_field: {type:Schema.Types.File,required:true},
    image_field_preview: {type:Schema.Types.File},
    tags:{type:[String], index:true},
    users:{type:[ObjectId], ref:'User',query:common.FIND_USER_QUERY,editable:false},
    discussions:[{type:ObjectId,  limit: 1000, ref:'Discussion', index:true}],
    is_visible:{type:Boolean, 'default':true},
    creation_date:{type:Date, 'default':Date.now,editable:false},
    is_hot_object:{type:Boolean, 'default':false},
    is_hot_info_item: {type:Boolean, 'default':false},
    tag_suggestions: {type:[tag_suggestions] ,editable:false},
    like_counter: {type: Number, 'default': 0, editable: false},
    view_counter: {type: Number, 'default': '0'},

    //this two fields are for user suggestion of InformationItem, when admin create this it will remain false
    created_by: {creator_id:{type: ObjectId, ref: 'User',query:common.FIND_USER_QUERY, editable: false}, did_user_created_this_item: {type: Boolean, 'default': false, editable: false}},
    discussion_counter:{type:Number,'default':0},
    status: {type: String, "enum": ['approved', 'denied', 'waiting']},
    gamification: {
        rewarded_creator_for_high_liked: {type: String, 'default': false, editable: false},
        rewarded_creator_for_approval: {type: String, 'default': false, editable: false}
    },
    gui_order:{type:Number,'default':9999999,editable:false},
    is_hidden:{type:Boolean,'default':true},
    _preview:{type:Schema.Types.Mixed,link:'/information_items/{_id}',editable:false}
}, {strict: true}));

InformationItem.methods.toString = function(){
    return this.title || '';
}