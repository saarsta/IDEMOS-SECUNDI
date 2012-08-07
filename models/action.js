
var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    mongoose_types = require('j-forms').types,
    utils = require('./../utils');

var Action = module.exports = new Schema({
    title:{type:String, required:true},
    tooltip:String,
    text_field:{type:mongoose_types.Html},
    text_field_preview:{type:mongoose_types.Html},
    image_field: mongoose_types.File,
    image_field_preview: mongoose_types.File,
    type: {type:String, "enum":[
        'הצעה לפעולת שטח', 'בלה בלה'
    ]}, //only admin can change this
    description:String,
    creator_id:{type:ObjectId, ref:'User', index:true, required:true},
    first_name: {type: String, editable:false},
    last_name: {type: String, editable:false},
    cycle_id:{type:ObjectId, ref:'Cycle', index:true, required:true},
    action_resources:[
        {resource: require('./action_resource'), amount:Number, left_to_bring: Number}
    ],
    tags:[String],
    //users that conected somehow to the action for my uru
    users:[
        new Schema({user_id:{type:ObjectId, ref:'User'}, join_date: {type:Date, 'default':Date.now}})
    ],
    execution_date:{type:Date, 'default':Date.now},//change default
    creation_date:{type:Date, 'default':Date.now},
    required_participants:{type:Number, 'default':0},
    //users that are going to be in the action
    going_users: [
        new Schema({user_id: {type:ObjectId, ref:'User'}, join_date: {type: Date, 'default': Date.now}})
    ],
    num_of_going: {type: Number, 'default': 0, editable:false},
    tokens:{type:Number, 'default':0},
    is_approved:{type:Boolean, 'default':false},
    is_hot_object: {type:Boolean,'default':false},
    gamification: {approved_to_cycle :{type: Boolean, 'default': false}, editable:false},
    location:mongoose_types.GeoPoint,
    grade:{type:Number, 'default':0},
    evaluate_counter:{type:Number, 'default':0, editable:false},
    grade_sum:{type:Number, 'default':0, editable:false},
    is_hidden:{type:Boolean,'default':true}
}, {strict: true});