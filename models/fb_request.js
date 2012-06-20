var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;


var FBRequest = module.exports  =  new Schema({
    link:{type:String, unique:true},
    fb_request_ids:{type:[String]},
    creator:{type:Schema.ObjectId,ref:'User'}
}, {strict: true});


FBRequest.statics.getLink = function(request_id, callback) {
    this.findOne().where('fb_request_ids',request_id).run(callback);
};