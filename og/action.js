/**
 * Created with JetBrains WebStorm.
 * User: Roi Ronn
 * Date: 30/06/12
 * Time: 18:06
 * To change this template use File | Settings | File Templates.
 */

var doAction = require('./og').doAction;

/**
 *  Do an action on the open graph!
 *  The parameters to pass in the request are:
 *  - fid - the user FB id
 *  - action - the name of the action
 *  - object_url - the url of the object to do the action on
 *  - object_name - the name of the acted upon object type
 * @param req
 * @param res
 */
module.exports = function( req , res ){
    var data  = {
        action: req.params['action'],
        object_url : req.params['object_url'],
        object_name : req.params['object_name'],
        fid : req.params['fid']
    };
    doAction(data , function(err){
        if (err) {
            res.end(JSON.stringify({status:500 , error: err}));
        }
        else {
            res.end(JSON.stringify({status:200 , error: null}));
        }

    });
    res.redirect('/');
//    res.render('frontend/home.ejs',{});
};