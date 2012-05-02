var j_forms = require('j-forms'),
    mongoose_admin = require('admin-with-forms'),
    Models = require('./models'),
    locale = require('./locale');

module.exports = function(app)
{
        j_forms.forms.set_models(Models);


        var admin = mongoose_admin.createAdmin(app,{root:'admin'});

        admin.ensureUserExists('admin','admin');

        admin.registerMongooseModel("User",Models.User,null,{list:['username','first_name','last_name']});
        admin.registerMongooseModel("InformationItem",Models.InformationItem, null,{list:['title'],order_by:['gui_order'],sortable:'gui_order',cloneable:true});
        admin.registerMongooseModel("Subject",Models.Subject,null,{list:['name'],order_by:['gui_order'],sortable:'gui_order'});
        admin.registerMongooseModel("Discussion",Models.Discussion,null,{list:['title'],cloneable:true});
        admin.registerMongooseModel("Cycle",Models.Cycle,null,{list:['title'],cloneable:true});
        admin.registerMongooseModel("Action",Models.Action,null,{list:['title'],cloneable:true});
        admin.registerMongooseModel('Locale',locale.Model, locale.Model.schema.tree,{list:['locale'],form:locale.LocaleForm});
        admin.registerMongooseModel('Post',Models.Post,null,{
            list:['text','username']
        });
        admin.registerMongooseModel('PostAction',Models.PostAction,null,{
            list:['text','username']
        });
        admin.registerMongooseModel('Suggestion',Models.Suggestion,null,{
            list:['username']
        });
        admin.registerMongooseModel('Vote',Models.Vote,null,{
            list:['post_id','user_id']
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

        admin.registerMongooseModel('Kilkul',Models.Kilkul,null,{
            list:['title']
        });

        admin.registerMongooseModel('Update',Models.Update,null,{
            list:['title']
        });

        admin.registerMongooseModel('GamificationTokens',Models.GamificationTokens,null, {list:['create_discussion']});
};