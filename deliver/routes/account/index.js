/**
 * Created by JetBrains WebStorm.
 * User: ishai
 * Date: 2/13/12
 * Time: 12:34 PM
 * To change this template use File | Settings | File Templates.
 */
var sys = require('util')
    ,mongoose = require('mongoose')
    ,common = require('./common')
    ,middlewares = require('./middlewares');

exports.SimpleAuthentication = require('./authentication');
exports.FbServerAuthentication = require('./fb_auth');
exports.referred_by_middleware = middlewares.referred_by_middleware;
exports.auth_middleware = middlewares.auth_middleware;
exports.populate_user = middlewares.populate_user;

exports.routing = function(router)
{
    router.all('/register',require('./register'));

    router.all('/login',require('./login'));

    router.get('/facebooklogin',require('./facebook_login'));

    router.get('/logout', require('./logout'));

    router.all('/code_after_fb_connect', require('./code_after_fb_connent'));

    router.all('/reset_password', require('./reset_password'));

    router.all('/forgot_password', require('./forgot_password'));

    router.all('/activation', require('./activation'));
};



exports.facebookShare = require('./facebook_share');
