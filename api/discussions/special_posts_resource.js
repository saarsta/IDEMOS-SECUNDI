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
            type: null,
            title: null
        };
    },

    get_objects: function (req, filters, sorts, limit, offset, callback) {
        // getting 4 comments - most popular most cont admin selection and expert opinion
        var special_objects = [];

        models.Post.find({discussion_id: req.query.discussion_id}).sort({votes_for: -1}).populate('creator_id').exec(function(err, data){
            if(data.length < 8) {
                callback(null, {});
                return;
            }
            data[0].type = 'most_pop';
            data[0].title = 'התגובה הפופולרית ביותר';
            special_objects.push(data[0]);

            var most_contr = _.max(data, function(post){
                return (post.total_votes && post.id != special_objects[0].id);
            });

            if (most_contr) {
                most_contr.type = 'most_contr';
                most_contr.title = 'התגובה השנויה במחלוקת';
                special_objects.push(most_contr);
            }

            var editor_choice = _.find(data, function(post){
                return post.is_editor_choice === true;
            })

            if (editor_choice) {
                editor_choice.type = 'editor_choice';
                editor_choice.title = 'בחירת העורך';
                special_objects.push(editor_choice);
            }

            var expert_opinion = _.find(data, function(post){
                return post.is_expert_opinion === true;
            })

            if (expert_opinion) {
                expert_opinion.type = 'expert_opinion';
                expert_opinion.title = 'דעת מומחה';
                special_objects.push(expert_opinion);
            }

            callback(null,{meta:{total_count: special_objects.length}, objects: special_objects});
        })
    }
});

