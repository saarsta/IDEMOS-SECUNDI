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
    mongoose_types = require('./node-forms/mongoose-types'),
    form_fields = require('./node-forms/fields');
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
        tokens:{type:Number, 'default':100000},
        gamification:Schema.Types.Mixed,
        //score:{type:Number, 'default':0},
        decoration_status:{type:String, "enum":['a', 'b', 'c']},
        avatar : mongoose_types.File
    }),

    InformationItem:{
        subject_id:{type:[ObjectId], ref:'Subject', index:true, required:true},
        title:{type:String, "enum":['test', 'statistics', 'infographic', 'graph']},
        text_field:String,
        image_field: mongoose_types.File,
        tags:{type:[String], index:true},
        users:{type:[ObjectId], ref:'User',editable:false},
        discussions:{type:[ObjectId], ref:'Discussion', index:true,editable:false},
        is_visible:{type:Boolean, 'default':true},
        creation_date:{type:Date, 'default':Date.now,editable:false},
        is_hot:{type:Boolean, 'default':false},
        gui_order:{type:Number,'default':9999999,editable:false}
    },

    Subject:{
        name:{ type:String,required:true},
        image_field:mongoose_types.File,
        tags:[String],
        gui_order:{type:Number,'default':9999999,editable:false}
//        is_hot:{type:Boolean,'default':false}
    },

    Discussion:{
        title:{type:String, required:true},
        subject_id:[
            {type:ObjectId, ref:'Subject', index:true, required:true}
        ],
        subject_name:String,
        creator_id:{type:ObjectId, ref:'User'},
        first_name:{type:String,editable:false},
        last_name:{type:String,editable:false},
//      tag_id: String,
        vision_text:String,
        vision_text_history:{type:[String],editable:false},
        is_cycle:{type:Boolean, 'default':false,editable:false},
        tags:[String],
        users:[
            {type:ObjectId, ref:'User'}
        ],
        followers_count:{type:Number, 'default':0},
        is_visible:{type:Boolean, 'default':true},
        is_published:{type:Boolean, 'default':false},
        grade:Number,
        evaluate_counter:{type:Number, 'default':0},
        grade_sum:{type:Number, 'default':0}
    },

    Cycle:{
        title: {type:String, required:true},
        discussions:[
            {type:ObjectId, ref:'Discussion'}
        ],
        document: String,
        followers_count: {type: Number}
    },

    PostOrSuggestion:{
        discussion_id:{type:Schema.ObjectId, ref:'Discussion', index:true, required:true},
        creator_id:{type:Schema.ObjectId, ref:'User'},
        first_name:{type:String,},
        last_name:String,
        username:String,
        creation_date:{type:Date, 'default':Date.now},
        tokens:{type:Number, 'default':0, index: true},
        post_price:{type:Number, 'default':0}//how many tokens for creating post
    },

    Vote:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        post_id:{type:ObjectId, ref:'Post', index:true, required:true},
        tokens:Number,
        method:{type:String, "enum":['add', 'remove']},
        creation_date:{type:Date, 'default':Date.now}
    },

    Grade:{
        user_id:{type:ObjectId, ref:'User', index:true, required:true},
        discussion_id:{type:ObjectId, ref:'Discussion', index:true, required:true},
        evaluation_grade:{type:Number, min:0, max:10},
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

    Action:{
        title:String,
        description:String,
        creator_id:{type:ObjectId, ref:'User', index:true, required:true},
        first_name: String,
        last_name: String,
        cycle_id:{type:ObjectId, ref:'Cycle', index:true, required:true},

        category: {type: ObjectId, ref: 'Category'},

        action_resources:[
            {resource: ActionResource, amount:Number}
        ],
        //users that concected somehow to the action
        users:[
            {type:ObjectId, ref:'User'}
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
        location:mongoose_types.GeoPoint
    },

    Post:{
        text:String,
        //is_change_suggestion: {type:Boolean,'default':false},
        is_comment_on_vision:{type:Boolean, 'default':false},
        is_comment_on_action:{type:Boolean, 'default':false},
        ref_to_post_id:{type:Schema.ObjectId, ref:'Post', index:true}
    },

    Suggestion:{
        //is_change_suggestion: {type:Boolean,'default':true},
        parts:[
            {start:Number, end:Number, text:String}
        ],
        is_approved:{type:Boolean, 'default':false}
    }
};

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

function extend_model(name, base_schema, schema, collection) {
    for (var key in base_schema)
        if (!schema[key]) schema[key] = base_schema[key];
    schema._type = {type:String, 'default':name};
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
    InformationItem:mongoose.model('InformationItem', new Schema(Schemas.InformationItem)),
    Subject:mongoose.model('Subject', new Schema(Schemas.Subject)),
    Discussion:mongoose.model('Discussion', new Schema(Schemas.Discussion)),
    Post:extend_model('Post', Schemas.PostOrSuggestion, Schemas.Post, 'posts'),
    Suggestion:extend_model('Suggestion', Schemas.PostOrSuggestion, Schemas.Suggestion, 'posts'),
    PostOrSuggestion:mongoose.model('PostOrSuggestion', new Schema(Schemas.PostOrSuggestion), 'posts'),
    Vote:mongoose.model('Vote', new Schema(Schemas.Vote)),
    Grade:mongoose.model('Grade', new Schema(Schemas.Grade)),
    Cycle:mongoose.model('Cycle', new Schema(Schemas.Cycle)),
    Category:mongoose.model('Category', new Schema(Schemas.Category)),
    Action:mongoose.model('Action', new Schema(Schemas.Action)),
    ActionResource:mongoose.model('ActionResource', new Schema(Schemas.ActionResource)),
//    Schemas:Schemas
};

