/**
 * Created with JetBrains WebStorm.
 * User: Roi Ronn
 * Date: 30/06/12
 * Time: 15:21
 * To change this template use File | Settings | File Templates.
 */
var config = require('./config');
var request = require('request');
var SignedRequest = require('facebook-signed-request');
SignedRequest.secret = config.FB_SECRET;
/**
 * Perform an action of a given object in facebook open graph.
 * @param err - Error variable
 * @param data - the data object for the call in the following format:
 * {
 *      action : <string> the action to take
 *      object_url : <string> the url for the object on which the action takes place
 *      object_name : <string> the name of the object
 *      fid : <string> the facebook id of the user for which the action is taken
 * }
 * @param callback (optional) - the callback function for the action in the following
 * signature : function(err)
 */
var doAction = function( err , data ,callback ){
        var post_url = "https://graph.facebook.com/me/"+config.FB_APP_NAME+":"+data.action;
        var qs = new Object();
        qs[data.object_name] = data.object_url;
        var options = {
            url : post_url,
            form : qs, //Maybe wrong way to transfer the data... //TODO check it!.
            method: "POST"
        }
    request( options , function (error, response, body) {
        if (error) {
                if (callback) callback( err );
        }
        else if (response.statusCode!=200){
                console.log("Failed to post action on FaceBook");
                if (callback) callback(null);
        }
        else{
                console.log(body);
                if (callback) callback(null);
        }

    })
}

/**
 *  The handler for the action link.  Decode the singed request object and
 *  act as needed.
 * @param err Error variable
 * @param data - the singed request object returned by facebook (before decode!)
 * @param callback
 */
var actionLinkHandler = function(  data , callback ){

    var signedRequest = new SignedRequest( data );

    signedRequest.parse(function(errors, request){

        if ( request.isValid() ){
            var rData = request.data;
            var user_data = {user_id:rData.user_id, email:rData.user.email};
            var action = rData.action_link.split(":")[1];
            if ( config.actions[ action ] ){

                config.userFinder( user_data , function( err , user ){
                    if ( err ){
                        callback( err , false );
                    }
                    else {
                        var aData = {
                            object : rData.objects[0].url,
                            user : user
                        }
                        config.actions[ action ].action_link_cb(  aData , function( err , suc ){
                            if ( err ){
                                callback( err , false );
                            }
                            else{
                                if ( suc ) doAction( null ,{
                                    action: action,
                                    object : rData.objects[0].url,
                                    fid : rData.user_id
                                }, null);
                                callback( null , suc);
                            }
                        } );
                    }
                });
            }
        }
        else{
            console.log("Action link signed request was invalid");
            console.log(errors);
        };

    });

}

/**
 * Exports
 */
module.exports.getMetaDataSinppet = getMetaDataSinppet;
module.exports.actionLinkHandler = actionLinkHandler;
module.exports.doAction = doAction;