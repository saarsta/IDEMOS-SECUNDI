var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    common = require('./common'),
    utils = require('../utils'),
    _ = require('underscore'),
    async = require('async');


var Schemas = exports.Schemas = {

    //this is for share your information cart
    information_group:{
        information_items:[
            {type:ObjectId, ref:'Information_item'}
        ]
    },

    Headline:utils.revertibleModel(new Schema({
        title:{type:String, required:true},
        tooltip: String,
        type: {type:String, "enum":["from_the_news_paper", "daily_survey", "conclusion"]},
        text_field: {type:Schema.Types.Html},
        image_field: Schema.Types.File,
        link:String,
        tags:{type:[String], index:true},
        cycles:{type:[ObjectId], ref:'Cycles', index:true, editable:false},
        actions:{type:[ObjectId], ref:'Action', index:true, editable:false},
        is_visible:{type:Boolean, 'default':true},
        creation_date:{type:Date, 'default':Date.now, editable:false},
        gui_order:{type:Number, 'default':9999999, editable:false},
        is_hidden:{type:Boolean, 'default':true},
        _preview:{type:Schema.Types.Mixed,link:'/',editable:false}
    }, {strict:true})),

    //cycle updates
    Update:utils.revertibleModel(new Schema({
        title:{type:String, required:true},
        tooltip:String,
        text_field_preview:{type:Schema.Types.Html},
        text_field:{type:Schema.Types.Html},
        image_field:Schema.Types.File,
        tags:{type:[String], index:true},
        cycle:{type:ObjectId, ref:'Cycle', index:true},
        is_visible:{type:Boolean, 'default':true},
        creation_date:{type:Date, 'default':Date.now},
        is_displayed: {type:Boolean, 'default':false},

        gui_order:{type:Number, 'default':9999999, editable:false},
        is_hidden:{type:Boolean, 'default':true}
    }, {strict:true})),

//    //cycle opinion_shapers
//    OpinionShaper: new Schema({
//        user_id:{type:ObjectId, ref:'User', required:true},
//        cycle_id: {type: ObjectId, ref: 'Cycle', required:true},
//        text: String
//    }, {strict: true}),



    Vote:{
        user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY, index:true, required:true},
        post_id:{type:ObjectId, ref:'Post', index:true, required:true, onDelete:'delete'},
        ballance:{type:Number, 'default':0},
        creation_date:{type:Date, 'default':Date.now}
    },

    VoteSuggestion:{
        user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY, index:true, required:true},
        suggestion_id:{type:ObjectId, ref:'Suggestion', index:true, required:true},
        balance:{type:Number, 'default':0},
        creation_date:{type:Date, 'default':Date.now}
    },

    Grade:{
        user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY, index:true, required:true},
        discussion_id:{type:ObjectId, ref:'Discussion', index:true, required:true},
        evaluation_grade:{type:Number, min:0, max:10},
        proxy_power:{type:Number, min:1, 'default':1},
        creation_date:{type:Date, 'default':Date.now}
    },

    GradeAction:{
        user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY, index:true, required:true},
        action_id:{type:ObjectId, ref:'Action', index:true, required:true},
        evaluation_grade:{type:Number, min:0, max:10},
        creation_date:{type:Date, 'default':Date.now}
    },

    GradeSuggestion:{
        user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY, index:true, required:true},
        suggestion_id:{type:ObjectId, ref:'Suggestion', index:true, required:true},
        evaluation_grade:{type:Number, min:0, max:10},
        proxy_power:{type:Number, min:1, 'default':1},
        creation_date:{type:Date, 'default':Date.now},
        //this field sets only when suggestion creates,
        //suprot == user's suggestoin grade is e or gtr then user's discussion grade
        does_support_the_suggestion:{type:Boolean}
    },

    GradeActionSuggestion:{
        user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY, index:true, required:true},
        suggestion_id:{type:ObjectId, ref:'ActionSuggestion', index:true, required:true},
        evaluation_grade:{type:Number, min:0, max:10},
        proxy_power:{type:Number, min:1, 'default':1},
        creation_date:{type:Date, 'default':Date.now},
        does_support_the_suggestion:{type:Boolean}
    },

    Like:{
        user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY, index:true, required:true},
        info_item_id:{type:ObjectId, ref:'Post', index:true, required:true},
        creation_date:{type:Date, 'default':Date.now}
    },

    Join:{
        user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY, index:true, required:true},
        action_creator_id:{type:ObjectId, ref:'User', query:common.FIND_USER_QUERY, index:true, required:true},
        action_id:{type:ObjectId, ref:'Action', index:true, required:true},
        creation_date:{type:Date, 'default':Date.now}
    },

    Category:{
        name:{type:String}
//        is_hidden:{type:Boolean, 'default':true}
    },

