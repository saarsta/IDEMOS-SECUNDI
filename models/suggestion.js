
var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    _ = require('underscore'),
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
    agrees: {type: Number, 'default': 0, editable:false},
    not_agrees: {type: Number, 'default': 0, editable:false},
    threshold_for_accepting_the_suggestion: {type: Number, max: 500, 'default': 0},
    admin_threshold_for_accepting_the_suggestion: {type: Number, max: 500, 'default': 0}
};

var extension = utils.extend_model('Suggestion', require('./post_or_suggestion'), Suggestion, 'posts',function(schema) {
    //returns max char of discussion marked text and suggestion text
    schema.methods.getCharCount = function() {
        var sug_char_count = _.reduce(this.parts,function(sum,part) {
            return sum + part.text.trim().length;
        },0);
        var disc_marked_text_char_count = _.reduce(this.parts,function(sum,part) {
            return sum + (part.end - part.start);
        },0);

        return Math.max(sug_char_count, disc_marked_text_char_count);
    };
});


module.exports = extension.model;