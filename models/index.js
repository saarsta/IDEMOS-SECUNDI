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

    //this is for share your information cart
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

    Vote:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        post_id:{type:ObjectId, ref:'Post', index:true, required:true, onDelete:'delete'},
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
        proxy_power:{type:Number, min: 1, 'default': 1},
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
        proxy_power:{type:Number, min: 1, 'default': 1},
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

    PostAction:{
        action_id:{type:Schema.ObjectId, ref:'Action', index:true, required:true},
        text:String,
//        is_comment_on_vision:{type:Boolean, 'default':false},
        ref_to_post_id:{type:Schema.ObjectId, ref:'Post', index:true}
    },

    Notification: {
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        notificators: [new Schema(
        {
             notificator_id: {type:ObjectId, ref:'User'},
             sub_entity_id:  {type: ObjectId},
            //only for votes notifications
             ballance: Number
        }
        )],
        type: {type:String, "enum": [
            'approved_info_item_i_created',
            'approved_info_item_i_liked',
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
            "a_dicussion_created_with_info_item_that_you_created",
            "user_gave_my_post_tokens",
            "user_gave_my_suggestion_tokens"
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

    },

    ThresholdCalcVariables: {
        MIN_THRESH: {type: Number, 'default': 2},
        MAX_THRESH: {type: Number, 'default': 500},
        MAX_RED_RATIO: {type: Number, 'default': 2},
        SCALE_PARAM:  {type: Number, 'default': 1.6}
    },

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

    Subject:mongoose.model('Subject', require('./subject')),
    Post:require('./post'),
    PostAction:utils.extend_model('PostAction', Schemas.PostOrSuggestion, Schemas.PostAction).model,
    Suggestion:require('./suggestion'),
    PostOrSuggestion:mongoose.model('PostOrSuggestion', new Schema(require('./post_or_suggestion'), {strict: true}), 'posts'),
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
    FBRequest: mongoose.model('FBRequest',require('./fb_request')),
    ResourceObligation: mongoose.model('ResourceObligation', new Schema(Schemas.ResourceObligation, {strict: true})),
    Notification: mongoose.model('Notification', new Schema(Schemas.Notification, {strict: true})),
    GamificationTokens: utils.config_model('GamificationTokens', Schemas.GamificationTokens),
    ThresholdCalcVariables: utils.config_model('ThresholdCalcVariables', Schemas.ThresholdCalcVariables),

    ImageUpload: mongoose.model('ImageUpload', require('./image_upload')),

    Schemas:Schemas
};


