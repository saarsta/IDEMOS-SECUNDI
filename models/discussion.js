
var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,

    common = require('./common'),
    utils = require('./../utils');


var Discussion = new Schema({
    title:{type:String, required:true},
    tooltip:String,
//        text_field:{type:Schema.Types.Html},
//        text_field_preview:{type:Schema.Types.Html},
    image_field: { type:Schema.Types.File, required:true},
    image_field_preview: { type:Schema.Types.File, require:true},
//    subject_id:[
//        {type:ObjectId, ref:'Subject', index:true, required:true, editable: false}
//    ],
    subject_id: {type:ObjectId, ref:'Subject',required:true,query:common.SUBJECT_QUERY, index:true},
    subject_name: {type:String,editable:false},
    //system_message: {type:Schema.Types.Html},
    creation_date:{type:Date, 'default':Date.now},
    last_updated:{type:Date, 'default':Date.now},
    creator_id:{type:ObjectId, ref:'User', query:common.FIND_USER_QUERY},
    first_name:{type:String,editable:false},
    last_name:{type:String,editable:false},
    text_field_preview: {type:Schema.Types.Text},//2-3 lines of the vision_text
    text_field:{type:Schema.Types.Text, required:true},
    vision_text_history:{type:[String]},
    replaced_text_history:[ new Schema({
        old_text: {type:String},
        new_text: {type: String}
    })],
    num_of_approved_change_suggestions: {type: Number, 'default': 0},
    is_hot_object: {type:Boolean,'default':false},
    press_items: [ {press_item_id:{type:ObjectId, ref:'PressItem'}}],
    links: [new Schema({
        title: String,
        link: String,
        text: String
    })],

    sub_branding:[ {
        image: Schema.Types.File,
        title: {type: String},
        text: {type: String},
        link: {type: String}
    }],

    is_cycle:{
        flag:{type:Boolean, 'default':false, editable:false},
        date:{type:Date, 'default':Date.now, editable:false}
    },
    is_displayed:{type: Boolean, 'deafult': false},
    tags:[String],
    //users that connected somehow to discussion for my uru
    users:[
        new Schema({user_id:{type:ObjectId, ref:'User', query:common.FIND_USER_QUERY}, join_date: {type:Date, 'default':Date.now}})
    ],

    //followers for my uru
    followers:[
        new Schema({user_id:{type:ObjectId, ref:'User', query:common.FIND_USER_QUERY}, join_date: {type:Date, 'default':Date.now}})
    ],
    view_counter: {type:Number, 'default':0},
    followers_count:{type:Number, 'default':0, editable:false},
    is_visible:{type:Boolean, 'default':true},
    is_published:{type:Boolean, 'default':false},
    /* I'm changing the min validator from 2 to 0 to avoid Blocker bug
     * TODO change this to 2 again after you'll investigate */
    threshold_for_accepting_change_suggestions: {type: Number, min: 0, max: 501, 'default': 2},
    admin_threshold_for_accepting_change_suggestions: {type: Number, max: 500, 'default': 0},
//        popular_comments: [{type: ObjectId, ref: 'Post', index: true}],
    grade:{type:Number, 'default':0},
    evaluate_counter:{type:Number, 'default':0},
    grade_sum:{type:Number, 'default':0, editable:false},
//    grades_count_thresh:{type:Number, 'default':0, editable:false},

    gamification: {has_rewarded_creator_of_turning_to_cycle: {type: Boolean, 'default': false},
    has_rewarded_creator_for_high_grading_of_min_graders: {type: String, 'default': false}, editable:false},
    is_hidden:{type:Boolean,'default':false} ,
    is_private:{type:Boolean,'default':false},
    _preview:{type:Schema.Types.Mixed,link:'/discussions/{_id}',editable:false}
}, {strict: true});

Discussion.methods.toString = function() {
    return this.title;
};

Discussion.pre('save',function(next){
    var modified = this.modifiedPaths();
    if(modified.indexOf('subject_id') == -1)
        return next();
    if(!this.subject_id){
        this.subject_name = '';
        return next();
    }
    var self = this;
    mongoose.model('Subject').findById(this.subject_id,function(err,sub){
        if(sub)
            self.subject_name = sub.name;
        next();
    });
});

module.exports = utils.revertibleModel(Discussion);