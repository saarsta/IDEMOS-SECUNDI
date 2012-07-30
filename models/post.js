var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    mongoose_types = require('j-forms').types,
    utils = require('../utils');

var Post = {
    text:{type:mongoose_types.Html},
    votes_for: {type: Number, 'default': 0},
    votes_against: {type: Number, 'default': 0},
    is_comment_on_vision:{type:Boolean, 'default':false},
    ref_to_post_id:{type:Schema.ObjectId,ref:'Post',onDelete:'setNull'}
};

var extension = utils.extend_model('Post', require('./post_or_suggestion'), Post, 'posts',function(schema) {
    schema.methods.toString = function(){
        return this.text;
    };
});

module.exports = extension.model;