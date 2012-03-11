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
    form_fields = require('./node-forms/fields');

/*, function(err){
 if (err){
 console.log(err);
 throw err;
 }

 );*/

var MinLengthValidator = function(min)
{
    return [function(value) { return value && value.length >= min; },'Name must contain at least ' + min + ' letters'];
};

var RegexValidator = function(regex)
{
    return [function(value) { return value && regex.exec(value)},'Value is not at the correct pattern'];
};

var EmailValidator = RegexValidator(/[^@]+@[^@]+/);
var TestEmailValidator = RegexValidator(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/);



var Schemas  = exports.Schemas = {
    User: {
        username:String,
        identity_provider: {type: String, "enum": ['facebook', 'register']},
        facebook_id: String,
        access_token: String,
        first_name: {type:String, required:true,validate:MinLengthValidator(2)},
        last_name: {type:String, required:true,validate:MinLengthValidator(2)},
        email: {type:String, required:true,validate:TestEmailValidator},
        gender: {type: String, "enum": ['male', 'female']},
        age: {type: Number, min: 0},
        discussions: [{type: ObjectId, ref: 'Discussion'}],
        actions: [{type: Schema.ObjectId, ref: 'Action', index: true}],
        password: String,
        md5: String,
        tokens: {type: Number, 'default': 5},
        gamification:{}
    },

    InformationItem: {
        subject_id:{type:[ObjectId],ref:'Subject',index:true,required:true},
        title: {type: String, "enum": ['test', 'statistics', 'infographic', 'graph']},
        text_field: String,
        image_field: {url:String, caption: String, type: {type: String},size: {type: Number, min: 0},
            width: {type: Number, min: 0}, height: {type: Number, min: 0}, data: String},
        tags: {type: [String], index: true},
        users: {type: [ObjectId], ref: 'User'},
        discussions: {type: [ObjectId], ref: 'Discussion', index: true},
        is_visible:{type:Boolean,'default':true},
        creation_date:{type:Date,'default':Date.now},
        is_hot:{type:Boolean,'default':false}
    },

    Subject: {
        name: String,
        image_field:{url:String, caption: String, type: {type: String},size: {type: Number, min: 0},
            width: {type: Number, min: 0}, height: {type: Number, min: 0}, data: String},
        tags :[String],
        file:form_fields.FileField.Schema
//        is_hot:{type:Boolean,'default':false}
    },

    Discussion: {
        subject_id: [{type: ObjectId, ref: 'Subject', index: true, required:true}],
        subject_name: String,
        creator_id: {type: ObjectId, ref: 'User'},
        first_name: String,
        last_name: String,
//      tag_id: String,
        title: String,
        vision_text: String,
        vision_text_history: [String],
        is_cycle:{type:Boolean,'default':false},
        tags: [String],
        users: [{type: ObjectId, ref: 'User'}],
        followers_count: {type: Number, 'default': 0},
        is_visible:{type:Boolean,'default':true},
        is_published:{type:Boolean,'default':false},
        grade: Number,
        evaluate_counter: {type: Number, 'default': 0},
        grade_sum: {type: Number, 'default': 0}
//        vision_changes: [{log_by_time: [{start:Number,end:Number,text:String}]}]

    },
    PostOrSuggestion:{
        discussion_id: {type: Schema.ObjectId, ref: 'Discussion', index: true,  required:true},
        creator_id: {type: Schema.ObjectId, ref: 'User'},
        first_name: String,
        last_name: String,
        username: String,
        creation_date:{type:Date,'default':Date.now},
        tokens: {type: Number, 'default': 0},
//        is_change_suggestion: {type:Boolean,'default':false},
        post_price: {type: Number, 'default': 0}//how many tokens for creating post
    },

    Vote: {
        user_id: {type: ObjectId, ref: 'User', index: true, required: true},
        post_id: {type: ObjectId, ref: 'Post', index: true, required: true},
        tokens: Number,
        method: {type: String, "enum": ['add', 'remove']},
        creation_date:{type:Date,'default':Date.now}
    },

    Grade: {
        user_id: {type: ObjectId, ref: 'User', index: true, required: true},
        discussion_id: {type: ObjectId, ref: 'Discussion', index: true, required: true},
        evaluation_grade: {type: Number, min: 0, max: 10},
        creation_date: {type:Date,'default':Date.now}
    },

    ActionResource: {
        category: {type: String, "enum": [""]},
        name: String
    },

    Action: {
        creator_id: {type: Schema.ObjectId, ref: 'User', index: true, required: true},
        title: String,
        description: String,
        category: String,
        action_resources: [{resource:{type: ObjectId, ref: 'ActionResource'}, amount: Number}],
        users: [{type: ObjectId, ref: 'User'}],
        execution_date: {type:Date},
        creation_date:{type:Date,'default':Date.now},
        required_participants: {type: Number, 'default': 0},
        is_aproved: {type:Boolean,'default':false}
    },

    Post :{
        text: String,
        //is_change_suggestion: {type:Boolean,'default':false},
        is_comment_on_vision: {type:Boolean,'default':false},
        is_comment_on_action: {type:Boolean,'default':false},
        ref_to_post_id: {type: Schema.ObjectId, ref: 'Post', index: true}
    },

    Suggestion: {
        //is_change_suggestion: {type:Boolean,'default':true},
        parts:[{start:Number,end:Number,text:String}],
        is_aproved: {type:Boolean,'default':false}
    }
};

