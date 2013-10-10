function sendFacebookInvite(message,link,callback) {
    FB.ui(
        {
            method: 'apprequests',
            message: message},

            function(response) {

                if(!response) {
                    callback('canceled');
                } else {
                    db_functions.addFacebookRequest(link, response, callback);
                }
        }
    );
}


function sendFacebookShare(_, title, src, text_preview,err_link, callback) {

    // log to db
    db_functions.addFacebookRequest(_, null, function(err, link_obj) {
        if(err) {
            //callback(err);
           // return;
            console.log(err);
        }
        // sanitize text_preview
        text_preview = text_preview ? text_preview.replace(/(<([^>]+?)>)/ig, ""):'';
        //var linko=    link_obj?    link_obj.link :''
        //var link = window.location.protocol + '//' + window.location.hostname + linko;

       // var link =   link_obj?  window.location.protocol + '//' + window.location.hostname + link_obj.link :  window.location.protocol + '//' + window.location.hostname +err_link ;
	    var link =   link_obj?  window.location.protocol + '//' + window.location.hostname + link_obj.link :  window.location.protocol + '//' + window.location.hostname +_ ;
        // fix src
        if (src && src.indexOf("http") == -1) {
            src = window.location.protocol + '//' + window.location.hostname + src;
        }

        FB.ui({
            method: 'feed',
            link: link,
            name: title,
            picture: src,
            caption: text_preview,
            description: ' '
        }, function(response) {
            console.log(response);
            callback();
        });
    });
}

function facebookLogin(callback) {
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            $.cookie("fb_login", 1, { path: '/' });
            db_functions.getUserAfterFbConnect(response.authResponse.accessToken, callback);

        } else {
            fb_auth_and_persist(callback);
        }
    });
}

function fb_auth_and_persist(callback) {
    FB.login(function(response) {
        console.log(response);
        if (!response.authResponse) {
            console.log('User cancelled login or did not fully authorize.');
            callback('User cancelled login or did not fully authorize.');
        } else {
            console.log('Welcome!  Fetching your information.... ');
            // save response.authResponse.accessToken
            db_functions.getUserAfterFbConnect(response.authResponse.accessToken, callback);
        }
    },
    {scope: 'email,publish_actions'});
}