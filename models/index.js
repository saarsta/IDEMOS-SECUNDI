/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 07/02/12
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    mongoose_types = require('j-forms').types,
    utils = require('./../utils'),
    _ = require('underscore'),
    async = require('async');

mongoose_types.loadTypes(mongoose);






var Schemas = exports.Schemas = {

    //this is for
    information_group: {
        information_items:[{type:ObjectId, ref:'Information_item'}]
    },

    Headline:new Schema({
        title: {type: String, required: true},
        tooltip:String,
        type: {type: String, "enum": ["from_the_news_paper", "daily_survey", "conclusion"]},
        text_field:{type:mongoose_types.Html},
        image_field: mongoose_types.File,
        tags:{type:[String], index:true},
        cycles:{type:[ObjectId], ref:'Cycles', index:true, editable:false},
        actions: {type: [ObjectId], ref:'Action', index:true, editable:false},
        is_visible:{type:Boolean, 'default':true},
        creation_date:{type:Date, 'default':Date.now,editable:false},
        gui_order:{type:Number,'default':9999999,editable:false}
    }, {strict: true}),

    SuccessStory: new Schema({
        title: {type: String, required: true},
        tooltip:String,
        text_field:{type:mongoose_types.Html},
//        text_field_preview:{type:mongoose_types.Html},
        image_field: mongoose_types.File,
//        image_field_preview: mongoose_types.File,
        tags:{type:[String], index:true},
        cycles:{type:[ObjectId], ref:'Cycles', index:true, editable:false},
        actions: {type: [ObjectId], ref:'Action', index:true, editable:false},
        is_visible:{type:Boolean, 'default':true},
        creation_date:{type:Date, 'default':Date.now,editable:false},
        gui_order:{type:Number,'default':9999999,editable:false}
    }, {strict: true}),

    //cycle updates
    Update:new Schema({
        title: {type: String, required: true},
        tooltip:String,
        text_field:{type:mongoose_types.Text},
//        text_field_preview:{type:mongoose_types.Html},
        image_field: mongoose_types.File,
//        image_field_preview: mongoose_types.File,
        tags:{type:[String], index:true},
        cycles:{type:[ObjectId], ref:'Cycle', index:true},
//        actions: {type: [ObjectId], ref:'Action', index:true},
        is_visible:{type:Boolean, 'default':true},
        creation_date:{type:Date, 'default':Date.now,editable:false},
        gui_order:{type:Number,'default':9999999,editable:false}
    }, {strict: true}),

    Kilkul:{
        user:{type:ObjectId, ref:'User'},
        user_name: {type: String, editable:false},
        title: {type: String},
        tooltip:String,
        text_field:{type:mongoose_types.Text},
        text_field_preview:{type:mongoose_types.Html},
        image_field: mongoose_types.File,
        tags:{type:[String], index:true},
        is_visible:{type: Boolean, 'default':true},
        me_too_counter: {type:Number, 'default':0},
        creation_date:{type:Date, 'default':Date.now,editable:false},
        gui_order:{type:Number,'default':9999999,editable:false}
    },

    Subject:{
        name:{type:String,required:true},
        tooltip:String,
        description: {type:mongoose_types.Text,required:true},
        text_field_preview:{type:mongoose_types.Text},
        image_field:mongoose_types.File,
        tags:[String],
        gui_order: {type:Number,'default':9999999, editable:false},
        is_hot_object: {type:Boolean,'default':false}
    },


    PostOrSuggestion:{
        creator_id:{type:Schema.ObjectId, ref:'User'},
        first_name:{type:String,editable:false},
        last_name:{type:String, editable:false },
//        username:{type:String,editable:false},
//        avatar : {type:mongoose_types.File, editable:false},
        total_votes: {type: Number, 'default': 0},
        creation_date:{type:Date, 'default':Date.now,editable:false},
        //for now there is no such thing as "tokens",
        //this is for later when a user vote could be more than one vote
        tokens:{type:Number, 'default':0, index: true},
        popularity: {type:Number, 'default':0},
        gamification: {high_number_of_tokens_bonus : {type: Boolean, 'default': false}}
    },

    Vote:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        post_id:{type:ObjectId, ref:'Post', index:true, required:true},
//        tokens:Number,
        ballance:{type:Number,'default':0},
//        method:{type:String, "enum":['add', 'remove']},
        creation_date:{type:Date, 'default':Date.now}
    },

    VoteSuggestion:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        suggestion_id:{type:ObjectId, ref:'Suggestion', index:true, required:true},
