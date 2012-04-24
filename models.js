/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 07/02/12
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    mongoose_types = require('j-forms').types,
    form_fields = require('j-forms').fields;
mongoose_types.loadTypes(mongoose);

var MinLengthValidator = function (min) {
    return [function (value) {
        return value && value.length >= min;
    }, 'Name must contain at least ' + min + ' letters'];
};

var RegexValidator = function (regex) {
    return [function (value) {
        return value && regex.exec(value)
    }, 'Value is not at the correct pattern'];
};

var EmailValidator = RegexValidator(/[^@]+@[^@]+/);
var TestEmailValidator = RegexValidator(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/);

var ActionResource = {
        category: {type: ObjectId, ref: 'Category'},
        name:String
};

var tag_suggestions =  {
    tag_name: String,
    tag_offers: {type:[ObjectId], ref:'User',editable:false}
};

/*
var Reply = {
    author: {type:ObjectId, ref:'User', index:true, required:true},
    text: String,
    votes: [{user_id: {type:ObjectId, ref:'User', index:true, required:true}}],
    replies: [Reply]
}
*/

/*var CommentVote = {
    comment_id:{type:ObjectId, ref:'Comment', index:true, required:true},
    user_id:{type:ObjectId, ref:'User', index:true, required:true},
    time: {type:Date, 'default':Date.now}
}

var CommentOrReply = {
    article_id :{type:ObjectId, ref:'Article', index:true, required:true},
    author :{type:ObjectId, ref:'User', index:true, required:true},
    text: String,
    votes: [CommentVote],
    time: {type:Date, 'default':Date.now},
    status: [{type:String, "enum":['comment', 'reply'], 'default': 'comment'}],
    reply_ref: {type:ObjectId, ref:'CommentOrReply', index:true}
}*/
var CommentVote = new Schema({
    user_id:{type:ObjectId, ref:'User', index:true, required:true},
    time: {type:Date, 'default':Date.now}
});

var Reply = new Schema({
    author: {type:ObjectId, ref:'User', index:true, required:true},
    first_name: String,
    last_name: String,
    text: String,
    time: {type:Date, 'default':Date.now},
    votes: [CommentVote],
    replies: [Reply]
});

var Comment = new Schema({
//    article_id :{type:ObjectId, ref:'Article', index:true, required:true},
    author :{type:ObjectId, ref:'User', index:true, required:true},
    text: String,
    votes: [CommentVote],
    time: {type:Date, 'default':Date.now},
//        status: [{type:String, "enum":['comment', 'reply'], 'default': 'comment'}],
    replies: {type:[Reply], editable:false}
});



