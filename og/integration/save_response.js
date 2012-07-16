
var models = require('../../models');

/**
 * Saves the facebook request id with the associated url and the user who made the action
 * @param request_id
 * id returned from facebook
 * @param user
 * user who initiated the action
 * @param url
 * url of entity
 * @param callback
 */
module.exports = function(request_id, user,url,callback) {
    var fb_request = new models.FBRequest();
    fb_request.fb_request_ids = [request_id];
    fb_request.link = url;
    fb_request.creator = user._id;

    fb_request.save(callback);
};
