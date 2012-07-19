function sendFacebookInvite(message,link,callback) {
    FB.ui({method: 'apprequests', message: message}, function(response) {

        if(!response)
            callback('canceled');
        else {
            var request_id = response.request;

            db_functions.addFacebookRequest(link, request_id,callback);
        }
    });
}

function sendFacebookShare(link, title, src, text_preview, callback) {
    db_functions.addFacebookRequest(link, null, function(err,link_obj) {
        if(err)
            callback(err);
        else {
            text_preview = text_preview.replace(/(<([^>]+)>)/ig,"");
            link =  window.location.protocol + '//' + window.location.hostname + link_obj.link;
            if (src.indexOf("http") == -1)
                src = /*"http://uru.s3.amazonaws.com/spivak_29.jpg"*/window.location.protocol + '//' + window.location.hostname + src;

            console.log(src);
//            src = 'http://fbrell.com/f8.jpg';

            FB.ui({
                method: 'feed',
                link: link,
                name: title,
                picture: src,
                caption: text_preview
//                description: text_preview
            }, function(response) {
                console.log(response);
                callback();
            });
        }
    });

}

function facebookLogin(callback) {
    FB.login(function(response) {
        console.log(response);
        if (response.authResponse) {
            console.log('Welcome!  Fetching your information.... ');

            // send response.authResponse.accessToken
            db_functions.getUserAfterFbConnect(response.authResponse.userID, response.authResponse.accessToken, function(err, user){
               callback(err, user);
            });

        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    },{scope: 'email'});}