var Schemas = exports.Schemas = {
    User: new Schema({
        username:String,
        identity_provider:{type:String, "enum":['facebook', 'register']},
        facebook_id:String,
        access_token:String,
        first_name:{type:String, required:true, validate:MinLengthValidator(2)},
        last_name:{type:String, required:true, validate:MinLengthValidator(2)},
        email:{type:String, required:true, validate:TestEmailValidator},
        gender:{type:String, "enum":['male', 'female']},
        age:{type:Number, min:0},
        occupation: String,
        biography: String,
        discussions:[
            {type:ObjectId, ref:'Discussion'}
        ],
        cycles:[
            {type:ObjectId, ref:'Cycle'}
        ],
        actions:[
            {type:Schema.ObjectId, ref:'Action', index:true}
        ],
        password:String,
        tokens:{type:Number, 'default':9},
        gamification:Schema.Types.Mixed,
        updates: Schema.Types.Mixed,
        //score:{type:Number, 'default':0},
        decoration_status:{type:String, "enum":['a', 'b', 'c']},
        invited_by: {type: ObjectId, ref: 'User'},
        has_been_invited : {type: Boolean, 'default': false},
        tokens_achivements_to_user_who_invited_me: Schema.Types.Mixed,
        num_of_extra_tokens: {type:Number, 'default': 0, max:6},// i might change it to gamification.bonus.
        number_of_days_of_spending_all_tokens: {type: Number, 'default' : 0},
        blog_popularity_counter: {type: Number, 'default': 0},
        avatar : mongoose_types.File
    }),

    InformationItem:{
        title: {type: String, required: true},
        subject_id:{type:[ObjectId], ref:'Subject', index:true, required:true},
        category:{type:String, "enum":['test', 'statistics', 'infographic', 'graph'], required:true},
        text_field:{type:mongoose_types.Text},
        text_field_preview:{type:mongoose_types.Html},
        image_field: mongoose_types.File,
        image_field_preview: mongoose_types.File,
        tags:{type:[String], index:true},
        users:{type:[ObjectId], ref:'User',editable:false},
        discussions:{type:[ObjectId], ref:'Discussion', index:true,editable:false},
        is_visible:{type:Boolean, 'default':true},
        creation_date:{type:Date, 'default':Date.now,editable:false},
        is_hot_object:{type:Boolean, 'default':false},
        is_hot_info_item: {type:Boolean, 'default':false},
        tag_suggestions: [tag_suggestions],
        like_counter: {type: Number, 'default': 0, editable: false},
        //this two fields are for user suggestion of InformationItem, when admin create this it will remain false
        created_by: {creator_id:{type: ObjectId, ref: 'User', editable: false}, did_user_created_this_item: {type: Boolean, 'default': false, editable: false}},
        status: {type: String, "enum": ['approved', 'denied', 'waiting']},
        gamification: {rewarded_creator_for_high_liked: {type: String, 'default': false, editable: false},
                       rewarded_creator_for_approval: {type: String, 'default': false, editable: false}},
        gui_order:{type:Number,'default':9999999,editable:false}
    },

    UpdateItem:{
        title: {type: String, required: true},
        text_field:{type:mongoose_types.Text},
        text_field_preview:{type:mongoose_types.Html},
        image_field: mongoose_types.File,
        image_field_preview: mongoose_types.File,
        tags:{type:[String], index:true},
        cycles:{type:[ObjectId], ref:'Cycles', index:true, editable:false},
        is_visible:{type:Boolean, 'default':true},

        creation_date:{type:Date, 'default':Date.now,editable:false},
        tag_suggestions: [tag_suggestions],
        gui_order:{type:Number,'default':9999999,editable:false}
    },

    Subject:{
        name:{type:String,required:true},
        description: {type:mongoose_types.Text,required:true},
        text_field_preview:{type:mongoose_types.Text},
        image_field:mongoose_types.File,
        tags:[String],
        gui_order: {type:Number,'default':9999999,editable:false},
        is_hot_object: {type:Boolean,'default':false}
    },

    Discussion:{
        title:{type:String, required:true},
        text_field:{type:mongoose_types.Html},
        text_field_preview:{type:mongoose_types.Html},
        image_field: mongoose_types.File,
        image_field_preview: mongoose_types.File,
        subject_id:[
            {type:ObjectId, ref:'Subject', index:true, required:true}
        ],
        subject_name:String,
        creation_date:{type:Date, 'default':Date.now},
        creator_id:{type:ObjectId, ref:'User'},
        first_name:{type:String,editable:false},
        last_name:{type:String,editable:false},
        vision_text_preview: String,//2-3 lines of the vision_text
        vision_text:String,
        vision_text_history:{type:[String],editable:false},
        num_of_approved_change_suggestions: {type: Number, 'default': 0},
        is_hot_object: {type:Boolean,'default':false},
        is_cycle:{type:Boolean, 'default':false,editable:false},
        tags:[String],
        //for my uru
        users:[
            new Schema({user_id:{type:ObjectId, ref:'User'}, join_date: {type:Date, 'default':Date.now}})
        ],

        followers_count:{type:Number, 'default':0},
        is_visible:{type:Boolean, 'default':true},
        is_published:{type:Boolean, 'default':false},
//        popular_comments: [{type: ObjectId, ref: 'Post', index: true}],
        grade:Number,
        evaluate_counter:{type:Number, 'default':0},
        grade_sum:{type:Number, 'default':0},
        gamification: {has_rewarded_creator_of_turning_to_cycle: {type: Boolean, 'default': false},
                        has_rewarded_creator_for_high_grading_of_min_graders: {type: String, 'default': false}}
    },

    Cycle: new Schema({
        creation_date: {type:Date, 'default':Date.now},



        due_date : {type:Date, 'default':function(){ return Date.now() + 1000*3600*24*30;  }},

        subject:[{
            id:{type:ObjectId, ref:'Subject', index:true, required:true},
            name: {type:String, editable:false}
            }
        ],
        title: {type:String, required:true},
        text_field:{type:mongoose_types.Html},
        text_field_preview:{type:mongoose_types.Html},
        image_field: mongoose_types.File,
        image_field_preview: mongoose_types.File,
        tags:[String],
        discussions:[
            {type:ObjectId, ref:'Discussion'}
        ],
        document: String,
        is_hot_object: {type:Boolean,'default':false},
        followers_count: {type: Number, 'default':0},
        num_of_comments: {type: Number, 'default':0},

        upcoming_action: {type: ObjectId, ref: 'Action', index: true},
        num_upcoming_actions: {type: Number, 'default':0},
        //users that conected somehow to the cycle for my uru
        users:[
            new Schema({user_id:{type:ObjectId, ref:'User'}, join_date: {type:Date, 'default':Date.now}})
        ],

        upcoming_action: {type: ObjectId, ref: 'Action', index: true}

    }, {strict: true}),

    PostOrSuggestion:{
        creator_id:{type:Schema.ObjectId, ref:'User'},
        first_name:{type:String,editable:false},
        last_name:{type:String, editable:false },
        username:{type:String,editable:false},
        avatar : {type:mongoose_types.File, editable:false},
        creation_date:{type:Date, 'default':Date.now,editable:false},
        tokens:{type:Number, 'default':0, index: true},
        post_price:{type:Number, 'default':0},//how many tokens for creating post
        popularity: {type:Number, 'default':0},
        gamification: {high_number_of_tokens_bonus : {type: Boolean, 'default': false}}
    },

    Vote:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        post_id:{type:ObjectId, ref:'Post', index:true, required:true},
//        tokens:Number,
        method:{type:String, "enum":['add', 'remove']},
        creation_date:{type:Date, 'default':Date.now}
    },

    Grade:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        discussion_id:{type:ObjectId, ref:'Discussion', index:true, required:true},
        evaluation_grade:{type:Number, min:0, max:10},
        creation_date:{type:Date, 'default':Date.now}
    },

    GradeAction:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        action_id:{type:ObjectId, ref:'Action', index:true, required:true},
        evaluation_grade:{type:Number, min:0, max:10},
        creation_date:{type:Date, 'default':Date.now}
    },

    Like:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        info_item_id:{type:ObjectId, ref:'Post', index:true, required:true},
        creation_date:{type:Date, 'default':Date.now}
    },

    Join:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        action_creator_id:{type:ObjectId, ref:'User', index:true, required:true},
        action_id:{type:ObjectId, ref:'Action', index:true, required:true},
        creation_date:{type:Date, 'default':Date.now}
    },

    Category: {
        name: {type:String}
    },

    ActionResource:ActionResource,

    ActionSuggestion: {
        creator_id: {type:Schema.ObjectId, ref:'User', index:true, required:true},
        cycle_id: {type: ObjectId, ref: 'Cycle'},
        first_name: String,
        last_name: String,
        creation_date:{type:Date, 'default':Date.now},
        action_ref: {type: ObjectId, ref:'Action', required: true},
        change: {},
        is_approved: {type: Boolean, 'default': false}
    },

    ResourceObligation: {
        user_id: {type:Schema.ObjectId, ref:'User', index:true, required:true},
        first_name: String,
        last_name: String,
        action_id: {type:ObjectId, ref:'Action', index:true, required:true},
        action_resources:[
            {resource: ActionResource, amount:Number}
        ]
    },

    Action:{
        title:{type:String, required:true},
        text_field:{type:mongoose_types.Html},
        text_field_preview:{type:mongoose_types.Html},
        image_field: mongoose_types.File,
        image_field_preview: mongoose_types.File,
        type: String, //only admin can change this
        description:String,
        creator_id:{type:ObjectId, ref:'User', index:true, required:true},
        first_name: String,
        last_name: String,
        cycle_id:{type:ObjectId, ref:'Cycle', index:true, required:true},
        action_resources:[
            {resource: ActionResource, amount:Number, left_to_bring: Number}
        ],

//        popular_actions: [{type: ObjectId, ref: 'Action', index: true}],


        //users that conected somehow to the action
        users:[
            new Schema({user_id:{type:ObjectId, ref:'User'}, join_date: {type:Date, 'default':Date.now}})
        ],
        execution_date:{type:Date},
        creation_date:{type:Date, 'default':Date.now},
        required_participants:{type:Number, 'default':0},
        //users that are going to be in the action
        going_users: [
            {type:ObjectId, ref:'User'}
        ],
        num_of_going: {type: Number, 'default': 0},
        tokens:{type:Number, 'default':0},
        is_approved:{type:Boolean, 'default':false},
        is_hot_object: {type:Boolean,'default':false},
        gamification: {approved_to_cycle :{type: Boolean, 'default': false}},
        location:mongoose_types.GeoPoint,
        grade:{type:Number, 'default':0},
        evaluate_counter:{type:Number, 'default':0},
        grade_sum:{type:Number, 'default':0}
    },

    Post:{
        discussion_id:{type:Schema.ObjectId, ref:'Discussion', index:true, required:true},
        text:String,
        votes_for: {type: Number, 'default': 0},
        votes_against: {type: Number, 'default': 0},
        total_votes: {type: Number, 'default': 0},
        //is_change_suggestion: {type:Boolean,'default':false},

        is_comment_on_vision:{type:Boolean, 'default':false},
        is_comment_on_action:{type:Boolean, 'default':false},
        ref_to_post_id:{type:Schema.ObjectId, ref:'Post', index:true}
    },

    PostAction:{
        action_id:{type:Schema.ObjectId, ref:'Action', index:true, required:true},
        text:String,
        is_comment_on_vision:{type:Boolean, 'default':false},
        ref_to_post_id:{type:Schema.ObjectId, ref:'Post', index:true}
    },

    Suggestion:{
        discussion_id:{type:Schema.ObjectId, ref:'Discussion', index:true, required:true},

        //is_change_suggestion: {type:Boolean,'default':true},
        parts:[
            {start:Number, end:Number, text:String}
        ],
        is_approved:{type:Boolean, 'default':false}
    },

    CommentVote: CommentVote,

    Reply: Reply,

    Comment : Comment,

    Article: new Schema({
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        first_name: {type:String, editable:false},
        last_name: {type:String,editable:false},
        avatar : {type:String,editable:false},
        title : {type:String, required:true},
        text : {type:mongoose_types.Text, required:true},
        tags: [String],
        time: {type: Date, 'default': Date.now, editable:false},
        popolarity_counter: {type: Number, 'default': 0},
        comments : [Comment]
    } ,{strict: true}),

    Notifications: {
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        title: String,
        description: String,
        system_type: {},
        link: {},
        seen: {},
        date: {}
    },

    Tag : {
        tag:{type:String, unique:true},
        popularity:{type:Number,'default':0,select:false}
    }
};

