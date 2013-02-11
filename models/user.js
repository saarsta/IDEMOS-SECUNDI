var Schema = require("mongoose").Schema,
    ObjectId = Schema.ObjectId,
    common = require('./common'),
    utils = require('./../utils');


var MinLengthValidator = function (min) {
    return [
        function (value) {return value && value.length >= min;},
        'Name must contain at least ' + min + ' letters'
    ];
};

var User = module.exports = new Schema({
    is_activated: {type: Boolean, 'default': false},
    is_suspended: {type: Boolean, 'default': false},
    identity_provider: {type: String, "enum": ['facebook', 'register']},
    facebook_id: String,
    access_token: String,
    first_name: {type: String, required: true, validate: MinLengthValidator(2)},
    last_name: {type: String, required: false},
    email: {type: String, required: true},//, match:/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/},
    gender: {type: String, "enum": ['male', 'female']},
    age: {type: Number, min: 0},
    last_visit: {type: Date, 'default': Date.now},
    address: String,
    occupation: String,
    biography: String,
    invitation_code: String,
    discussions: [
        new Schema({discussion_id: {type: ObjectId, ref: 'Discussion'}, join_date: {type: Date, 'default': Date.now}})
    ],
    cycles: [new Schema({cycle_id: {type: ObjectId, ref: 'Cycle'}, join_date: {type: Date, 'default': Date.now}})],
    blogs: [
        new Schema({blog_id: {type: ObjectId, ref: 'User', query: common.FIND_USER_QUERY}, join_date: {type: Date, 'default': Date.now}})
    ],
    blogs_email: [
        new Schema({blog_id: {type: ObjectId, ref: 'User', query: common.FIND_USER_QUERY}, mail: String, join_date: {type: Date, 'default': Date.now}})
    ],
    actions: [new Schema({action_id: {type: ObjectId, ref: 'Action'}, join_date: {type: Date, 'default': Date.now}})],
    followers: [
        new Schema({follower_id: {type: ObjectId, ref: 'User', query: common.FIND_USER_QUERY}, join_date: {type: Date, 'default': Date.now}})
    ],
    invited_friends: [
        new Schema({
            object_type: {type: String},
            object_id: {type: ObjectId},
            facebook_request: {type: String},
            facebook_ids: [
                {type: String}
            ],
            emails: [
                {type: String}
            ],
            date: {type: Date, 'default': Date.now}
        })
    ],

    password: {type: String, editable: false},
    validation_code: {type: String, editable: false},
    tokens: {type: Number, 'default': 9, min: 0},
    gamification: {type: Schema.Types.Mixed, editable: false },
    updates: Schema.Types.Mixed,
    proxy: [
        new Schema({
            user_id: {type: ObjectId, ref: 'User', query: common.FIND_USER_QUERY},
            number_of_tokens: {type: Number, 'default': 0, max: 3},
            number_of_tokens_to_get_back: {type: Number, 'default': 0, max: 3}
        })
    ],
    num_of_given_mandates: {type: Number, 'default': 0},
    num_of_proxies_i_represent: {type: Number, 'default': 0},
    score: {type: Number, 'default': 0},
    decoration_status: {type: String, "enum": ['a', 'b', 'c'], editable: false},
    invited_by: {type: ObjectId, ref: 'User', query: common.FIND_USER_QUERY},
    has_been_invited: {type: Boolean, 'default': false, editable: false},
    tokens_achivements_to_user_who_invited_me: Schema.Types.Mixed,
    num_of_extra_tokens: {type: Schema.Types.Integer, 'default': 0, max: 6, min: 0},
    number_of_days_of_spending_all_tokens: {type: Number, 'default': 0, editable: false},
    blog_popularity_counter: {type: Number, 'default': 0, editable: false},
    avatar: Schema.Types.Picture,
    minisite_code: String,
    blog_title: String,
    blog_sub_titile: String,
    blog_text_1: String,
    blog_text_2: {type: Schema.Types.Text},
    blog_text_3: String,
    sent_mail: {type: Date},
    actions_done_by_user: {
        create_object: false,
        post_on_object: false,
        suggestion_on_object: false,
        grade_object: false,
        vote_on_object: false,
        join_to_object: false
    },
    no_mail_notifications : {type : Boolean, "default": true},
    has_voted: [String],
    quote_game: {
        played: {type: Boolean, "default": false},
        games: [String],
        quotes_count: {type: Number, 'default': 0, editable: false},
        quotes:[{quote: {type:ObjectId, ref:'QuoteGameQuote'},selection: String}]
    },
    mail_notification_configuration: {
        get_mails: {type: Boolean, 'default': true},
        get_uru_updates: {type: Boolean, 'default': true},
        get_weekly_mails: {type: Boolean, 'default': true},
        new_discussion: [ new Schema(
           {
               subject_id: {type: ObjectId, ref: 'Subject'},
               get_alert: {type: Boolean}
           }
        )],
        new_daily_discussion: {type: Boolean, 'default': true},
        new_discussion_comment: {type: Boolean, 'default': true},
        new_discussion_suggestion: {type: Boolean, 'default': true},
        //new_discussion_doc_change: {type: Boolean, 'default': true},
        /*new_cycle: [ new Schema( i don't understand what kind of cycles will be here
         {

         }
         )],*/
        new_action_comment: { type: Boolean, 'default': true}
    }
}, {strict: true});


User.methods.toString = function () {return this.first_name + ' ' + this.last_name;};


User.methods.avatar_url = function () {
    if (this.avatar && this.avatar.url) {
        return this.avatar.url;
    } else {
        return this.facebook_id ?
            'http://graph.facebook.com/' + this.facebook_id + '/picture/?type=large'
            :
            "/images/default_user_img.gif";
    }
};
