var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,_ = require('underscore');

var GamificationTokens = module.exports = {
    create_discussion:{type:Number, 'default':3},
    create_article:{type:Number, 'default':0},
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
    vote_on_article_post:{type:Number, 'default':0},
    vote_on_action_post:{type:Number, 'default':0},
    like_info_item:{type:Number, 'default':0},
    join_to_action:{type:Number, 'default':0},
    ceate_kilkul:{type:Number, 'default':0},
    join_kilkul:{type:Number, 'default':0},
    min_tokens_to_create_dicussion:{type:Number, 'default':10},
    min_tokens_to_create_action:{type:Number, 'default':0},
    invite_X_people_who_got_Y_extra_tokens:{x:{type:Number, 'default':1000}, y:{type:Number, 'default':1000}},
    invite_X_people_who_signed_in:{type:Number, 'default':1000000},
    X_tokens_for_post:{type:Number, 'default':1000000},
    X_tokens_for_all_my_posts:{type:Number, 'default':1000000},
    X_suggestions_for_a_discussion:{type:Number, 'default':1000000},
    X_mandates_for_user: {type:Number, 'default':1000000},
    discussion_high_graded_by_min_of_X_people:{type:Number, 'default':1000000},
    spend_tokens_for_X_days_in_a_row:{type:Number, 'default':1000000}
};

var link = [];

GamificationTokens.statics.load = function(callback) {
    this.find({}).sort({'gui_order':1}).exec(function(err,docs) {
        if(docs)
            links = docs;
        if(callback)
            callback(err);
    });
};

GamificationTokens.statics.getGamificationTokens = function() {
    return links;
};

GamificationTokens.pre('save',function(next) {
    mongoose.model('GamificationToken').load();
    next();
});

//GamificationTokens.statics.getGamificationTokens = function(link) {
//    return _.find(links,function(gamification_tokens) {
//        return gamification_tokens.tab == link;
//    });
//};