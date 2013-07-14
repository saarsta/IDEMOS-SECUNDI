var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    common = require('./common'),
    ObjectId = Schema.ObjectId,
    async = require('async'),

    utils = require('../utils');

var PostSuggestion = {
    discussion_id:{type:Schema.ObjectId, ref:'Discussion', query:common.FIND_USER_QUERY, required:true, onDelete:'delete'},
    suggestion_id:{type:Schema.ObjectId, ref:'Suggestion', query:common.FIND_USER_QUERY,index:true, required:true, onDelete:'delete'},
    text:{type:Schema.Types.Html}
};

var extension = utils.extend_model('PostSuggestion', require('./post_or_suggestion').PostOrSuggestion, PostSuggestion, 'posts',function(schema) {
    schema.methods.toString = function(){
        return this.text || '';
    };
});

module.exports = extension.model;