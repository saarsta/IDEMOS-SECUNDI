/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 07/02/12
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

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
        discussions: [{type: ObjectId, ref: 'Discussion'}],//this is only relevant when cycle is on, so if there is
        //a cycle schema i might change it
        password: String,
        md5: String,
        tokens: {type: Number, 'default': 5}
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
        tags :[String]
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
        is_cycle:{type:Boolean,'default':false},
        tags: [String],
        users: [{type: ObjectId, ref: 'User'}],
        is_visible:{type:Boolean,'default':true},
        is_published:{type:Boolean,'default':false},
        grade: Number,
        evaluate_counter: {type: Number, 'default': 1},
        grade_sum: {type: Number, 'default': 0}
    },

    Post: {
        discussion_id: {type: ObjectId, ref: 'Discussion', index: true,  required:true},
        creator_id: {type: ObjectId, ref: 'User'},
        first_name: String,
        last_name: String,
        username: String,
        text: String,
        creation_date:{type:Date,'default':Date.now},
        tokens: {type: Number, 'default': 0}
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
    }
};
/*,

//  ChangeSuggestions: new Schema({})
    //Cycle
    //Peula
     */
//};


var Models = module.exports = {
    User: mongoose.model("User", new Schema(Schemas.User)),
    InformationItem:mongoose.model('InformationItem',new Schema(Schemas.InformationItem)),
    Subject:mongoose.model('Subject', new Schema(Schemas.Subject)),
    Discussion: mongoose.model('Discussion', new Schema(Schemas.Discussion)),
    Post: mongoose.model('Post', new Schema(Schemas.Post)),
    Vote: mongoose.model('Vote', new Schema(Schemas.Vote)),
    Grade: mongoose.model('Grade', new Schema(Schemas.Grade)),
    Schemas:Schemas
};
