var jest = require('jest')
    ,models = require('../../models')
    ,common = require('.././common')
    ,async = require('async')
    ,_ = require('underscore');

var CyclePostResource = module.exports = jest.Resource.extend({
    init:function(){
        this._super();
        this.allowed_methods = ['get'];
        this.authentication = new common.SessionAuthentication();
        this.filtering = {};
        this.sorting = {};
//        this.fields = {
//            _id: null,
//            title: null,
//            tooltip_or_title:null,
//            type: null,
//            text_field_preview: null,
//            image_field_preview: null,
//            tags: null
//        }
    },

    get_objects:function(req, filters, sorts, limit, offset, callback)
    {
        var user_id = req.user ? req.user._id : null;
        async.waterfall([
            function(cbk){
                models.Cycle.findById(req.query.cycle_id)
                .select({'discussions': 1})
                .populate('discussions.discussion', {'_id': 1,'title': 1})
                .exec(cbk);
            },

            function(cycle, cbk){
                if(!cycle){
                    cbk(null, null);
                }else{
                    var discussions = _.map(cycle.discussions, function(discussion){return discussion.discussion});

                    getSortedPostsByNumberOfDiscussions(discussions, function(err, posts){
                        if(err)
                            cbk(err);
                        else{
                            _.each(posts, function(post){
                                if(post.creator_id)
                                    post.creator_id._doc.avatar_url = post.creator_id.avatar_url()
                            });
                            var json_posts = JSON.parse(JSON.stringify(posts));

                            putIsFollowerAndVoteBallanceOnEachPost(user_id, json_posts, function(err, json_posts){
                                cbk(err, json_posts);
                            })
                        }
                    })
                }
            }
        ], function(err, posts){

            callback(err, {meta:{total_count: posts ? posts.length : 0}, objects: posts});
        })
    }
});


