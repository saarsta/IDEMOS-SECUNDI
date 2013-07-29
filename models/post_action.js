

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    _ = require('underscore'),

    utils = require('../utils');



var PostAction = {
    action_id:{type:Schema.ObjectId, ref:'Action', index:true, required:true},
    text:String,
    votes_for: {type: Number, 'default': 0},
    votes_against: {type: Number, 'default': 0},
    ref_to_post_id:{type:Schema.ObjectId, ref:'Post', index:true}
}

var extension = utils.extend_model('PostAction', require('./post_or_suggestion').PostOrSuggestion, PostAction, null, function(schema) {
    schema.methods.toString = function(){
        return this.text;
    };
});

module.exports = extension.model;