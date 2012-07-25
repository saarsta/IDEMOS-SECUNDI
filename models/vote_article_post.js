var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    mongoose_types = require('j-forms').types,
    utils = require('../utils');

var VoteArticlePost = module.exports = new Schema({
    user_id:{type:ObjectId, ref:'User', index:true, required:true},
    post_article_id:{type:ObjectId, ref:'PostArticle', index:true, required:true, onDelete:'delete'},
    balance:{type:Number,'default':0},
    creation_date:{type:Date, 'default':Date.now}
});

