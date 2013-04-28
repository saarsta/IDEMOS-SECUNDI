var mongoose_admin = require('formage-admin'),
    mongoose = require('mongoose'),
    Models = require('../models'),
    async = require('async'),
    SuggestionResource = require('../api/suggestionResource'),
    ActionResource = require('../api/actions/ActionResource'),
    models = require('../models');
var ActionForm = require('./action');
var GamificationForm = require('./gamification_tokens');
var UserForm = require('./user');
var DiscussionForm = require('./discussion');
var CycleForm = require('./cycle');
var SuggestionForm = require('./suggestion');
var IdkunimForm = require('./update');
var ChangePasswordForm = require('./admin');

mongoose_admin.forms.register_models(Models);


module.exports = function (app) {

    var admin = mongoose_admin.createAdmin(app, {root: 'admin'});

    mongoose_admin.loadApi(app);

    admin.ensureUserExists('Uruad', 'uruadmin!@#uruadmin');
    admin.ensureUserExists('saar', '123qwe456');


    admin.registerMongooseModel("Subject", Models.Subject, null, {
        list: ['name'],
        order_by: ['gui_order'],
        sortable: 'gui_order'
    });

    admin.registerMongooseModel('Headline', Models.Headline, null, {
        list: ['title']
    });

    admin.registerMongooseModel("User", Models.User, null, {
        form: UserForm,
        list: ['username', 'first_name', 'last_name'],
        filters: ['email', 'gender', 'identity_provider'],
        search: '/__value__/.test(this.first_name+this.last_name)'
    });

    admin.registerMongooseModel("InformationItem", Models.InformationItem, null, {
        list: ['title'],
        order_by: ['gui_order'],
        sortable: 'gui_order',
        filters: ['created_by', 'status', 'is_hidden', 'is_hot_object'],
        cloneable: true,
        actions: [
            {
                value: 'approve',
                label: 'Approve',
                func: function (user, ids, callback) {
                    Models.InformationItem.update({_id: {$in: ids}}, {$set: {is_approved: true}}, {multi: true}, callback);
                }
            }
        ]
    });

    admin.registerMongooseModel("Discussion", Models.Discussion, null, {
        list: ['title'],
        cloneable: true,
        form: DiscussionForm,
        order_by: ['-creation_date'],
        filters: ['created_by', 'is_published', 'is_hidden', 'is_hot_object', 'is_cycle.flag']
    });

    admin.registerMongooseModel('Post', Models.Post, null, {
        list: ['text', 'username', 'discussion_id.title'],
        list_populate: ['discussion_id'],
        order_by: ['-creation_date'],
        filters: ['discussion_id', 'creator_id'],
        search: '/__value__/.test(this.discussion_id)'
    });

    admin.registerMongooseModel('Suggestion', Models.Suggestion, null, {
        list: ['parts.0.text', 'discussion_id.title'],
        list_populate: ['discussion_id'],
        form: SuggestionForm,
        order_by: ['-discussion_id', '-creation_date'],
        actions: [
            {
                value: 'approve',
                label: 'Approve',
                func: function (user, ids, callback) {
                    async.forEach(ids, function (id, cbk) {
                        SuggestionResource.approveSuggestion(id, cbk);
                    }, callback);
                }
            }
        ],
        filters: ['discussion_id', 'creator_id']
    });

     admin.registerMongooseModel('PostSuggestion', Models.PostSuggestion, null, {
         list: ['text', 'discussion_id.title'],
         list_populate: ['discussion_id'],
         order_by: ['-creation_date'],
         filters: ['discussion_id', 'creator_id']
        });

    admin.registerMongooseModel('PressItem', mongoose.model('PressItem'), null, {
        list: ['title'],
        order_by: ['gui_order'],
        sortable: 'gui_order'
    });

    admin.registerMongooseModel("Cycle", Models.Cycle, null, {
        list: ['title'],
        cloneable: true,
        form: CycleForm,
        filters: ['created_by', 'is_hidden', 'is_hot_object']
    });

    admin.registerMongooseModel('Update', Models.Update, null, {
        list: ['title'],
        form: IdkunimForm
    });

    admin.registerMongooseModel('Action', Models.Action, null, {
        form: ActionForm,
        list: ['title'],
        actions: [
            {
                value: 'approve',
                label: 'Approve',
                func: function (user, ids, callback) {
                    async.forEach(ids, function (id, cbk) {
                        ActionResource.approveAction(id, cbk);
                    }, callback);
                }
            },
            {
                value: 'un approve',
                label: 'Un - Approve',
                func: function (user, ids, callback) {
                    async.forEach(ids, function (id, cbk) {
                        unApproveAction(id, cbk);
                    }, callback);
                }
            }
        ]
    });

    admin.registerMongooseModel('ActionResource', Models.ActionResource, null, {
        list: ['name', 'category']
    });

    admin.registerMongooseModel('PostAction', Models.PostAction, null, {
        list: ['text', 'username', 'discussion_id.title'],
        list_populate: ['discussion_id'],
        order_by: ['-creation_date'],
        filters: ['discussion_id', 'creator_id']
    });

    admin.registerMongooseModel('Article', Models.Article, null, {
        list: ['title', 'getLink']
    });

    admin.registerMongooseModel('PostArticle', Models.PostArticle, null, {
        list: ['article_id', 'text']
    });











    admin.registerSingleRowModel(Models.GamificationTokens, 'GamificationTokens', {
            form: GamificationForm}
    );

    admin.registerMongooseModel("DiscussionHistory", Models.DiscussionHistory, null, {
        list: ['discussion_id', 'date'],
        cloneable: true,
        filters: ['discussion_id']
    });

    admin.registerMongooseModel('Kilkul', Models.Kilkul, null, {
        list: ['title']
    });

    admin.registerMongooseModel('DailyDiscussion', mongoose.model('DailyDiscussion'), null, {
        list: ['title'],
        list_populate: ['discussion_id'],
        order_by: ['gui_order'],
        sortable: 'gui_order'
    });

    admin.registerMongooseModel('Category', Models.Category, null, {
        list: ['name']
    });

    admin.registerMongooseModel('SuccessStory', Models.SuccessStory, null, {
        list: ['title']
    });

    admin.registerMongooseModel('AboutUruText', Models.AboutUruText, null, {
        list: ['title']
    });

    admin.registerMongooseModel('AboutUruItem', Models.AboutUruItem, null, {
        list: ['text_field']
    });

    admin.registerMongooseModel('Team', Models.Team, null, {
        list: ['name'],
        cloneable: true
    });

    admin.registerMongooseModel('Founder', Models.Founder, null, {
        list: ['name'],
        cloneable: true
    });

    admin.registerMongooseModel('Qa', Models.Qa, null, {
        list: ['title']
    });

    admin.registerMongooseModel('FooterLink', mongoose.model('FooterLink'), null, {
        list: ['tab', 'name'],
        order_by: ['gui_order'],
        sortable: 'gui_order'
    });

/*
    admin.registerMongooseModel('Vote', Models.Vote, null, {
        list: ['post_id', 'user_id']
    });

    admin.registerMongooseModel('VoteSuggestion', Models.VoteSuggestion, null, {
        list: ['suggestion_id', 'user_id']
    });
    admin.registerMongooseModel('Grade', Models.Grade, null, {
        list: ['discussion_id', 'user_id']
    });
    admin.registerMongooseModel('Like', Models.Like, null, {
        list: ['information_item_id', 'user_id']
    });
    admin.registerMongooseModel('Join', Models.Join, null, {
        list: ['action_id', 'user_id']
    });



    admin.registerMongooseModel('Tag', Models.Tag, null, {
        list: ['tag']
    });














    admin.registerMongooseModel('Test', Models.Test, null, {
        list: ['action_resources'],
        cloneable: true
    });



    admin.registerMongooseModel('ElectionsText', Models.ElectionsText, null, {
        list: ['title']
    });

    admin.registerMongooseModel('ElectionsItem', Models.ElectionsItem, null, {
        list: ['title']
    });

    admin.registerMongooseModel('ImageUpload', Models.ImageUpload, null, {
        list: ['image.url']
    });

    admin.registerMongooseModel('Notification', Models.Notification, null, {
        list: ['type'],
        order_by: ['-on_date'],
        filters: ['type']
    });

    admin.registerMongooseModel('FBRequest', Models.FBRequest, null, {
        list_populate: ['creator'],
        list: ['link', 'creator.first_name', 'creator.last_name']
    });

    admin.registerSingleRowModel(Models.ThresholdCalcVariables, 'ThresholdCalcVariables');


    admin.registerMongooseModel('Admin_Users', mongoose.model('_MongooseAdminUser'), null, {
        list: ['username']
    });



    admin.registerMongooseModel('Password Change Form', mongoose.model('_MongooseAdminUser'), null, {
        list: ['username'],
        form: ChangePasswordForm,
        createable: false
    });


    admin.registerMongooseModel('QuoteGameParty', mongoose.model('QuoteGameParty'), null, {
        list: ['name'],
        order_by: ['gui_order'],
        sortable: 'gui_order'
    });
    admin.registerMongooseModel('QuoteGameCandidate', mongoose.model('QuoteGameCandidate'), null, {
        list: ['name'],
        order_by: ['gui_order'],
        sortable: 'gui_order'
    });

    admin.registerMongooseModel('QuoteGameQuote', mongoose.model('QuoteGameQuote'), null, {
        list: ['quote'],
        list_populate: ['QuoteGameCandidate'],
        order_by: ['gui_order'],
        sortable: 'gui_order'
    });


*/




};


var unApproveAction = function (id, callback) {
    models.Action.update({_id: id}, {$set: {is_approved: false}}, function (err, num) {
        if (err)
            console.error(err);
        callback(err, num);
    })
};