//    ActionSuggestion: {
//        creator_id: {type:Schema.ObjectId, ref:'User', index:true, required:true},
//        cycle_id: {type: ObjectId, ref: 'Cycle'},
//        first_name: String,
//        last_name: String,
//        creation_date:{type:Date, 'default':Date.now},
//        action_ref: {type: ObjectId, ref:'Action', required: true},
//        change: {},
//        is_approved: {type: Boolean, 'default': false}
//    },

    ResourceObligation:{
        user_id:{type:Schema.ObjectId, ref:'User',query:common.FIND_USER_QUERY, index:true, required:true},
        first_name:String,
        last_name:String,
        action_id:{type:ObjectId, ref:'Action', index:true, required:true},
        action_resources:[
            {resource:require('./action_resource'), amount:Number}
        ]
    },

    Notification:{
        user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY, index:true, required:true},
        notificators:[new Schema(
        {
            notificator_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY},
            sub_entity_id:{type:ObjectId},

            //only for votes and grade notifications
            ballance:Number,
            votes_for:{type:Number, 'default':0},
            votes_against:{type:Number, 'default':0}
        }
        )],
        type:{type:String, "enum":[
            'approved_info_item_i_created',
            'approved_discussion_i_created',
            'approved_discussion_i_took_part',
            'comment_on_discussion_you_are_part_of',
            "comment_on_discussion_you_created",
            "change_suggestion_on_discussion_you_are_part_of",
            "change_suggestion_on_discussion_you_created",
            "approved_change_suggestion_you_created",
            "approved_change_suggestion_on_discussion_you_are_part_of",
            "been_quoted",
            "new_discussion",
            "a_dicussion_created_with_info_item_that_you_like",
            "a_dicussion_created_with_info_item_that_you_created",
            "user_gave_my_post_tokens",
            "user_gave_my_post_bad_tokens",
            "user_gave_my_suggestion_tokens",
            "proxy_created_new_discussion",
            "proxy_graded_discussion",
            "proxy_created_change_suggestion",
            "proxy_graded_change_suggestion",
            "proxy_vote_to_post",
            "action_suggested_in_cycle_you_are_part_of",
            "update_created_in_cycle_you_are_part_of",
            "action_added_in_cycle_you_are_part_of",
            "action_you_created_was_approved",
            "action_you_are_participating_in_was_approved",
            "user_joined_action_you_created",
            "user_brings_resource_to_action_you_created",
            "post_added_to_action_you_joined",
            "post_added_to_action_you_created"
        ]
//        is_proxy_notification: {type: Boolean, 'default': false}
        },
        entity_id:{type:ObjectId},
        seen:{type:Boolean, 'default':false},
        update_date:{type:Date, 'default':Date.now},
        url:String,
        visited:{type:Boolean, 'default':true},
        mail_was_sent: {type:Boolean, 'default':true}
    },

    Tag:{
        tag:{type:String, unique:true},
        popularity:{type:Number, 'default':0, select:false}
    },

    GamificationTokens: {
        create_discussion:{type:Number, 'default':3},
        create_action:{type:Number, 'default':0},
        post_on_discussion:{type:Number, 'default':0},
        post_on_action:{type:Number, 'default':0},
        suggestion_on_discussion:{type:Number, 'default':0},
        suggestion_on_action:{type:Number, 'default':0},
        grade_discussion:{type:Number, 'default':0},
        grade_suggestion:{type:Number, 'default':0},
        grade_action:{type:Number, 'default':0},
        grade_action_suggestion:{type:Number, 'default':0},
        vote_on_post:{type:Number, 'default':0},
        vote_on_action_post:{type:Number, 'default':0},
        like_info_item:{type:Number, 'default':0},
        join_to_action:{type:Number, 'default':0},
        ceate_kilkul:{type:Number, 'default':0},
        join_kilkul:{type:Number, 'default':0},
        min_tokens_to_create_dicussion:{type:Number, 'default':10},
        min_tokens_to_create_action:{type:Number, 'default':0},
        min_tokens_to_create_blog:{type:Number, 'default':0},
        invite_X_people_who_got_Y_extra_tokens:{x:{type:Number, 'default':1000}, y:{type:Number, 'default':1000}},
        invite_X_people_who_signed_in:{type:Number, 'default':1000000},
        X_tokens_for_post:{type:Number, 'default':1000000},
        X_tokens_for_all_my_posts:{type:Number, 'default':1000000},
        X_suggestions_for_a_discussion:{type:Number, 'default':1000000},
        X_mandates_for_user: {type:Number, 'default':1000000},
        discussion_high_graded_by_min_of_X_people:{type:Number, 'default':1000000},
        spend_tokens_for_X_days_in_a_row:{type:Number, 'default':1000000}
    },

    ThresholdCalcVariables:{
        MIN_THRESH:{type:Number, 'default':2},
        MAX_THRESH:{type:Number, 'default':500},
        MAX_RED_RATIO:{type:Number, 'default':2},
        MAX_NUM_VOTERS:{type:Number, 'default':1000},
        SCALE_PARAM:{type:Number, 'default':1.6}
    },

    AboutUruText:utils.revertibleModel(new Schema({
        title:{type:String, required:true},
        text_field:{type:Schema.Types.Html, required:true},
        is_hidden:{type:Boolean, 'default':true},
        _preview:{type:Schema.Types.Mixed,link:'/about',editable:false}
    },{strict:true})),

    AboutUruItem:utils.revertibleModel(new Schema({
        img_field:{ type:Schema.Types.File, required:true},
        img_text:String,
        text_field:String,
        is_hidden:{type:Boolean, 'default':true},
        _preview:{type:Schema.Types.Mixed,link:'/about',editable:false}
    },{strict:true})),

    Team:utils.revertibleModel(new Schema({
        name:String,
        duty:String,
        text_field:{type:Schema.Types.Html, required:true},
        img_field:{type:Schema.Types.File, required:true},
        is_hidden:{type:Boolean, 'default':true},
        _preview:{type:Schema.Types.Mixed,link:'/team',editable:false}
    },{strict:true})),

    Founder:utils.revertibleModel(new Schema({
        name:String,
        first_name:String,
        last_name:String,
        duty:String,
        text_field:{type:Schema.Types.Html, required:true},
        img_field:{type:Schema.Types.File, required:true},
        is_hidden:{type:Boolean, 'default':true},
        _preview:{type:Schema.Types.Mixed,link:'/founder',editable:false}
    },{strict:true})),

    Qa:utils.revertibleModel(new Schema({
        title:{type:String, required:true},
        text_field:{type:Schema.Types.Text},
        is_hidden:{type:Boolean, 'default':true},
        _preview:{type:Schema.Types.Mixed,link:'/page/FAQ',editable:false}
    },{strict:true})),

    DiscussionHistory:{
        discussion_id:{type:ObjectId, ref:'Discussion'},
        date:{type:Date, 'default':Date.now},
        text_field:{type:Schema.Types.Text},
        // replaced part is the text that has been changed in the new version
        // so this and grade fields are being updated only when a new discussion history is created
        replaced_part:[
            {start:Number, end:Number, text:Schema.Types.Text}
        ],
        grade: Number
    },

    Counter:{
        type:    String ,
        quote_game:{
            popup_signup_click :    {type:Number, 'default':0,editable:false},
            join_cycle_click :    {type:Number, 'default':0,editable:false},
            facebook_joiners :    {type:Number, 'default':0,editable:false}
        }
    } ,

    PressItem:{
        title:  {type:String, required:true},
        abstract:  {type:String},
        image_field: { type:Schema.Types.File},
        link :  {type:String, required:true} ,
        date:  {type:Date, required:true},
        source:{type:String, "enum":["דה מרקר", "כלכליסט","גלובס", "ynet", "הארץ", "nrg", "walla", "mako",  "אחר"], required:true}    ,
        alternative_source:{type:String},

        discussions:{type:[ObjectId], limit: 1000, ref:'Discussion'  , index:true},
        cycles:     {type:[ObjectId], limit: 1000, ref:'Cycle', index:true}
    }
};