Schemas.Cycle.pre("save", function(next){

    var self = this;

    var iterator = function(subject, itr_cbk){
        Models.Subject.findById(subject.id, function(err, result){
            if(err){
               itr_cbk(err, null);
            }else{
                subject.name = result.name;
                itr_cbk(null, result);
            }
        })
    }

    async.forEach(self.subject, iterator, function(err, result){
        if(!err){
            self.save(function(err, result){

            })
            next();
        }
    })
});

Schemas.User.methods.toString = function()
{
    return this.first_name + ' ' + this.last_name;
};

Schemas.User.methods.avatar_url = function()
{
    if(this.avatar && this.avatar.url)
        return this.avatar.url;
    else
        return 'graph.facebook.com/' + this.facebook_id + '/picture/?type=large';
};

Schemas.Article.pre('save',function(next)
{
    var self = this;
    if(!this.first_name && !this.last_name && this.user_id)
    {
        Models.User.findById(this.user_id,function(err,user)
        {
            if(!err)
            {
                self.first_name = user.first_name;
                self.last_name = user.last_name;
                self.avatar = user.avatar_url();
            }
            next();
        });
    }
    next();
});

function extend_model(name, base_schema, schema, collection) {
    for (var key in base_schema)
        if (!schema[key]) schema[key] = base_schema[key];
    schema._type = {type:String, 'default':name,editable:false};
    var model = mongoose.model(name, new Schema(schema), collection);
    var old_find = model.find;
    model.find = function () {
        var params = arguments.length ? arguments[0] : {};
        params['_type'] = name;
        if (arguments.length)
            arguments[0] = params;
        else
            arguments = [params];
        return old_find.apply(this, arguments);
    };
    return model;
}

