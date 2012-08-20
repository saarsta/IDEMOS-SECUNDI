var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    mongoose_types = require('j-forms').types,
    utils = require('../utils');

var Cycle = module.exports = new Schema({
    creation_date: {type:Date, 'default':Date.now},
    due_date : {type:Date/*, 'default':function(){ return Date.now() + 1000*3600*24*30;  }*/},
    subject:[{
        id:{type:ObjectId, ref:'Subject', index:true, required:true},
        name: {type:String, editable:false}
    }
    ],
    main_subject: {type:ObjectId, ref:'Subject', required:true},
    title: {type:String, required:true},
    discussion_title: {type:String, required:true},
    tooltip:String,
    text_field:{type:mongoose_types.Html},
    text_field_preview:{type:mongoose_types.Html},
    image_field: mongoose_types.File,
    image_field: mongoose_types.File,
    image_field_preview: mongoose_types.File,
    tags:[String],
    discussions:[
        {discussion: {type:ObjectId, ref:'Discussion'}, is_main: {type: Boolean, 'default': false}}
    ],
    admin_updates: {info: {type: String}, date: {type: Date}},
    document: String,
    shopping_cart: [
        {type:ObjectId, ref:'InformationItem'}
    ],
    is_hot_object: {type:Boolean,'default':false},
    followers_count: {type: Number, 'default':0, editable:false},
    num_of_comments: {type: Number, 'default':0, editable:false},
    upcoming_action: {type: ObjectId, ref: 'Action', index: true},
    num_upcoming_actions: {type: Number, 'default':0, editable:false},
    //users that conected somehow to the cycle for my uru
    users:{type:[
        new Schema({user_id:{type:ObjectId, ref:'User'}, join_date: {type:Date, 'default':Date.now}})
    ], editable:false},
    opinion_shapers: [{type: ObjectId, ref: 'User'}],
    is_hidden:{type:Boolean,'default':true}
}, {strict: true});

Cycle.pre("save", function(next){

    var self = this;

    var iterator = function(subject, itr_cbk){
        mongoose.model('Subject').findById(subject.id, function(err, result){
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
