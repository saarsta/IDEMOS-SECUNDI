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
        this.fields = {
            _id: null,
            title: null,
            tooltip_or_title:null,
            type: null,
            text_field_preview: null,
            image_field_preview: null,
            tags: null
        }
    },

    get_objects:function(req, filters, sorts, limit, offset, callback)
    {
        async.waterfall([
            function(cbk){
                models.Cycle.findById(req.body.cycle_id)
                .select(['discussions'])
                .populate('discussions', ['title'])
                .exec(cbk);
            },

            function(cycle, cbk){
                if(!cycle){
                    cbk(null, null);
                }else{

                    getSortedPostsByNumberOfDiscussions(cycle.discussions, function(err, posts){
                        cbk(err, posts);
                    })
                }
            }
        ], function(err, posts){
            callback(err, {meta:{total_count: posts.length}, objects: posts});
        })
    }
});


function getSortedPostsByNumberOfDiscussions(discussions, callback)
{
    switch (discussions.length){
        case null:
            callback(null, null);
            break;
        case 0:
            callback(null, null);
            break;
        case 1:
            models.Post.find({discussion_id: discussions[0]._id})
            .sort('popularity', 'descending')
            .limit(3)
            .exec(function(err, posts){
                if(posts)
                    posts[0].discussion_name = discussions[0].title;
                callback(err, posts);

            })

            break;

        case 2:

            async.parallel([
                function(cbk){
                    models.Post.find({discussion_id: discussions[0]._id})
                        .sort('popularity', 'descending')
                        .limit(2)
                        .exec(function(err, posts){
                            if(posts)
                                posts[0].discussion_name = discussions[0].title;
                            callback(err, posts);
                        })
                },

                function(cbk){
                    models.Post.find({discussion_id: discussions[1]._id})
                        .sort('popularity', 'descending')
                        .limit(1)
                        .exec(function(err, posts){
                            if(posts)
                                posts[0].discussion_name = discussions[1].title;
                            callback(err, posts);
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
                        .sort('popularity', 'descending')
                        .limit(1)
                        .exec(function(err, posts){
                            if(posts)
                                posts[0].discuusion_title = discussions[0].title;
                            callback(err, posts);
                        })
                },

                function(cbk){
                    models.Post.find({discussion_id: discussions[1]._id})
                        .sort('popularity', 'descending')
                        .limit(1)
                        .exec(function(err, posts){
                            if(posts)
                                posts[0].discuusion_title = discussions[1].title;
                            callback(err, posts);
                        })
                },

                function(cbk){
                    models.Post.find({discussion_id: discussions[2]._id})
                        .sort('popularity', 'descending')
                        .limit(1)
                        .exec(function(err, posts){
                            if(posts)
                                posts[0].discuusion_title = discussions[2].title;
                            callback(err, posts);
                        })
                }
            ], function(err, args){
                var posts

                if(args)
                    posts = _.union.apply(_,args);

                callback(err, posts);
            })
            break;
        default:
            callback({message: "demasiado discusiones en eso ciculo", code: 404});
    }
}