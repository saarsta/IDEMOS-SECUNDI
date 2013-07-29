var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    utils = require('../utils'),
    common = require('./common');

var Action = module.exports = utils.revertibleModel(new Schema({
    title:               {type: String, required: true},
    tooltip:             String,
    text_field:          {type: Schema.Types.Text, required: true},
    text_field_preview:  {type: Schema.Types.Text},
    image_field:         Schema.Types.File,
    image_field_preview: Schema.Types.File,
    category: {type:ObjectId, ref:'Category', require: true},
    description: String,
    creator_id: {type:ObjectId, ref:'User', query:common.FIND_USER_QUERY, index:true, required:true},
    first_name: {type: String, editable:false},
    last_name: {type: String, editable:false},

    //the first cycle is the main cycle, is_displayed reffers to the timeline popup that is displayed by default
    cycle_id:[
        new Schema({cycle: {type:ObjectId, ref:'Cycle', index:true, required:true}, is_displayed:{type: Boolean, 'default': false}})
    ],
    subject_id:
        {type:ObjectId, ref:'Subject', index:true, required:true}
    ,
    action_resources:[
        new Schema({
            resource: {type:ObjectId, ref:'ActionResource'},
            amount:Number,
            left_to_bring: Number
        })
    ],
    what_users_bring: [
        new Schema({
            user_id:{type:ObjectId, ref:'User', query:common.FIND_USER_QUERY},
            amount: {type: Number, 'default': 0},
            resource: {type:ObjectId, ref:'ActionResource'}
        })
    ],
    tags:[String],
    //users that conected somehow to the action for my uru
    users: [
        new Schema({
            user_id:   {type: ObjectId, ref: 'User', query:common.FIND_USER_QUERY},
            join_date: {type: Date, 'default': Date.now}
        })
    ],

    //users that are going to be in the action
    //this works now !! so start using it fucker!! (its the same as join schema)
    going_users:         [
        new Schema({
            user_id:   {type: ObjectId, ref: 'User', query:common.FIND_USER_QUERY},
            join_date: {type: Date, 'default': Date.now}
        })
    ],

    execution_date:                                   {
        date:     {type: Date, required: true},
        duration: {type: Number, required: true, 'default': 3}
    }, //change default
    required_participants:                            {type: Number, 'default': 0},
    admin_text:                                       {type: String, 'default': "עזרו לזה לקרות!"},
    //system_message:                                   String,
    num_of_going:                                     {type: Number, 'default': 0},
    tokens:                                           {type: Number, 'default': 0},
    is_approved:                                      {type: Boolean, 'default': false},
    is_hot_object:                                    {type: Boolean, 'default': false},
    gamification:                                     {approved_to_cycle: {type: Boolean, 'default': false}, editable: false},
    location:                                         Schema.Types.GeoPoint,
    grade:                                            {type: Number, 'default': 0},
    evaluate_counter:                                 {type: Number, 'default': 0, editable: false},
    grade_sum:                                        {type: Number, 'default': 0, editable: false},
    threshold_for_accepting_change_suggestions:       {type: Number, min: 0, max: 501, 'default': 2},
    admin_threshold_for_accepting_change_suggestions: {type: Number, max: 500, 'default': 0},
    social_popup:  {
            default_title: {type: String},
            default_text: {type: String}},

        is_hidden:                                        {type: Boolean, 'default': true},
        creation_date:{type:Date, 'default':Date.now},
        _preview:{type:Schema.Types.Mixed,link:'/actions/{_id}',editable:false}
},
    {strict: true}
));


Action.methods.toString = function(){
    return this.title;
}