//        tokens:Number,
        method:{type:String, "enum":['add', 'remove']},
        creation_date:{type:Date, 'default':Date.now}
    },

    Grade:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        discussion_id:{type:ObjectId, ref:'Discussion', index:true, required:true},
        evaluation_grade:{type:Number, min:0, max:10},
        creation_date:{type:Date, 'default':Date.now}
    },

    GradeAction:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        action_id:{type:ObjectId, ref:'Action', index:true, required:true},
        evaluation_grade:{type:Number, min:0, max:10},
        creation_date:{type:Date, 'default':Date.now}
    },

    GradeSuggestion:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        suggestion_id:{type:ObjectId, ref:'Suggestion', index:true, required:true},
        evaluation_grade:{type:Number, min:0, max:10},
        creation_date:{type:Date, 'default':Date.now},
        //this field sets only when suggestion creates,
        //suprot == user's suggestoin grade is e or gtr then user's discussion grade
        does_support_the_suggestion: {type:Boolean}
    },

    Like:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        info_item_id:{type:ObjectId, ref:'Post', index:true, required:true},
        creation_date:{type:Date, 'default':Date.now}
    },

    Join:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        action_creator_id:{type:ObjectId, ref:'User', index:true, required:true},
        action_id:{type:ObjectId, ref:'Action', index:true, required:true},
        creation_date:{type:Date, 'default':Date.now}
    },

    Category: {
        name: {type:String}
    },

    ActionSuggestion: {
        creator_id: {type:Schema.ObjectId, ref:'User', index:true, required:true},
        cycle_id: {type: ObjectId, ref: 'Cycle'},
        first_name: String,
        last_name: String,
        creation_date:{type:Date, 'default':Date.now},
        action_ref: {type: ObjectId, ref:'Action', required: true},
        change: {},
        is_approved: {type: Boolean, 'default': false}
    },

    ResourceObligation: {
        user_id: {type:Schema.ObjectId, ref:'User', index:true, required:true},
        first_name: String,
        last_name: String,
        action_id: {type:ObjectId, ref:'Action', index:true, required:true},
        action_resources:[
            {resource: require('./action_resource'), amount:Number}
        ]
    },


    Post:{
        discussion_id:{type:Schema.ObjectId, ref:'Discussion', index:true, required:true},
        text:String,
        //is_change_suggestion: {type:Boolean,'default':false},
        votes_for: {type: Number, 'default': 0},
        votes_against: {type: Number, 'default': 0},
        is_comment_on_vision:{type:Boolean, 'default':false},
//        is_comment_on_action:{type:Boolean, 'default':false},
        ref_to_post_id:{type:Schema.ObjectId}
    },

    PostAction:{
        action_id:{type:Schema.ObjectId, ref:'Action', index:true, required:true},
        text:String,
//        is_comment_on_vision:{type:Boolean, 'default':false},
        ref_to_post_id:{type:Schema.ObjectId, ref:'Post', index:true}
    },

    Suggestion:{
        discussion_id:{type:Schema.ObjectId, ref:'Discussion', index:true, required:true},
        //is_change_suggestion: {type:Boolean,'default':true},
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
    },

    Notification: {
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        notificators: [{
             notificator_id: {type:ObjectId, ref:'User'},
             sub_entity_id:  {type: ObjectId}
        }],
        type: {type:String, "enum": [
            'approved_info_item',
            'approved_discussion_i_created',
            'approved_discussion_i_took_part',
            'comment_on_discussion_you_are_part_of',
            "comment_on_discussion_you_created",
            "change_suggestion_on_discussion_you_are_part_of",
            "change_suggestion_on_discussion_you_created",
            "approved_change_suggestion_you_created",
            "approved_change_suggestion_you_graded",
            'been_quoted',
            "a_dicussion_created_with_info_item_that_you_like",
            "a_dicussion_created_with_info_item_that_you_created"
        ]},

        entity_id: {type: ObjectId},

        seen: {type:Boolean, 'default':false},
        update_date: {type: Date, 'default': Date.now}
    },

    Tag : {
        tag:{type:String, unique:true},
        popularity:{type:Number,'default':0,select:false}
    },

    GamificationTokens: {
        create_discussion: {type: Number, 'default': 0},
        create_action: {type: Number, 'default': 0},
        post_on_discussion: {type: Number, 'default': 0},
        post_on_action: {type: Number, 'default': 0},
        suggestion_on_discussion: {type: Number, 'default': 0},
        suggestion_on_action: {type: Number, 'default': 0},
        grade_discussion: {type: Number, 'default': 0},
        grade_suggestion: {type: Number, 'default': 0},
        grade_action: {type: Number, 'default': 0},
        vote_on_post: {type: Number, 'default': 0},
        like_info_item: {type: Number, 'default': 0},
        join_to_action: {type: Number, 'default': 0},
        ceate_kilkul: {type: Number, 'default': 0},
        join_kilkul: {type: Number, 'default': 0},
        min_tokens_to_create_dicussion: {type: Number, 'default': 0},
        min_tokens_to_create_action: {type: Number, 'default': 0},
        min_tokens_to_create_blog: {type: Number, 'default': 0},
        invite_X_people_who_got_Y_extra_tokens: {x: {type: Number, 'default': 1000}, y: {type: Number, 'default': 1000}},
        invite_X_people_who_signed_in: {type: Number, 'default': 1000000},
        X_tokens_for_post: {type: Number, 'default': 1000000},
        X_tokens_for_all_my_posts: {type: Number, 'default': 1000000},
        X_suggestions_for_a_discussion: {type: Number, 'default': 1000000},
        discussion_high_graded_by_min_of_X_people: {type: Number, 'default': 1000000},
        spend_tokens_for_X_days_in_a_row: {type: Number, 'default': 1000000},
        X_tokens_for_all_my_posts: {type: Number, 'default': 1000000}
    }
};


