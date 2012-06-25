var j_forms = require('j-forms'),
    mongoose_admin = require('admin-with-forms'),
    mongoose = require('mongoose'),
    Models = require('../models'),
    async = require('async'),
    DiscussionResource = require('../api/DiscussionResource'),
    SuggestionResource = require('../api/suggestionResource'),
    locale = require('../locale');

module.exports = function(app)
{
    j_forms.forms.set_models(Models);


    var admin = mongoose_admin.createAdmin(app,{root:'admin'});

    admin.ensureUserExists('Uruad','uruadmin!@#uruadmin');
    admin.ensureUserExists('ishai','istheadmin');

    admin.registerMongooseModel("User",Models.User,null,{list:['username','first_name','last_name']});
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
        ]
    });
    admin.registerMongooseModel("Subject",Models.Subject,null,{list:['name'],order_by:['gui_order'],sortable:'gui_order'});
    admin.registerMongooseModel("Discussion",Models.Discussion,null,{
        list:['title'],
        cloneable:true,
        form:require('./discussion')
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
    admin.registerMongooseModel("Cycle",Models.Cycle,null,{
        list:['title'],
        cloneable:true,
        form : require('./cycle')
    });
    admin.registerMongooseModel("Action",Models.Action,null,{list:['title'],cloneable:true});
    admin.registerMongooseModel('Locale',locale.Model, locale.Model.schema.tree,{list:['locale'],form:locale.LocaleForm});
    admin.registerMongooseModel('Post',Models.Post,null,{
        list:['text','username','discussion_id.title'],
        list_populate:['discussion_id'],
        order_by:['-discussion_id','-creation_date']
    });
    admin.registerMongooseModel('PostAction',Models.PostAction,null,{
        list:['text','username']
    });
    admin.registerMongooseModel('Suggestion',Models.Suggestion,null,{
        list:['parts.0.text'],
        form:require('./suggestion'),
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
        ]
    });
    admin.registerMongooseModel('Vote',Models.Vote,null,{
        list:['post_id','user_id']
    });

    admin.registerMongooseModel('VoteSuggestion',Models.VoteSuggestion,null,{
        list:['suggestion_id','user_id']
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
        list:['title']
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

    admin.registerSingleRowModel(Models.GamificationTokens,'GamificationTokens');

    admin.registerSingleRowModel(Models.ThresholdCalcVariables,'ThresholdCalcVariables');

    admin.registerMongooseModel('Admin_Users',mongoose.model('_MongooseAdminUser'),null,{
        list:['username']
    });

    admin.registerMongooseModel('Password Change Form',mongoose.model('_MongooseAdminUser'),null,{
        list:['username'] ,
        form:require('./admin'),
        createable:false
    });

};