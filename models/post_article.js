var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    mongoose_types = require('j-forms').types,
    utils = require('../utils');

var PostArticle = {
    article_id: {type:Schema.ObjectId, ref:'Article', required:true, onDelete:'delete'},
    creator_id:{type:Schema.ObjectId, ref:'User'},
    first_name:{type:String,editable:false},
    last_name:{type:String, editable:false },
    total_votes: {type: Number, 'default': 0},
    creation_date:{type:Date, 'default':Date.now,editable:false},
    popularity: {type:Number, 'default':0},
    text:String,
    votes_for: {type: Number, 'default': 0},
    votes_against: {type: Number, 'default': 0},
    ref_to_post_id:{type:Schema.ObjectId,ref:'PostArticle',onDelete:'setNull'},
    is_hidden:{type:Boolean,'default':true}
};

var extension = utils.extend_model('PostArticle', PostArticle, function(schema) {
    schema.methods.toString = function(){
        return this.text;
    };
});

module.exports = extension.model;