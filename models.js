/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 07/02/12
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */

var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectID;

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

var Schemas = {
    User: new Schema({
        username:String,
        identity_provider: {type: String, "enum": ['facebook', 'register']},
        facebook_id: String,
        access_token: String,
        first_name: {type:String, required:true,validate:MinLengthValidator(2)},
        last_name: {type:String, required:true,validate:MinLengthValidator(2)},
        email: {type:String, required:true,validate:TestEmailValidator},
        gender: {type: String, "enum": ['male', 'female']},
        age: {type: Number, min: 0},
        discussions: [{type: Schema.objectId, ref: 'Discussion'}],//this is only relevant when cycle is on, so if there is
        //a cycle schema i might change it
//        user_name: String,
        password: String,
        md5: String
    }),

    InformationItem: new Schema({
        subject_id: [{type: Schema.objectId, ref: 'Subject', index: true, required:true}],
        title: {type: String, "enum": ['test', 'statistics', 'infographic', 'graph']},
        text_field: String,
        image_field: {url:String, caption: String, type: {type: String},size: {type: Number, min: 0},
            width: {type: Number, min: 0}, height: {type: Number, min: 0}, data: String},
        tags: [{type: String, index: true}],
        users: [{type: Schema.objectId, ref: 'User'}],
        is_visible:{type:Boolean,'default':true},
        creation_date:{type:Date,'default':Date.now}
    }),

    Subject: new Schema({
        name: String,
        image_field:{url:String, caption: String, type: {type: String},size: {type: Number, min: 0},
            width: {type: Number, min: 0}, height: {type: Number, min: 0}, data: String},
        tags :[String],
        is_hot:{type:Boolean,'default':false}
    })
};
/*,



//    Tags: new Schema({
//        name: String,
//        image_text_field: {url:String, caption: String, type: {type: String},size: {type: Number, min: 0},
//            width: {type: Number, min: 0}, height: {type: Number, min: 0}, data: String},
//        image_data_and_statistics: {url:String, caption: String, type: {type: String},size: {type: Number, min: 0},
//            width: {type: Number, min: 0}, height: {type: Number, min: 0}, data: String},
//        image_infography: {url:String, caption: String, type: {type: String},size: {type: Number, min: 0},
//            width: {type: Number, min: 0}, height: {type: Number, min: 0}, data: String},
//        image_graphs: {url:String, caption: String, type: {type: String},size: {type: Number, min: 0},
//            width: {type: Number, min: 0}, height: {type: Number, min: 0}, data: String},
//    }),

    Discussion: new Schema({
       tag_id: String,
       vision_document: String,
       is_cycle: Boolean,
       tags: [String],
       users: [{type: Schema.objectId, ref: 'User'}]
//       posts: [{type: Schema.objectId, ref: 'Post'}]
    }),



    Post: new Schema({
        text: String,
        discussion: {type: Schema.objectId, ref: 'Discussion', index: true}
    })

    //Cycle
    //Peula
     */
//};



var Models = module.exports = {
    User: mongoose.model("User", Schemas.User),
    InformationItem:mongoose.model('InformationItem',Schemas.InformationItem),
    Subject:mongoose.model('Subject', Schemas.Subject)
};
