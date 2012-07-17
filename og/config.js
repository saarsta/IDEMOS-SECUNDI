/**
 * Created with JetBrains WebStorm.
 * User: Roi Ronn
 * Date: 30/06/12
 * Time: 15:21
 * To change this template use File | Settings | File Templates.
 */

/**
 * Needed settings...
 */
module.exports.FB_SECRET = "<FB secret>";
module.exports.FB_APP_NAME = "<App name as configured in FB's developers GUI>";
module.exports.FB_ID = "<App ID as configured in FB's developers GUI>";
module.exports.ROOT_PATH = "<This server root path include http>";


/**
 * Loads the configs from the app settings
 * @param app
 */
module.exports.load = function(app) {
    module.exports.FB_SECRET = app.settings.facebook_secret;
    module.exports.FB_ID = app.settings.facebook_app_id;
    module.exports.FB_APP_NAME = app.settings.facebook_app_name;
    module.exports.ROOT_PATH = app.settings.root_path;
};


/**
 *  The function defined here will get a fid of an user that pressed on an
 *  action link in FB.
 *  The user object should be passed to the callback function.
 *  If the FID is new in the system, the function can create a new
 *  user, or call the callback with null as the user argument.
 *
 *  NOTE - if null is passed on a new FID, the action link callbacks
 *  must check for it!
 *
 *  NOTE - callback function must be called!!!
 * @param err
 * @param data - the id data that could have been retrieved
 *                              from the signed request: {
 *                                      user_id : the user FB id,
 *                                      email ( optional ) : the user email if found on request...
 *                              }
 * @param callback - function( err , user )
 */
module.exports.userFinder = require('./integration/user_finder');

/**
 *  The supported actions will be defined here.
 *
 *      The keys are the names for the actions as specified in FB GUI.
 *      The objects must specify:
 *      action_link_cb : A function that will act on the returned signed object
 *                                         after an action link was fired from within FB. The function
 *                                         will be in the following format:
 *                                         function ( err , data , callback ) ;
 *                                         Note that data will be an object in the following format:
 *                                         data = {
 *                                              object : the url of the object that was pressed.
 *                                              user : user object.
 *                                         }
 *
 *                                        when done - the function MUST call callback with the arguments :
 *                                        callback ( null , true ) if the action was completed,
 *                                        callback ( null/<err> , false ) if the action failed.
 *
 */
module.exports.actions = {
    "comment" : {
        action_link_cb : require('./integration/comment')
    }
    ,"create" : {
        action_link_cb : require('./integration/create')
    }
    ,"go" : {
        action_link_cb : require('./integration/go')
    }
    ,"rank" : {
        action_link_cb : require('./integration/rank')
    }
    ,"suggest" : {
        action_link_cb : require('./integration/suggest')
    }
    ,"support" : {
        action_link_cb : require('./integration/support')
    }
    ,"join" : {
        action_link_cb : require('./integration/join')
    }
}