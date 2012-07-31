var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    mongoose_types = require('j-forms').types,
    utils = require('../utils');

var VoteActionPost = module.exports = new Schema({
    user_id:{type:ObjectId, ref:'User', index:true, required:true},
    post_action_id:{type:ObjectId, ref:'PostAction', index:true, required:true, onDelete:'delete'},
    balance:{type:Number,'default':0},
    creation_date:{type:Date, 'default':Date.now}
});
