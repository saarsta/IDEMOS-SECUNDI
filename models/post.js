var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    common = require('./common'),
    ObjectId = Schema.ObjectId,
    async = require('async'),
    utils = require('../utils');

var Post = {
    discussion_id:{type:Schema.ObjectId, ref:'Discussion', query:common.FIND_USER_QUERY,index:true, required:true, onDelete:'delete'},
    text:{type:Schema.Types.Html},
    votes_for: {type: Number, 'default': 0},
    votes_against: {type: Number, 'default': 0},
    is_comment_on_vision:{type:Boolean, 'default':false},
    is_editor_choice:{type:Boolean, 'default':false},
    is_expert_opinion:{type:Boolean, 'default':false},
    ref_to_post_id:{type:Schema.ObjectId,ref:'Post',onDelete:'setNull'},
    quoted_by: [new Schema({
        post_id: {type:Schema.ObjectId, ref:'Post'},
        user_name: String
    })]
};

var extension = utils.extend_model('Post', require('./post_or_suggestion').PostOrSuggestion, Post, 'posts',function(schema) {
    schema.methods.toString = function(){
        return this.text || '';
    };
});

module.exports = extension.model;