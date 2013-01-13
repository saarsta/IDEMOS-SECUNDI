var models = require('../../../models')
    ,async = require('async')
    ,_ = require('underscore')
    ,md5 = require('MD5')
    ,http = require('http')
    ,fs = require('fs')
    ,url = require('url')
    ,notifications = require('../../../api/notifications.js');


module.exports = function(req, res){

    var admins=    ['501e73147555f6020000691a','502100e92066a502000009a9','501e72d57555f60200006804','4fc48d7cd9e6240100002c9b','501e5e6c78c8270200000995','50070e1be67ae6020001cf23','4fb9f02b5b734201000002a9'];
    if(req.session.user &&_.indexOf(admins, req.session.user._id) ){
        res.render('faces_admin.ejs', {
            layout: false,
            url: req.url,
            user_logged: req.isAuthenticated(),
            user: req.session.user,
            avatar_url: req.session.avatar_url
        });
    }  else{
        res.writeHead(302, {
            'Location': '/'
            //add other headers here...
        });
        res.end();
        return;
    }


};