var Models = module.exports = {
    User:mongoose.model("User",Schemas.User),
    InformationItem:mongoose.model('InformationItem', new Schema(Schemas.InformationItem, {strict: true})),
    Subject:mongoose.model('Subject', new Schema(Schemas.Subject, {strict: true})),
    Discussion:mongoose.model('Discussion', new Schema(Schemas.Discussion, {strict: true})),
    Post:extend_model('Post', Schemas.PostOrSuggestion, Schemas.Post, 'posts'),
    PostAction:extend_model('PostAction', Schemas.PostOrSuggestion, Schemas.PostAction, 'posts'),
    Suggestion:extend_model('Suggestion', Schemas.PostOrSuggestion, Schemas.Suggestion, 'posts'),
    PostOrSuggestion:mongoose.model('PostOrSuggestion', new Schema(Schemas.PostOrSuggestion, {strict: true}), 'posts'),
    Vote:mongoose.model('Vote', new Schema(Schemas.Vote, {strict: true})),
    Like:mongoose.model('Like', new Schema(Schemas.Like, {strict: true})),
    Grade:mongoose.model('Grade', new Schema(Schemas.Grade, {strict: true})),
    GradeAction:mongoose.model('GradeAction', new Schema(Schemas.GradeAction, {strict: true})),
    Join:mongoose.model('Join', new Schema(Schemas.Join, {strict: true})),
//    CommentVote:mongoose.model('CommentVote', new Schema(Schemas.CommentVote, {strict: true})),
//    Comment:mongoose.model('Comment', new Schema(Schemas.Comment, {strinct: true})),
    Article:mongoose.model('Article', Schemas.Article),
    Cycle:mongoose.model('Cycle', Schemas.Cycle),
    Category:mongoose.model('Category', new Schema(Schemas.Category, {strict: true})),
    Action:mongoose.model('Action', new Schema(Schemas.Action, {strict: true})),
    ActionResource:mongoose.model('ActionResource', new Schema(Schemas.ActionResource, {strict: true})),
    Tag: mongoose.model('Tag', new Schema(Schemas.Tag, {strict: true})),
    ResourceObligation: mongoose.model('ResourceObligation', new Schema(Schemas.ResourceObligation, {strict: true})),
    Schemas:Schemas
};