var schemas_with_tooltip = [require('./discussion'), require('./cycle'), require('./information_item'), require('./action'), Schemas.Headline, Schemas.Update];

_.each(schemas_with_tooltip, function (schema, index) {
    schema.methods.tooltip_or_title = function () {
        return this.tooltip || this.title;
    };
});



var Models = module.exports = {
    User:mongoose.model("User", require('./user')),
    InformationItem:mongoose.model('InformationItem', require('./information_item')),
    Discussion:mongoose.model('Discussion', require('./discussion')),
    Cycle:mongoose.model('Cycle', require('./cycle')),
    Action:mongoose.model('Action', require('./action')),

    Headline:mongoose.model('Headline', Schemas.Headline),

    Update:mongoose.model('Update', Schemas.Update),
//    OpinionShaper: mongoose.model('OpinionShaper', Schemas.OpinionShaper),
    DiscussionHistory:mongoose.model('DiscussionHistory', new Schema(Schemas.DiscussionHistory, {strict:true})),

    Subject:mongoose.model('Subject', require('./subject')),
    Post:require('./post'),
    PostSuggestion:require('./post_suggestion'),
    PostOnComment:require('./post_on_comment'),
    PostAction:require('./post_action'),
    Suggestion:require('./suggestion'),
    ActionSuggestion:require('./action_suggestion'),
    PostOrSuggestion:mongoose.model('PostOrSuggestion',require('./post_or_suggestion').Schema, 'posts'),
    Vote:mongoose.model('Vote', new Schema(Schemas.Vote, {strict:true})),
    VoteActionPost:mongoose.model('VoteActionPost', require('./vote_action_post')),
    VoteSuggestion:mongoose.model('VoteSuggestion', new Schema(Schemas.VoteSuggestion, {strict:true})),
    Like:mongoose.model('Like', new Schema(Schemas.Like, {strict:true})),
    Grade:mongoose.model('Grade', new Schema(Schemas.Grade, {strict:true})),
    GradeAction:mongoose.model('GradeAction', new Schema(Schemas.GradeAction, {strict:true})),
    GradeSuggestion:mongoose.model('GradeSuggestion', new Schema(Schemas.GradeSuggestion, {strict:true})),
    GradeActionSuggestion:mongoose.model('GradeActionSuggestion', new Schema(Schemas.GradeActionSuggestion, {strict:true})),
    Join:mongoose.model('Join', new Schema(Schemas.Join, {strict:true})),
    Category:mongoose.model('Category', new Schema(Schemas.Category, {strict:true})),
    ActionResource:mongoose.model('ActionResource', new Schema(require('./action_resource'), {strict:true})),
    Tag:mongoose.model('Tag', new Schema(Schemas.Tag, {strict:true})),
    FBRequest:mongoose.model('FBRequest', require('./fb_request')),
    ResourceObligation:mongoose.model('ResourceObligation', new Schema(Schemas.ResourceObligation, {strict:true})),
    Notification:mongoose.model('Notification', new Schema(Schemas.Notification, {strict:true})),
    AboutUruText:mongoose.model('AboutUruText', Schemas.AboutUruText),
    AboutUruItem:mongoose.model('AboutUruItem', Schemas.AboutUruItem),
    Team:mongoose.model('Team', Schemas.Team),
    Founder:mongoose.model('Founder', Schemas.Founder),
    Test:mongoose.model('Test', new Schema(Schemas.Test, {strict:true})),
    Qa:mongoose.model('Qa', Schemas.Qa),
    PressItem:mongoose.model('PressItem', new Schema(Schemas.PressItem)),
    ThresholdCalcVariables:utils.config_model('ThresholdCalcVariables', Schemas.ThresholdCalcVariables),

    ImageUpload:mongoose.model('ImageUpload', require('./image_upload')),

    FooterLink:mongoose.model('FooterLink', require('./footer_link')),
    GamificationTokens:utils.config_model('GamificationTokens', Schemas.GamificationTokens),

    DailyDiscussion:mongoose.model('DailyDiscussion', new Schema(Schemas.DailyDiscussion, {strict:true})),

    Counter          :mongoose.model('Counter', new Schema(Schemas.Counter, {strict:true})),

    Schemas:Schemas,
    setDefaultPublish:function (is_publish) {
        _.each(module.exports, function (model, name) {
            if (typeof(model) == 'function' && model.schema) {
                if (model.schema.path('is_hidden')) {
                    model.schema.path('is_hidden').
                default
                    (!is_publish);
                }
            }
        })
    }
};

Models.GamificationTokens.get = function() {};

mongoose.connection.collections.notifications.ensureIndex({ entity_id:1, user_id:1, type:1 }, { unique:true, dropDups:true }, console.log);
