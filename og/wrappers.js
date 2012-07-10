/**
 * Not to be implemented!!!! ( comment can not be actioned with an action link )
 * @param err - error variable
 * @param data - data in the format : {
*                                         object : the url of the discussion on which the comment was added.
*                                         user : user object.
*                                     }
 * @param callback - MUST BE RUN! run with callback(null, true) if action went well and the performed action is
 *                   to be posted on FB, or callback(err,false) else.
 */
module.exports.comment_cb = function(err , data , callback){
    callback(null , true);
}
/**
 * Not to be implemented!!!! ( creation can not be actioned with an action link )
 * @param err - error variable
 * @param data - data in the format : {
 *                                         object : the url of the object that was pressed.
 *                                         user : user object.
 *                                     }
 * @param callback - MUST BE RUN! run with callback(null, true) if action went well and the performed action is
 *                   to be posted on FB, or callback(err,false) else.
 */
module.exports.create_cb = function(err , data , callback){
    callback(null , true);
}
/**
 * The function will mark that a user has user said he would go the activity that is
 * described in the activity suggestion.
 * @param err - error variable
 * @param data - data in the format : {
 *                                         object : the url of the object that was pressed.
 *                                         user : user object.
 *                                     }
 * @param callback - MUST BE RUN! run with callback(null, true) if action went well and the performed action is
 *                   to be posted on FB, or callback(err,false) else.
 */
module.exports.go_cb = function(err , data , callback){
    callback(null , true);
}
/**
 * NOT TO BE IMPLEMENTED - cannot be done with an action link...
 * @param err - error variable
 * @param data - data in the format : {
 *                                         object : the url of the object that was pressed.
 *                                         user : user object.
 *                                     }
 * @param callback - MUST BE RUN! run with callback(null, true) if action went well and the performed action is
 *                   to be posted on FB, or callback(err,false) else.
 */
module.exports.rank_cb = function(err , data , callback){
    callback(null , true);
}
/**
 * NOT TO BE IMPLEMENTED - cannot be done with an action link...
 * @param err - error variable
 * @param data - data in the format : {
 *                                         object : the url of the object that was pressed.
 *                                         user : user object.
 *                                     }
 * @param callback - MUST BE RUN! run with callback(null, true) if action went well and the performed action is
 *                   to be posted on FB, or callback(err,false) else.
 */
module.exports.suggest_cb = function(err , data , callback){
    callback(null , true);
}
/**
 * Change the db to represent the fact that user has supported petition that is displayed in "object" (a url)
 * @param err - error variable
 * @param data - data in the format : {
 *                                         object : the url of the object that was pressed.
 *                                         user : user object.
 *                                     }
 * @param callback - MUST BE RUN! run with callback(null, true) if action went well and the performed action is
 *                   to be posted on FB, or callback(err,false) else.
 */
module.exports.support_cb = function(err , data , callback){
    callback(null , true);
}
/**
 * Add a user to a leverage cycle or an action. NOTICE: here object can be an action OR a cycle. If this won't be noticed
 * it will be a bug. If this is a bug - you owe me launch!!!
 * @param err - error variable
 * @param data - data in the format : {
 *                                         object : the url of the object that was pressed.
 *                                         user : user object.
 *                                     }
 * @param callback - MUST BE RUN! run with callback(null, true) if action went well and the performed action is
 *                   to be posted on FB, or callback(err,false) else.
 */
module.exports.join_cb = function(err , data , callback){
    callback(null , true);
}
/**
 * Use data.email or data.user_id to find, or create a new user in the system.
 * @param err
 * @param data - {user_id : 2134234234 , email : bug@buggy.com}
 * @param callback
 */
module.exports.getOrCreateUserByFid = function ( err , data , callback ){

}
