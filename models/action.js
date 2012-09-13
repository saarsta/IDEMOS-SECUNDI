var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    mongoose_types = require('j-forms').types;


var Action = module.exports = new Schema({
    title:               {type: String, required: true},
    tooltip:             String,
    text_field:          {type: mongoose_types.Text, required: true},
    text_field_preview:  {type: mongoose_types.Text},
    image_field:         mongoose_types.File,
    image_field_preview: mongoose_types.File,
    type: {type: String, require: true},
    description: String,
    creator_id: {type:ObjectId, ref:'User', index:true, required:true},
    first_name: {type: String, editable:false},
    last_name: {type: String, editable:false},
    cycle_id:{type:ObjectId, ref:'Cycle', index:true, required:true},
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
            user_id: {type: ObjectId, ref:'User'},
            amount: {type: Number, 'default': 0},
            resource: {type:ObjectId, ref:'ActionResource'}
        })
    ],
    tags:[String],
    //users that conected somehow to the action for my uru
    users: [
        new Schema({
            user_id:   {type: ObjectId, ref: 'User'},
            join_date: {type: Date, 'default': Date.now}
        })
    ],
    //users that are going to be in the action
    going_users:         [
        new Schema({
            user_id:   {type: ObjectId, ref: 'User'},
            join_date: {type: Date, 'default': Date.now}
        })
    ], //i don't use it for now

    execution_date:                                   {
        date:     {type: Date, required: true},
        duration: {type: Number, required: true, 'default': 3}
    }, //change default
    required_participants:                            {type: Number, 'default': 0},
    admin_text:                                       {type: String, 'default': "עזרו לזה לקרות!"},
    system_message:                                   String,
    num_of_going:                                     {type: Number, 'default': 0},
    tokens:                                           {type: Number, 'default': 0},
    is_approved:                                      {type: Boolean, 'default': false},
    is_hot_object:                                    {type: Boolean, 'default': false},
    gamification:                                     {approved_to_cycle: {type: Boolean, 'default': false}, editable: false},
    location:                                         mongoose_types.GeoPoint,
    grade:                                            {type: Number, 'default': 0},
    evaluate_counter:                                 {type: Number, 'default': 0, editable: false},
    grade_sum:                                        {type: Number, 'default': 0, editable: false},
    threshold_for_accepting_change_suggestions:       {type: Number, min: 0, max: 501, 'default': 2},
    admin_threshold_for_accepting_change_suggestions: {type: Number, max: 500, 'default': 0},
    is_hidden:                                        {type: Boolean, 'default': true}
},
    {strict: true}
);
