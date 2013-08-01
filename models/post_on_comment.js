var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    common = require('./common'),
    ObjectId = Schema.ObjectId,
    async = require('async'),

    utils = require('../utils');

var PostOnComment = {
    discussion_id:{type:Schema.ObjectId, ref:'Discussion', query:common.FIND_DISCUSSION_QUERY, required:true, onDelete:'delete'},
    post_id:{type:Schema.ObjectId, ref:'Post', index:true, required:true, onDelete:'delete'},
    text:{type:Schema.Types.Html}
};

var extension = utils.extend_model('PostOnComment', require('./post_or_suggestion').PostOrSuggestion, PostOnComment, 'posts',function(schema) {
    schema.methods.toString = function(){
        return this.text || '';
    };
});

module.exports = extension.model;