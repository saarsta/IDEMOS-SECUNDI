var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    mongoose_types = require('j-forms').types,
    common = require('./common'),
    utils = require('./../utils');


var MinLengthValidator = function (min) {
    return [function (value) {
        return value && value.length >= min;
    }, 'Name must contain at least ' + min + ' letters'];
};

var RegexValidator = function (regex) {
    return [function (value) {
        return value && regex.exec(value)
    }, 'Value is not at the correct pattern'];
};

var User = module.exports = new Schema({

    //this is for validation
    is_activated: {type: Boolean, 'default': false},
    is_suspended: {type: Boolean, 'default': false},
    identity_provider:{type:String, "enum":['facebook', 'register']},
    facebook_id:String,
    access_token:String,
    first_name:{type:String, required:true, validate:MinLengthValidator(2)},
    last_name:{type:String, required:false},
    email:{type:String, required:true},//, match:/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/},
    gender:{type:String, "enum":['male', 'female']},
    age:{type:Number, min:0},
    last_visit:{type:Date,'default':Date.now},
    address: String,
    occupation: String,
    biography: String,
    invitation_code: String,
    //followers
    discussions:[
        new Schema({discussion_id:{type:ObjectId, ref:'Discussion'}, join_date: {type:Date, 'default':Date.now}})
    ],
    //followers
    cycles:[
        new Schema({cycle_id:{type:ObjectId, ref:'Cycle'}, join_date: {type:Date, 'default':Date.now}})
    ],
    //followers (site notifications)
    blogs:[
        new Schema({blog_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY}, join_date: {type:Date, 'default':Date.now}})
    ],
    //followers (mail notifications)
    blogs_email:[
        new Schema({blog_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY}, mail: String, join_date: {type:Date, 'default':Date.now}})
    ],
    // i dont know what this fields is, this is not "going users", it might be duplication of "people that conected somehow to the action" for efficiency
    actions:[
        new Schema( {action_id:{type:ObjectId, ref:'Action'}, join_date: {type:Date, 'default':Date.now}})
    ],
    followers: [
        new Schema({follower_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY}, join_date: {type:Date, 'default':Date.now}})
    ],
    password: {type: String, editable:false},
    validation_code: {type: String, editable:false},
    tokens:{type:Number, 'default':9, min: 0/*, max:15.9*/},
    gamification: {type:Schema.Types.Mixed,editable:false },
    updates: Schema.Types.Mixed,
    //proxy - people i gave my tokens
    proxy: [
        new Schema(
            {
                user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY},
                number_of_tokens: {type:Number, 'default': 0, /*min: 0,*/ max: 3},
                number_of_tokens_to_get_back: {type:Number, 'default': 0,/* min: 0,*/ max: 3
            }
        })
    ],
//    num_of_mandates_i_gave: {type: Number, 'default': 0},
    num_of_given_mandates: {type: Number, 'default': 0},
    //bookmark
    num_of_proxies_i_represent: {type: Number, 'default': 0},
    score:{type:Number, 'default':0},
//    unseen_notifications: {type:Number, 'default':0},
    decoration_status:{type:String, "enum":['a', 'b', 'c'], editable: false},
    invited_by: {type: ObjectId, ref: 'User', query:common.FIND_USER_QUERY},
    has_been_invited : {type: Boolean, 'default': false, editable: false},
    tokens_achivements_to_user_who_invited_me: Schema.Types.Mixed,
    num_of_extra_tokens: {type: mongoose_types.Integer, 'default': 0, max:6, min: 0},
    number_of_days_of_spending_all_tokens: {type: Number, 'default' : 0, editable: false},
    blog_popularity_counter: {type: Number, 'default': 0, editable: false},
    avatar : mongoose_types.File,
    minisite_code : String,
    blog_title: String,
    blog_sub_titile: String,
    blog_text_1: String,
    blog_text_2: {type:mongoose_types.Text},
    blog_text_3: String,
//    opinion_text: String,
    sent_mail: {type:Date},
    has_voted: [String],

    actions_done_by_user:{
        create_discussion:false,
        create_article:false,
        create_action:false,
        post_on_discussion:false,
        post_on_action:false,
        suggestion_on_discussion:false,
        suggestion_on_action:false,
        grade_discussion:false,
        grade_suggestion:false,
        grade_action:false,
        grade_action_suggestion:false,
        vote_on_post:false,
        vote_on_article_post:false,
        vote_on_action_post:false,
        like_info_item:false,
        join_to_action:false,
        ceate_kilkul:false,
        join_kilkul:false,
        min_tokens_to_create_dicussion:false,
        min_tokens_to_create_action:false,
        min_tokens_to_create_blog:false,
        invite_X_people_who_got_Y_extra_tokens:false,
        invite_X_people_who_signed_in:false,
        X_tokens_for_post:false,
        X_tokens_for_all_my_posts:false,
        X_suggestions_for_a_discussion:false,
        X_mandates_for_user: false,
        discussion_high_graded_by_min_of_X_people:false,
        spend_tokens_for_X_days_in_a_row:false
    }

}, {strict:true});

User.methods.toString = function()
{
    return this.first_name + ' ' + this.last_name;
};

User.methods.avatar_url = function()
{
    if(this.avatar && this.avatar.url)
        return this.avatar.url;
    else
        return this.facebook_id ? 'http://graph.facebook.com/' + this.facebook_id + '/picture/?type=large' : "/images/default_user_img.gif";
};

//User.post('save', function () {
//   console.log('user post save');
//});

//User.methods.toString = function()
//{
//    return this.first_name + ' ' + this.last_name;
//};
//
//User.methods.avatar_url = function()
//{
//    return this.avatar;
////    if(this.avatar && this.avatar.url)
////        return this.avatar.url;
////    else
////        return this.facebook_id ? 'http://graph.facebook.com/' + this.facebook_id + '/picture/?type=large' : "/images/default_user_img.gif";
//};
