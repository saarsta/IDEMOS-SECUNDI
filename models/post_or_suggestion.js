var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    mongoose_types = require('j-forms').types,
    utils = require('../utils');


var PostOrSuggestion = module.exports = {
    creator_id:{type:Schema.ObjectId, ref:'User'},
    first_name:{type:String,editable:false},
    last_name:{type:String, editable:false },
//        username:{type:String,editable:false},
//        avatar : {type:mongoose_types.File, editable:false},
    total_votes: {type: Number, 'default': 0},
    creation_date:{type:Date, 'default':Date.now},
    //for now there is no such thing as "tokens",
    //this is for later when a user vote could be more than one vote
    tokens:{type:Number, 'default':0, index: true},
    popularity: {type:Number, 'default':0},
    gamification: {high_number_of_tokens_bonus : {type: Boolean, 'default': false}},
    is_hidden:{type:Boolean,'default':true}
};
