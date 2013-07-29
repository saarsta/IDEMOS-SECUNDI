var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    _ = require('underscore'),
    utils = require('../utils');

var Suggestion = {
    discussion_id:{type:Schema.ObjectId, ref:'Discussion', index:true, required:true, onDelete:'delete'},
    parts:[
        {start:Number, end:Number, text:Schema.Types.Text}
    ],
    explanation:{type:Schema.Types.Text},

    is_approved:{type:Boolean, 'default':false},
    approve_date:{type:Date},
    context_before:String,
    replaced_text:String,
    context_after:String,
    history_version_id:{type:Schema.ObjectId, ref:'DiscussionHistory'},

    evaluate_counter:{type:Number, 'default':0},
    grade:{type:Number, 'default':0},
    agrees:{type:Number, 'default':0},
    not_agrees:{type:Number, 'default':0},
    threshold_for_accepting_the_suggestion:{type:Number, max:500, 'default':0, editable:false},
    admin_threshold_for_accepting_the_suggestion:{type:Number, max:500, 'default':0},
    under_moderation:{type:Boolean, 'default':false}
};

var extension = utils.extend_model('Suggestion', require('./post_or_suggestion').PostOrSuggestion, Suggestion, 'posts',
    function (schema) {

        schema.methods.getCharCount = function () {
            var sug_char_count = _.reduce(this.parts, function (sum, part) {
                if (part.text == null)
                    part.text = "";
                return sum + part.text.trim().length;
            }, 0);
            var disc_marked_text_char_count = _.reduce(this.parts, function (sum, part) {
                return sum + (part.end - part.start);
            }, 0);

            return Math.max(sug_char_count, disc_marked_text_char_count);
        };
        schema.methods.toString = function () {
            return ((this.parts && this.parts[0] && this.parts[0].text) || '').slice(0, 100);
        }
    });


module.exports = extension.model;