var schemas_with_tooltip = [require('./discussion'),require('./articles'),require('./cycle'),require('./information_item'),require('./action'),Schemas.Headline,Schemas.Update];

_.each(schemas_with_tooltip,function(schema,index){
    schema.methods.tooltip_or_title = function(){
        return this.tooltip || this.title;
    };
});


var Models = module.exports = {
    User:mongoose.model("User",require('./user')),
    InformationItem:mongoose.model('InformationItem', require('./information_item')),
    Discussion:mongoose.model('Discussion', require('./discussion')),
    Cycle:mongoose.model('Cycle', require('./cycle')),
    Action:mongoose.model('Action', require('./action')),
    Article:mongoose.model('Article', require('./articles')),

    Headline:mongoose.model('Headline', Schemas.Headline),

    SuccessStory:mongoose.model('SuccessStory', Schemas.SuccessStory),
    Update: mongoose.model('Update', Schemas.Update),
    Kilkul:mongoose.model('Kilkul', new Schema(Schemas.Kilkul, {strict: true})),

    Subject:mongoose.model('Subject', new Schema(Schemas.Subject, {strict: true})),
    Post:utils.extend_model('Post', Schemas.PostOrSuggestion, Schemas.Post, 'posts'),
    PostAction:utils.extend_model('PostAction', Schemas.PostOrSuggestion, Schemas.PostAction),
    Suggestion:utils.extend_model('Suggestion', Schemas.PostOrSuggestion, Schemas.Suggestion, 'posts'),
    PostOrSuggestion:mongoose.model('PostOrSuggestion', new Schema(Schemas.PostOrSuggestion, {strict: true}), 'posts'),
    Vote:mongoose.model('Vote', new Schema(Schemas.Vote, {strict: true})),
    VoteSuggestion:mongoose.model('VoteSuggestion', new Schema(Schemas.VoteSuggestion, {strict: true})),
    Like:mongoose.model('Like', new Schema(Schemas.Like, {strict: true})),
    Grade:mongoose.model('Grade', new Schema(Schemas.Grade, {strict: true})),
    GradeAction:mongoose.model('GradeAction', new Schema(Schemas.GradeAction, {strict: true})),
    GradeSuggestion:mongoose.model('GradeSuggestion', new Schema(Schemas.GradeSuggestion, {strict: true})),
    Join:mongoose.model('Join', new Schema(Schemas.Join, {strict: true})),
    Category:mongoose.model('Category', new Schema(Schemas.Category, {strict: true})),
    ActionResource:mongoose.model('ActionResource', new Schema(require('./action_resource'), {strict: true})),
    Tag: mongoose.model('Tag', new Schema(Schemas.Tag, {strict: true})),
    ResourceObligation: mongoose.model('ResourceObligation', new Schema(Schemas.ResourceObligation, {strict: true})),
    Notification: mongoose.model('Notification', new Schema(Schemas.Notification, {strict: true})),
    GamificationTokens: utils.config_model('GamificationTokens', Schemas.GamificationTokens),

    Schemas:Schemas
};


