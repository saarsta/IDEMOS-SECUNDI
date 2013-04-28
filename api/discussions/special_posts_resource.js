var jest = require('jest'),
    og_action = require('../../og/og.js').doAction,
    models = require('../../models'),
    common = require('../common.js'),
    async = require('async'),
    _ = require('underscore');

var EDIT_TEXT_LEGIT_TIME = 60 * 1000 * 15;

var SpecialPostsResource = module.exports = jest.MongooseResource.extend({
    init:function () {

        this._super(models.Post);
        this.allowed_methods = ['get'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {discussion_id:null};
        this.fields = {
            creator_id : common.user_public_fields,
            voter_balance: null,
            mandates_curr_user_gave_creator: null,
            text:null,
            popularity:null,
            tokens:null,
            creation_date: null,
            total_votes:null,
            votes_against:null,
            votes_for:null,
            _id:null,
            ref_to_post_id: null,
            discussion_id:null,
            is_user_follower: null,
            is_editable: null
        };
    },

    run_query: function(req,query,callback)
    {
        query.populate('creator_id');
        this._super(req,query,callback);
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {
        // getting 4 comments - most popular most cont admin selection and expert opinion
        var special_objects = [];

        models.Post.find({discussion_id: req.body.discussion_id}).sort({votes_for: -1}).exec(function(err, data){
            data.objects[0] = 'popular';
            special_objects.push(data.objects[0]);

            var most_contr = _.max(data.objects, function(post){
                return (post.votes_for + post.votes_against && post.id != special_objects[0].id);
            })

            if (most_contr) {
                most_contr.type = 'controversial';
                special_objects.push(most_contr);
            }

            var editor_choice = _.find(data.objects, function(post){
                return post.is_editor_choice === true;
            })

            if (editor_choice) {
                editor_choice.type = 'editor_choice';
                special_objects.push(editor_choice);
            }

            var expert_opinion = _.find(data.objects, function(post){
                return post.is_expert_opinion === true;
            })

            if (expert_opinion) {
                expert_opinion.type = 'editor_choice';
                special_objects.push(expert_opinion);
            }
        })
    },

    create_obj:function (req, fields, callback) {

        var user_id = req.session.user_id;
        var self = this;
        var post_object = new self.model();
        var user = req.user;
//        var notification_type = "comment_on_discussion_you_are_part_of"
        var discussion_id;
        var discussion_creator_id;
        var post_id;

        var iterator = function(unique_user, itr_cbk){
            if(unique_user){
                if (unique_user + "" == user_id)
                    itr_cbk(null, 0);
                else{
                    if (discussion_creator_id + "" == unique_user + ""){
                        notifications.create_user_notification("comment_on_discussion_you_created", post_id, unique_user, user_id, discussion_id, '/discussions/' + discussion_id, function(err, results){
                            itr_cbk(err, results);
                        });
                    }else{
                        notifications.create_user_notification("comment_on_discussion_you_are_part_of", post_id, unique_user, user_id, discussion_id, '/discussions/' + discussion_id, function(err, results){
                            itr_cbk(err, results);
                        });
                    }
                }
            }else{
                console.log("in the following discussion - there is a user with no _id");
                console.log(discussion_id);
                itr_cbk()
            }

        }

        console.log('debugging waterfall');

        /**
         * Waterfall:
         * 1) set post object fields, send to authorization
         * 2) save post object
         * 3) send notifications
         * 4) publish to facebook
         * Final) return the object with the creator user object
         */
        async.waterfall([

            // 1) set post object fields, send to authorization
            function(cbk)
            {
                console.log('debugging waterfall 1');
                fields.creator_id = user_id;
                fields.first_name = user.first_name;
                fields.last_name = user.last_name;
                fields.avatar = user.avatar;
                if(!fields.ref_to_post_id || fields.ref_to_post_id == "null" || fields.ref_to_post_id == "undefined")
                    delete fields.ref_to_post_id;

                // TODO add better sanitizer
             //   fields.text = sanitizer.sanitize(fields.text);

                for (var field in fields) {
                        post_object.set(field, fields[field]);
                }
                self.authorization.edit_object(req, post_object, cbk);
            },

            //  2) save post object
            function(_post_object, cbk){
                post_id = _post_object._id;
                post_object = _post_object;
                console.log('debugging waterfall 2');
                discussion_id = post_object.discussion_id + "";
                post_object.creator_id + "";

                post_object.save(function(err, result, num)
                {
                    cbk(err,result);
                });
            },

            // 3) send notifications
            function (object,cbk) {

                console.log('debugging waterfall 3');
                //if post created successfuly, add user to discussion
                // + add discussion to user
                //  + take tokens from the user

                async.parallel([
                    function(cbk2)
                    {
                        //add user that connected somehow to discussion
                        models.Discussion.update({_id:object.discussion_id, "users.user_id": {$ne: user_id}},
                            {$addToSet: {users: {user_id: user_id, join_date: Date.now(), $set:{last_updated: Date.now()}}}}, cbk2);
                    },

                    //add user that connected somehow to discussion
                    function(cbk2)
                    {
                        models.User.update({_id: user_id, "discussions.discussion_id": {$ne: object.discussion_id}},
                            {$addToSet: {discussions: {discussion_id: object.discussion_id, join_date: Date.now()}}}, cbk2);
                    },

                    //add notification for the dicussion's connected people or creator
                    function(cbk2){
                        console.log('debugging waterfall 3 2');

                        models.Discussion.findById(object.discussion_id, function(err, disc_obj){
                             if (err)
                                cbk2(err, null);
                             else{
                                 var unique_users = [];

                                 // be sure that there are no duplicated users in discussion.users
                                 _.each(disc_obj.users, function(user){ unique_users.push(user.user_id + "")});
                                 unique_users = _.uniq(unique_users);

                                discussion_creator_id = disc_obj.creator_id;
                                async.forEach(unique_users, iterator, cbk2);
                             }
                        })
                    },

                    //add notification for Qouted comment creator
                    function(cbk2){
                        console.log('debugging waterfall 3 3');

                        if(post_object.ref_to_post_id){
                            models.PostOrSuggestion.findById(post_object.ref_to_post_id, function(err, quoted_post){
                                if(err)
                                    cbk2(err, null);
                                else{
                                    if(quoted_post)
                                        notifications.create_user_notification("been_quoted", post_object._id/*ref_to_post_id*/, quoted_post.creator_id, post_object.creator_id, discussion_id, '/discussions/' + discussion_id, function(err, result){
                                            cbk2(err, result);
                                        });
                                    else
                                    {
                                        console.log("there is no post with post_object.ref_to_post_id id");
                                        cbk2(err, 0);
                                    }
                                }
                            })
                        }else{
                            cbk2(null, 0);
                        }
                    },

                    // update actions done by user
                    function(cbk2){
                        models.User.update({_id:user.id},{$set: {"actions_done_by_user.post_on_object": true}}, function(err){
                            cbk2(err);
                        });
                    },


                    //if this post create on discussion create, its free of tokens, otherwise put it on req
                    // TODO remove this. Post on Discussion create should be one single resource and one single calls, creation of first post should be done from there -> this check won't be necessary

                    function(cbk2){
                        models.Post.count({discussion_id: post_object.discussion_id}, function(err, count){
                            if(!err){
                                if(count > 1)
                                    req.token_price = common.getGamificationTokenPrice('post');
                            }

                            cbk2(err, count);
                        })
                    }
                    ],
                    cbk);
            },

            // 4) publish to facebook
            function(args,cbk) {
                og_action({
                    action: 'comment',
                    object_name:'discussion',
                    object_url : '/discussions/' + discussion_id,
                    callback_url:'/discussions/' + discussion_id + '/posts/' + post_id,
                    fid : user.facebook_id,
                    access_token:user.access_token,
                    user:user
                });
                cbk();
            }
        ],function(err)
        {
            var rsp = {};
            _.each(['text','popularity','creation_date','votes_for','votes_against', '_id'],function(field)
            {
                rsp[field] = post_object[field];
            });
            rsp.creator_id = req.user;
            callback(err, rsp);
        });
    },

    // user can update his post in the first 15 min after publish
    update_obj: function(req, object, callback){
        //first check if its in 15 min range after publish
        if(new Date() - object.creation_date > EDIT_TEXT_LEGIT_TIME){
            callback({message: 'to late to update comment', code: 404})
        }else{
            this._super(req, object, callback);
        }
    }
});

