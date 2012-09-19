var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    common = require('./common'),
    mongoose_types = require('j-forms').types,
    utils = require('../utils');

var PostArticle = module.exports = new Schema({
    article_id: {type:Schema.ObjectId, ref:'Article', required:true, onDelete:'delete'},
    creator_id:{type:ObjectId, ref:'User', query:common.FIND_USER_QUERY},
    first_name:{type:String,editable:false},
    last_name:{type:String, editable:false },
    total_votes: {type: Number, 'default': 0},
    creation_date:{type:Date, 'default':Date.now,editable:false},
    popularity: {type:Number, 'default':0},
    text:String,
    votes_for: {type: Number, 'default': 0},
    votes_against: {type: Number, 'default': 0},
    ref_to_post_id:{type:Schema.ObjectId,ref:'PostArticle',onDelete:'setNull'},
    is_hidden:{type:Boolean,'default':true}
});
