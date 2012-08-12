var mongoose = require('mongoose')
    ,Schema = mongoose.Schema;


var FBRequest = module.exports  =  new Schema({
    link:{type:String, required: true},
    fb_request_ids:{type:[String]},
    creator:{type:Schema.ObjectId,ref:'User'}
}, {strict: true});


FBRequest.statics.getLink = function(request_id, callback) {
    console.log(request_id);
    this.findOne().where('fb_request_ids').in(request_id).run(function(err,link) {
        if(err)
            callback(err);
        else
            callback(null, link);
    });
};