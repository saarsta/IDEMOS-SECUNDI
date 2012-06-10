
var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    mongoose_types = require('j-forms').types,
    utils = require('../utils');


var Suggestion = {
    parts:[
        {start:Number, end:Number, text:String}
    ],
        explanation: {type:mongoose_types.Text},
    is_approved:{type:Boolean, 'default':false},
    evaluate_counter: {type: Number, 'default': 0},
    grade: {type: Number, 'default': 0},
    agrees: {type: Number, 'default': 0},
    not_agrees: {type: Number, 'default': 0},
    admin_threshold_for_accepting_the_suggestion: {type: Number, max: 500, 'default': 0}
};

var extension = utils.extend_model('Suggestion', require('./post_or_suggestion'), Suggestion, 'posts');

extension.schema;

module.exports = extension.model;