//Schemas.Post = clone_extend(Schemas.PostOrSuggestion,{
//text: String,
//is_change_suggestion: {type:Boolean,'default':false},
//is_comment_on_vision: {type:Boolean,'default':false},
//ref_to_post_id: {type: Schema.ObjectId, ref: 'Post', index: true}
//});
//
////maybe i need to put it outside the schema
//Schemas.Suggestion = clone_extend(Schemas.PostOrSuggestion,{
//is_change_suggestion: {type:Boolean,'default':true},
//parts:[{start:Number,end:Number,text:String}]
//});

/*,

 //  ChangeSuggestions: new Schema({})
 //Cycle
 //Peula
 */
//};


function extend_model(name,base_schema,schema,collection)
{
    for(var key in base_schema)
        if(!schema[key]) schema[key] = base_schema[key];
    schema._type = {type:String,'default':name};
    var model = mongoose.model(name,new Schema(schema),collection);
    var old_find = model.find;
    model.find = function()
    {
        var params = arguments.length ? arguments[0] : {};
        params['_type'] = name;
        if(arguments.length)
            arguments[0] = params;
        else
            arguments = [params];
        return old_find.apply(this,arguments);
    };
    return model;
}

var Models = module.exports = {
    User: mongoose.model("User", new Schema(Schemas.User)),
    InformationItem:mongoose.model('InformationItem',new Schema(Schemas.InformationItem)),
    Subject:mongoose.model('Subject', new Schema(Schemas.Subject)),
    Discussion: mongoose.model('Discussion', new Schema(Schemas.Discussion)),
    Post: extend_model('Post',Schemas.PostOrSuggestion,Schemas.Post,'posts'),
    Suggestion: extend_model('Suggestion',Schemas.PostOrSuggestion,Schemas.Suggestion,'posts'),
    PostOrSuggestion : mongoose.model('PostOrSuggestion',new Schema(Schemas.PostOrSuggestion),'posts'),
    Vote: mongoose.model('Vote', new Schema(Schemas.Vote)),
    Grade: mongoose.model('Grade', new Schema(Schemas.Grade)),
    Action: mongoose.model('Action', new Schema(Schema.Action)),
    ActionResource: mongoose.model('ActionResource', new Schema(Schemas.ActionResource)),
    Schemas:Schemas
};

//var old_post_find = Models.Post.find;
//Models.Post.find = function()
//{
//    var params = arguments.length ? arguments[0] : {};
//    params['is_change_suggestion'] = false;
//    if(arguments.length)
//        arguments[0] = params;
//    else
//        arguments = [params];
//    return old_post_find.apply(this,arguments);
//};
//
//var old_suggestion_find = Models.Suggestion.find;
//Models.Suggestion.find = function()
//{
//    var params = arguments.length ? arguments[0] : {};
//    params['is_change_suggestion'] = true;
//    if(arguments.length)
//        arguments[0] = params;
//    else
//        arguments = [params];
//    return old_post_find.apply(this,arguments);
//}

