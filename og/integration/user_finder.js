var account_facebook = require('../../deliver/routes/account/facebook_login');


module.exports = function ( data , callback ){


    if(!data || !data.user_id)
        callback('must provide user id');
    else {
        account_facebook.isFacebookUserInDB(data.user_id,function(found,user) {
            if(found && user)  {
                callback(null,user);
            }
            else {
                account_facebook.createNewFacebookUser(data,data.access_token,function(id,user) {
                    if(id)
                        callback(null,user);
                    else
                        callback('internal error');
                })
            }
        });
    }
};