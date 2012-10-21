var j_forms = require('j-forms'),
    mongoose_admin = require('admin-with-forms'),
    mongoose = require('mongoose'),
    Models = require('../models'),
    async = require('async'),
    DiscussionResource = require('../api/discussions/DiscussionResource.js'),
    SuggestionResource = require('../api/suggestionResource'),
    ActionResource = require('../api/actions/ActionResource'),
    locale = require('../locale');

module.exports = function(app)
{
    j_forms.forms.set_models(Models);

    if(app.get('env') == 'production'){
        app.all(/^\/admin/,function(req,res) {
            res.redirect('http://uru-staging.herokuapp.com/admin/');
        });
        return;
    }



    var admin = mongoose_admin.createAdmin(app,{root:'admin'});

    mongoose_admin.loadApi(app);

//    if(require('../utils').getShowOnlyPublished()) {
//        var _modelCounts = admin.modelCounts;
//        admin.modelCounts = function(collectionName,filters, onReady) {
//                filters = filters || {};
//                if(this.models[collectionName].model.schema.paths.is_hidden)
//                    filters['is_hidden'] = -1;
//                _modelCounts.call(this,collectionName,filters,onReady);
//        };
//
//        var _listModelDocuments = admin.listModelDocuments;
//        admin.listModelDocuments = function(collectionName, start, count,filters,sort, onReady) {
//            filters = filters || {};
//            if(this.models[collectionName].model.schema.paths.is_hidden)
//                filters['is_hidden'] = -1;
//
//            _listModelDocuments.call(this,collectionName, start, count,filters,sort, onReady);
//        };
//
//        admin.getDocument = function(collectionName, documentId, onReady) {
//            this.models[collectionName].model.findOne({_id:documentId,is_hidden:-1}, function(err, document) {
//                if (err) {
//                    console.log('Unable to get document because: ' + err);
//                    onReady('Unable to get document', null);
//                } else {
//                    onReady(null, document);
//                }
//            });
//        };
//
//        var permissions = require('admin-with-forms/permissions');
//        var MongooseAdminAudit = require('admin-with-forms/mongoose_admin_audit.js').MongooseAdminAudit;
//
//        admin.updateDocument = function(req,user, collectionName, documentId, params, onReady) {
//            onReady = _.once(onReady);
//            var self = this;
//            var fields = this.models[collectionName].fields;
//            var model = this.models[collectionName].model;
//            if(permissions.hasPermissions(user,collectionName,'update'))
//            {
//
//                var form_type = this.models[collectionName].options.form || AdminForm;
//                model.findOne({_id:documentId,is_hidden:-1}, function(err, document) {
//                    if (err) {
//                        console.log('Error retrieving document to update: ' + err);
//                        onReady('Unable to update', null);
//                    } else {
//
//                        var form = new form_type(req,{instance:document,data:params},model);
//                        form.is_valid(function(err,valid)
//                        {
//                            if(err)
//                            {
//                                onReady(err, null);
//                                return;
//                            }
//                            if(valid)
//                            {
//                                form.save(function(err,document)
//                                {
//                                    if (err) {
////                            console.log('Unable to update document: ' + err);
//                                        onReady(form, null);
//                                    } else {
//
//                                        if (self.models[collectionName].options && self.models[collectionName].options.post) {
//                                            document = self.models[collectionName].options.post(document);
//                                        }
//                                        MongooseAdminAudit.logActivity(user, self.models[collectionName].modelName, collectionName, document._id, 'edit', null, function(err, auditLog) {
//                                            onReady(null, document);
//                                        });
//                                    }
//
//                                });
//                            }
//                            else
//                            {
//                                onReady(form,null);
//                            }
//                        });
//                    }
//                });
//            }
//            else
//            {
//                onReady('unauthorized');
//            }
//        };
//    }

    admin.ensureUserExists('Uruad','uruadmin!@#uruadmin');
    admin.ensureUserExists('ishai','istheadmin');

    admin.registerMongooseModel("User",Models.User,null,{
        form:require('./user'),
        list:['username','first_name','last_name'],
        filters:['email','first_name','last_name','facebook_id','gender','age','invitation_code','identity_provider']
    });
    admin.registerMongooseModel("InformationItem",Models.InformationItem, null,{
        list:['title'],
        order_by:['gui_order'],
        sortable:'gui_order',
        cloneable:true,
        actions:[
            {
                value:'approve',
                label:'Approve',
                func: function(user,ids,callback)
                {
                    Models.InformationItem.update({_id:{$in:ids}},{$set:{is_approved:true}},{multi:true},callback);
                }
            }
        ],
        filters:['created_by','status','is_hidden','is_hot_object']
    });
    admin.registerMongooseModel("Subject",Models.Subject,null,{list:['name'],order_by:['gui_order'],sortable:'gui_order'});
    admin.registerMongooseModel("Discussion",Models.Discussion,null,{
        list:['title'],
        cloneable:true,
        form:require('./discussion'),
        order_by:['-creation_date'],
        filters:['created_by','is_published','is_hidden','is_hot_object','is_cycle']
    });

    admin.registerSingleRowModel(Models.GamificationTokens,'GamificationTokens', {form:require('./gamification_tokens')});

    admin.registerMongooseModel("DiscussionHistory",Models.DiscussionHistory,null,{
        list:['discussion_id', 'date'],
        cloneable:true,
        filters:['discussion_id']
    });
    admin.registerMongooseModel("Cycle",Models.Cycle,null,{
        list:['title'],
        cloneable:true,
        form : require('./cycle'),
        filters:['created_by','is_hidden','is_hot_object']
    });
//    admin.registerMongooseModel("Action",Models.Action,null,{
//        form:require('./action'),
//        list:['title'],
//        cloneable:true
//    });
//    admin.registerMongooseModel('Locale',locale.Model, locale.Model.schema.tree,{list:['locale'],form:locale.LocaleForm});
    admin.registerMongooseModel('Post',Models.Post,null,{
        list:['text','username','discussion_id.title'],
        list_populate:['discussion_id'],
        order_by:['-creation_date'],
        filters:['discussion_id','creator_id']
    });
    admin.registerMongooseModel('PostAction',Models.PostAction,null,{
        list:['text','username','discussion_id.title'],
        list_populate:['discussion_id'],
        order_by:['-creation_date'],
        filters:['discussion_id','creator_id']
    });
    admin.registerMongooseModel('Suggestion',Models.Suggestion,null,{
        list:['parts.0.text', 'discussion_id.title'],
        list_populate:['discussion_id'],
        form:require('./suggestion'),
        order_by:['-discussion_id','-creation_date'],
        actions:[
            {
                value:'approve',
                label:'Approve',
                func: function(user,ids,callback)
                {
                    async.forEach(ids,function(id,cbk)
                    {
                        SuggestionResource.approveSuggestion(id,cbk);
                    },callback);
                }
            }
        ],
        filters:['discussion_id','creator_id']
    });
    admin.registerMongooseModel('Vote',Models.Vote,null,{
        list:['post_id','user_id']
    });

    admin.registerMongooseModel('VoteSuggestion',Models.VoteSuggestion,null,{
        list:['suggestion_id','user_id']
    });

//    admin.registerMongooseModel('OpinionShaper',Models.OpinionShaper,null,{
//        list:['cycle_id','user_id']
//    });

    admin.registerMongooseModel('Grade',Models.Grade,null,{
        list:['discussion_id','user_id']
    });
    admin.registerMongooseModel('Like',Models.Like,null,{
        list:['information_item_id','user_id']
    });
    admin.registerMongooseModel('Join',Models.Join,null,{
        list:['action_id','user_id']
    });
    admin.registerMongooseModel('Category',Models.Category,null,{
        list:['name']
    });
    admin.registerMongooseModel('Article',Models.Article,null,{
        list:['title', 'getLink']
    });
    admin.registerMongooseModel('PostArticle',Models.PostArticle,null,{
        list:['article_id', 'text']
    });
    admin.registerMongooseModel('Tag',Models.Tag,null,{
        list:['tag']
    });
    admin.registerMongooseModel('Action',Models.Action,null,{
        form:require('./action'),
        list:['title'],
        actions:[
            {
                value:'approve',
                label:'Approve',
                func: function(user,ids,callback)
                {
                    async.forEach(ids,function(id,cbk)
                    {
                        ActionResource.approveAction(id,cbk);
                    },callback);
                }
            }
        ]
    });

    admin.registerMongooseModel('ActionResource',Models.ActionResource,null,{
        list:['name','category']
    });

    admin.registerMongooseModel('SuccessStory',Models.SuccessStory,null,{
        list:['title']
    });

    admin.registerMongooseModel('Headline',Models.Headline,null,{
        list:['title']
    });

    admin.registerMongooseModel('Update',Models.Update,null,{
        list:['title']
    });

    admin.registerMongooseModel('Kilkul',Models.Kilkul,null,{
        list:['title']
    });

    admin.registerMongooseModel('AboutUruText',Models.AboutUruText,null,{
        list:['title']
    });

    admin.registerMongooseModel('AboutUruItem',Models.AboutUruItem,null,{
        list:['text_field']
    });

    admin.registerMongooseModel('Team',Models.Team,null,{
            list:['name'],
            cloneable:true
        });

    admin.registerMongooseModel('Founder',Models.Founder,null,{
        list:['name'],
        cloneable:true
    });

    admin.registerMongooseModel('Test',Models.Test,null,{
            list:['action_resources'],
            cloneable:true
    });

    admin.registerMongooseModel('Qa',Models.Qa,null,{
                list:['title']
    });

    admin.registerMongooseModel('ElectionsText',Models.ElectionsText,null,{
                list:['title']
    });

    admin.registerMongooseModel('ElectionsItem',Models.ElectionsItem,null,{
                list:['title']
    });

    admin.registerMongooseModel('ImageUpload',Models.ImageUpload,null,{
        list:['image.url']
    });

    admin.registerMongooseModel('Notification',Models.Notification,null,{
        list:['type'],
        order_by:['-on_date']
    });

    admin.registerMongooseModel('FBRequest',Models.FBRequest,null,{
        list_populate:['creator'],
        list:['link','creator.first_name','creator.last_name']
    });

    admin.registerSingleRowModel(Models.ThresholdCalcVariables,'ThresholdCalcVariables');



    admin.registerMongooseModel('Admin_Users',mongoose.model('_MongooseAdminUser'),null,{
        list:['username']
    });

    admin.registerMongooseModel('FooterLink',mongoose.model('FooterLink'),null,{
        list:['tab','name'],
        order_by:['gui_order'],
        sortable:'gui_order'
    });

    admin.registerMongooseModel('Password Change Form',mongoose.model('_MongooseAdminUser'),null,{
        list:['username'] ,
        form:require('./admin'),
        createable:false
    });

    admin.registerMongooseModel('DailyDiscussion',mongoose.model('DailyDiscussion'),null,{
        list:['title'],
        list_populate:['discussion_id'],
        order_by:['gui_order'],
        sortable:'gui_order'
    });

};