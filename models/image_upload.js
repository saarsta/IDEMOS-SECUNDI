

var mongoose = require('mongoose')
    common = require('./common')
    ,types = require('j-forms').types
    ,Schema = mongoose.Schema;


var ImageUpload = module.exports  =  new Schema({
    image:{type:types.File, required:true},
    date:{type:Date,'default':Date.now},
    user:{type:Schema.ObjectId,ref:'User',query:common.FIND_USER_QUERY}
}, {strict: true});

