var j_forms = require('j-forms'),
    mongoose_admin = require('admin-with-forms'),
    mongoose = require('mongoose'),
    Models = require('../models'),
    async = require('async'),
    DiscussionResource = require('../api/discussions/DiscussionResource.js'),
    SuggestionResource = require('../api/suggestionResource'),
    locale = require('../locale');

module.exports = function(app)
{
    j_forms.forms.set_models(Models);


    var admin = mongoose_admin.createAdmin(app,{root:'admin'});

    mongoose_admin.loadApi(app);

    if(require('../utils').getShowOnlyPublished()) {
        var _modelCounts = admin.modelCounts;
        admin.modelCounts = function(collectionName,filters, onReady) {
                filters = filters || {};
                if(this.models[collectionName].model.schema.paths.is_hidden)
                    filters['is_hidden'] = -1;
                _modelCounts.call(this,collectionName,filters,onReady);
        };

        var _listModelDocuments = admin.listModelDocuments;
        admin.listModelDocuments = function(collectionName, start, count,filters,sort, onReady) {
            filters = filters || {};
            if(this.models[collectionName].model.schema.paths.is_hidden)
                filters['is_hidden'] = -1;

            _listModelDocuments.call(this,collectionName, start, count,filters,sort, onReady);
        };

    }

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
//            actions:[
//                {
//                    value:'approve',
//                    label:'Approve',
//                    func: function(user,ids,callback)
//                    {
//                        async.forEach(ids,function(id,cbk)
//                        {
//                            DiscussionResource.approveDiscussionToCycle(id,cbk);
//                        },callback);
//                    }
//                }
//            ]
    });
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
    admin.registerMongooseModel("Action",Models.Action,null,{list:['title'],cloneable:true});
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

    admin.registerMongooseModel('OpinionShaper',Models.OpinionShaper,null,{
        list:['cycle_id','user_id']
    });

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
        list:['title']
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

    admin.registerSingleRowModel(Models.GamificationTokens,'GamificationTokens');

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

};