


var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    async = require('async'),
    common = require('./common'),

    utils = require('../utils');

var Cycle = module.exports = utils.revertibleModel(new Schema({
    creation_date: {date:{type:Date, 'default':Date.now}, is_displayed: {type: Boolean, 'default': false}},
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
    text_field:{type:Schema.Types.Html},
    text_field_preview:{type:Schema.Types.Html},
    image_field: Schema.Types.File,
    image_field_preview: Schema.Types.File,
    sub_branding:[ {
                image: Schema.Types.File,
                title: {type: String},
                text: {type: String},
                link: {type: String}
    }],
    tags:[String],
    discussions:[
        {discussion: {type:ObjectId, ref:'Discussion', query:common.FIND_DISCUSSION_QUERY}, is_main: {type: Boolean, 'default': false}}
    ],
    admin_updates: [{info: {type:Schema.Types.Text}, date: {type: Date,'default':Date.now}, is_displayed: {type: Boolean, 'default': false}}],
    document: String,
//    shopping_cart: [
//        {type:ObjectId, ref:'InformationItem'}
//    ],
    is_hot_object: {type:Boolean,'default':false},
    followers_count: {type: Number, 'default':0, editable:false},
    num_of_comments: {type: Number, 'default':0, editable:false},
    upcoming_action: {type: ObjectId, ref: 'Action', index: true},
    num_upcoming_actions: {type: Number, 'default':0, editable:false},

  //so there is no such thing.. only followers that are located in user.cycles
    //users that conected somehow to the cycle for my uru
    users:{type:[
        new Schema({user_id:{type:ObjectId, ref:'User',query:common.FIND_USER_QUERY}, join_date: {type:Date, 'default':Date.now}})
    ], editable:false},
    opinion_shapers: [

      // {user_id: {type:ObjectId, ref:'User', query:common.FIND_USER_QUERY}, text: {type:Schema.Types.Text}}
      new Schema({user_id:{type:ObjectId, ref:'User', query:common.FIND_USER_QUERY}, text: {type:Schema.Types.Text}})
    ],
 /*   social_popup_title: {type: String},
    social_popup_text: {type: String},
    */
    social_popup:  {
        default_title: {type: String},
        default_text: {type: String},
        fb_liker_title: {type: String},
        fb_liker_text: {type: String},
        new_atzuma_user_title: {type: String},
        new_atzuma_user_text: {type: String}},

    counter_text :   {type: String},
    is_hidden:{type:Boolean,'default':true},
    is_private:{type:Boolean,'default':false},

    timeline:{
        source:{type: String} ,
        zoom :{type: Number},
        default_item: {type: Number} }  ,

    fb_page: {
        fb_id: {type: String},
        url: {type: String},
        like_count:{type: Number,default:0},
        like_count_prev:{type: Number,default:0},
        last_update:{type:Date},
        users:{type:[String], index:true}

        // users1 : [ {fb_id:{type:String,unique: true}, name: {type:String}} ]
    },
    _preview:{type:Schema.Types.Mixed,link:'/cycles/{_id}',editable:false}
}, {strict: true}));

Cycle.methods.toString = function(){
    return this.title;
}

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
