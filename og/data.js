
var config = require('./config');
var save_response = require('./integration/save_response');
var request = require('request');
var SignedRequest = require('facebook-signed-request');
SignedRequest.secret = config.FB_SECRET;




var get = module.exports.get =  function(url ,callback ){
    var options = {
        url : url,
        method: "GET"
       // form : qs, //Maybe wrong way to transfer the data... //TODO check it!.
       // uri: 'https://www.pageonce.com/jsp/userLogin.jsp',
       //  headers: {}
    };

    request( options , function (error, response, body) {
        callback (error, response, body);
    });
}