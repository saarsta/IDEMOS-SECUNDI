
var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    mongoose_types = require('j-forms').types,
    utils = require('./../utils');


var Discussion = module.exports = new Schema({
    title:{type:String, required:true},
    tooltip:String,
//        text_field:{type:mongoose_types.Html},
//        text_field_preview:{type:mongoose_types.Html},
    image_field: { type:mongoose_types.File, required:true},
    image_field_preview: { type:mongoose_types.File, require:true},
    subject_id:[
        {type:ObjectId, ref:'Subject', index:true, required:true}
    ],
    subject_name: String,
    system_message: {type:mongoose_types.Html, "default": "דיון זה מתעתד להיות מעגל תנופה. שתפו, הגיבו וגרמו לזה לקרות"},
    creation_date:{type:Date, 'default':Date.now},
    creator_id:{type:ObjectId, ref:'User'},
    first_name:{type:String,editable:false},
    last_name:{type:String,editable:false},
    vision_text_preview: {type:mongoose_types.Text},//2-3 lines of the vision_text
    vision_text:{type:mongoose_types.Text, required:true},
    vision_text_history:{type:[String],editable:false},
    num_of_approved_change_suggestions: {type: Number, 'default': 0},
    is_hot_object: {type:Boolean,'default':false},
    is_cycle:{
        flag:{type:Boolean, 'default':false, editable:false},
        date:{type:Date, 'default':Date.now, editable:false}
    },
    tags:[String],
    //users that connected somehow to discussion for my uru
    users:[
        new Schema({user_id:{type:ObjectId, ref:'User'}, join_date: {type:Date, 'default':Date.now}})
    ],

    //followers for my uru
    followers:[
        new Schema({user_id:{type:ObjectId, ref:'User'}, join_date: {type:Date, 'default':Date.now}})
    ],
    followers_count:{type:Number, 'default':0, editable:false},
    is_visible:{type:Boolean, 'default':true},
    is_published:{type:Boolean, 'default':false},
    threshold_for_accepting_change_suggestions: {type: Number, min: 2, max: 501, 'default': 2},
    admin_threshold_for_accepting_change_suggestions: {type: Number, max: 500, 'default': 0},
//        popular_comments: [{type: ObjectId, ref: 'Post', index: true}],
    grade:{type:Number, 'default':0},
    evaluate_counter:{type:Number, 'default':0, editable:false},
    grade_sum:{type:Number, 'default':0, editable:false},
    gamification: {has_rewarded_creator_of_turning_to_cycle: {type: Boolean, 'default': false},
        has_rewarded_creator_for_high_grading_of_min_graders: {type: String, 'default': false}, editable:false}
}, {strict: true});