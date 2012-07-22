var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    mongoose_types = require('j-forms').types,
    utils = require('../utils');

var PostArticle = {
    text:String,
    votes_for: {type: Number, 'default': 0},
    votes_against: {type: Number, 'default': 0},
    ref_to_post_id:{type:Schema.ObjectId,ref:'PostArticle',onDelete:'setNull'}
};



var extension = utils.extend_model('PostArticle', require('./post_or_suggestion'), PostArticle, 'article_posts',function(schema) {
    schema.methods.toString = function(){
        return this.text;
    };
});

module.exports = extension.model;