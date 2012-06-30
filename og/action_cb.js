/**
 * Created with JetBrains WebStorm.
 * User: Roi Ronn
 * Date: 30/06/12
 * Time: 18:06
 * To change this template use File | Settings | File Templates.
 */


var handler = require('./og').actionLinkHandler;

/**
 * Simply the handler that handles the callback from action
 * links. Needs  HTTPS.
 * @param req
 * @param res
 */
module.exports = function( req , res ){
    var signed_request = req.params['signed_request'];
    handler( signed_request , function(err , suc){
        if (err || !suc){
            res.end( JSON.stringify({success:false}));
        }
        else {
            res.end( JSON.stringify({success:true}));
        }
    } );
}