function getSortedPostsByNumberOfDiscussions(discussions, callback)
{
    if (!discussions){
        console.error('cycle has no discussions!!!')
        callback(null, null);
    }else{
        switch (discussions.length){
            case null:
                callback(null, null);
                break;
            case 0:
                callback(null, null);
                break;
            case 1:
                if(!discussions[0]) {
                    callback(null, null);
                    break;
                }
                models.Post.find({discussion_id: discussions[0]._id})
                    .sort({popularity:'descending'})
                    .select({
                        '_id':1,
                        'creator_id':1,
                        'total_votes':1,
                        'votes_for':1,
                        'votes_against':1,
                        'discussion_id':1,
                        'text':1
                    })
                    .populate('creator_id', {
                        '_id':1,
                        'first_name':1,
                        'last_name':1,
                        'avatar': 1,
                        'facbook_id': 1,
                        'avatar_url':1,
                        'score':1,
                        'num_of_proxies_i_represent':1
                    })
                    .limit(3)
                    .exec(function(err, posts){
                        if(posts.length)
                            posts[0]._doc.discussion_title = discussions[0].title;

                        callback(err, posts);
                    })

                break;


            case 2:

                async.parallel([
                    function(cbk){
                        models.Post.find({discussion_id: discussions[0]._id})
                            .sort({popularity:'descending'})
                            .select({
                                '_id':1,
                                'creator_id':1,
                                'total_votes':1,
                                'votes_for':1,
                                'votes_against':1,
                                'discussion_id':1,
                                'text':1
                            })
                            .populate('creator_id', {
                                '_id':1,
                                'first_name':1,
                                'last_name':1,
                                'avatar_url':1,
                                'score':1,
                                'num_of_proxies_i_represent':1
                            })
                            .limit(2)
                            .exec(function(err, posts){
                                if(posts.length)
                                    posts[0]._doc.discussion_title = discussions[0].title;
                                cbk(err, posts);
                            })
                    },

                    function(cbk){
                        models.Post.find({discussion_id: discussions[1]._id})
                            .sort({'popularity': 'descending'})
                            .select({
                                '_id':1,
                                'creator_id':1,
                                'total_votes':1,
                                'votes_for':1,
                                'votes_against':1,
                                'discussion_id':1,
                                'text':1
                            })
                            .populate('creator_id', {
                                '_id':1,
                                'first_name':1,
                                'last_name':1,
                                'avatar_url':1,
                                'score':1,
                                'num_of_proxies_i_represent':1
                            })
                            .limit(1)
                            .exec(function(err, posts){
                                if(posts.length)
                                    posts[0]._doc.discussion_title = discussions[1].title;
                                cbk(err, posts);
                            })
                    }
                ], function(err, args){
                    var posts

                    if(args)
                        posts = _.union.apply(_,args);

                    callback(err, posts);
                })
                break;
            case 3:

                async.parallel([
                    function(cbk){
                        models.Post.find({discussion_id: discussions[0]._id})
                            .sort({popularity: 'descending'})
                            .select({
                                '_id':1,
                                'creator_id':1,
                                'total_votes':1,
                                'votes_for':1,
                                'votes_against':1,
                                'discussion_id':1,
                                'text':1
                            })
                            .populate('creator_id', {
                                '_id':1,
                                'first_name':1,
                                'last_name':1,
                                'avatar': 1,
                                'facebook_id': 1,
                                'avatar_url':1,
                                'score':1,
                                'num_of_proxies_i_represent':1
                            })
                            .limit(1)
                            .exec(function(err, posts){
                                if(posts.length)
                                    posts[0]._doc.discuusion_title = discussions[0].title;
                                cbk(err, posts);
                            })
                    },

                    function(cbk){
                        models.Post.find({discussion_id: discussions[1]._id})
                            .sort({popularity: 'descending'})
                            .select({
                                '_id':1,
                                'creator_id':1,
                                'total_votes':1,
                                'votes_for':1,
                                'votes_against':1,
                                'discussion_id':1,
                                'text':1
                            })
                            .populate('creator_id', {
                                '_id':1,
                                'first_name':1,
                                'last_name':1,
                                'avatar': 1,
                                'facebook_id': 1,
                                'score':1,
                                'num_of_proxies_i_represent':1
                            })
                            .limit(1)
                            .exec(function(err, posts){
                                if(posts.length)
                                    posts[0].discuusion_title = discussions[1].title;
                                cbk(err, posts);
                            })
                    },

                    function(cbk){
                        models.Post.find({discussion_id: discussions[2]._id})
                            .sort({popularity: 'descending'})
                            .select({
                                '_id':1,
                                'creator_id':1,
                                'total_votes':1,
                                'votes_for':1,
                                'votes_against':1,
                                'discussion_id':1,
                                'text':1
                            })
                            .populate('creator_id', {
                                '_id':1,
                                'first_name':1,
                                'last_name':1,
                                'avatar': 1,
                                'facebook_id': 1,
                                'score':1,
                                'num_of_proxies_i_represent':1
                            })
                            .limit(1)
                            .exec(function(err, posts){
                                if(posts.length)
                                    posts[0].discuusion_title = discussions[2].title;
                                cbk(err, posts);
                            })
                    }
                ], function(err, args){
                    var posts;

                    if(args)
                        posts = _.union.apply(_,args);
                    callback(err, posts);
                })
                break;
            default:
                callback({message: "demasiado discusiones en eso ciculo", code: 404});
        }
    }

}

function putIsFollowerAndVoteBallanceOnEachPost(user_id, posts, callback){

        if(user_id && posts){
            async.waterfall([
                function(cbk){
                    models.User.findById(user_id, cbk);
                },

                function(user_obj, cbk){

                    var proxies = user_obj.proxy;

                    async.forEach(posts, function(post, itr_cbk){
                        //update each post creator if he is a follower or not
                        var flag = false;

                        var proxy = _.find(proxies, function(proxy){
                            if(!post.creator_id)
                                return null;
                            else
                                return proxy.user_id + "" == post.creator_id._id + ""});
                        if(proxy)
                            post.mandates_curr_user_gave_creator = proxy.number_of_tokens;
                        if(post.creator_id)
                            flag =  _.any(post.creator_id.followers, function(follower){return follower.follower_id + "" == user_id + ""});
                        post.is_user_follower = flag;

                        //update each post creator with his vote balance
                        models.Vote.findOne({user_id: user_id, post_id: post._id}, function(err, vote){
                            post.voter_balance = vote ? (vote.ballance || 0) : 0;
                            itr_cbk(err);
                        })
                    }, function(err, obj){
                        cbk(err, posts);
                    });
                }
            ], function(err, results){
                callback(err, posts);
            })
        }else{
            _.each(posts, function(post){ post.is_user_follower = false; })
             callback(null, posts);
        }
    }