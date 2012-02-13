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

mongoose.connect('mongodb://localhost/uru', function(err){
    if (err){
        console.log(err);
        throw err;
    }

});

var Schemas = {
    User: new Schema({
        username:String,
        identity_provider: {type: String, "enum": ['facebook', 'mail']},
        facebook_id: String,
        access_token: String,
        seesion_id: String,
        first_name: String,
        last_name: String,
        email: String,
        gender: {type: String, "enum": ['male', 'female']},
        age: {type: Number, min: 0},
        discussions: [{type: Schema.objectId, ref: 'Discussion'}],//this is only relevant when cycle is on, so if there is
        //a cycle schema i might change it
        md5: String
    })/*,

    Subject: new Schema({
        name: String,
        image:{url:String, caption: String, type: {type: String},size: {type: Number, min: 0},
            width: {type: Number, min: 0}, height: {type: Number, min: 0}, data: String},
        tags :[String]
    }),

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

    InformationItem: new Schema({
        subject_id: {type: Schema.objectId, ref: 'Subject'},
        title: {type: String, "enum": ['test', 'statistics', 'infographic', 'graph']},
        text_field: String,
        image_field: {url:String, caption: String, type: {type: String},size: {type: Number, min: 0},
            width: {type: Number, min: 0}, height: {type: Number, min: 0}, data: String},
        tags: [String],
        users: [{type: Schema.objectId, ref: 'User'}]

    }),

    Post: new Schema({
        text: String,
        discussion: {type: Schema.objectId, ref: 'Discussion', index: true}
    })
    //session
    //Cycle
    //Peula
     */
};



var Models = module.exports = {
    User: mongoose.model("User", Schemas.User)
};
