
var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    mongoose_types = require('j-forms').types,
    utils = require('./../utils');


var CommentVote = new Schema({
    user_id:{type:ObjectId, ref:'User', index:true, required:true},
    method: {type:String, "enum":['vote_for', 'vote_against']},
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


var Article = module.exports = new Schema({
    user_id:{type:ObjectId, ref:'User', index:true, required:true},
    first_name: {type:String/*, editable:false*/},
    last_name: {type:String/*, *//**//*editable:false*/},
    avatar : {type:String, editable:false},
    title : {type:String, required:true, required:true},
    tooltip:String,
    text : {type:mongoose_types.Html, required:true},
    tags: [String],
    view_counter: {type: Number, 'default': '0'},
    time: {type: Date, 'default': Date.now, editable:false},
    popularity_counter: {type: Number, 'default': 0},
    comments : [Comment]
} ,{strict: true});

Article.pre('save',function(next)
{
    var self = this;
    if(!this.first_name && !this.last_name && this.user_id)
    {
        mongoose.model('User').findById(this.user_id,function(err,user)
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
