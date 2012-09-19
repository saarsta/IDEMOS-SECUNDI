var mongoose = require('mongoose')
    ,common = require('./common')
    ,Schema = mongoose.Schema;


var FBRequest = module.exports  =  new Schema({
    link:{type:String, required: true},
    fb_request_ids:{type:[String]},
    creator:{type:Schema.ObjectId,ref:'User',query:common.FIND_USER_QUERY}
}, {strict: true});


FBRequest.statics.getLink = function(request_id, callback) {
    console.log(request_id);
    this.findOne().where('fb_request_ids').in(request_id)
        .exec(function(err,link) {
        if(err)
            callback(err);
        else
            callback(null, link);
    });
};