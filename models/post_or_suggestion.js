var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    common = require('./common'),

    utils = require('../utils');

exports.PostOrSuggestion = {
    creator_id:{type:Schema.ObjectId, ref:'User', query:common.FIND_USER_QUERY},
    first_name:{type:String,editable:false},
    last_name:{type:String, editable:false },
    total_votes: {type: Number, 'default': 0},
    creation_date:{type:Date, 'default':Date.now},
    //for now there is no such thing as "tokens",
    //this is for later when a user vote could be more than one vote
    tokens:{type:Number, 'default':0, index: true},
    popularity: {type:Number, 'default':0},
    gamification: {high_number_of_tokens_bonus : {type: Boolean, 'default': false}},
    is_hidden:{type:Boolean,'default':true}
};

exports.Schema = new Schema(exports.PostOrSuggestion,{strict:true});
exports.Schema.methods.toString = function(){
    return this.first_name + ' ' + this.last_name;
}