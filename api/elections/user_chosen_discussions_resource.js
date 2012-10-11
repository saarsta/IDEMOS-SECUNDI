var jest = require('jest')
    ,models = require('../../models')
    ,common = require('./../common')
    ,async = require('async')
    ,getUserChosenDiscussions = require('../../deliver/routes/elections/fbimage').getUserChosenDiscussions
    ,_ = require('underscore');

var UserChosenDiscussionsResource = module.exports =  jest.Resource.extend({

    init:function () {
        this._super();
        this.allowed_methods = ['get'];
        this.update_fields = {
            user_id:null
        };
        this.fields = {
            title: null,
            tooltip:null,
//        text_field:{type:mongoose_types.Html},
//        text_field_preview:{type:mongoose_types.Html},
            image_field: null,
            image_field_preview: null,
            subject_id: null,
            subject_name: null,
            system_message: null,
            creation_date: null,
            creator_id: null,
            first_name: null,
            last_name:null,
            text_field_preview: null,//2-3 lines of the vision_text
            text_field: null,
            vision_text_history: null,
            num_of_approved_change_suggestions: null,
            is_hot_object: null,
            is_cycle: null,
            tags: null,
            //users that connected somehow to discussion for my uru
            users: null,

            //followers for my uru
            followers: null,
            view_counter: null,
            followers_count: null,
            is_visible: null,
            is_published: null,
            grade: null,
            evaluate_counter: null,
            grade_sum: null,
            post_counter: null
        }
    },

    get_object:getUserChosenDiscussions
});
