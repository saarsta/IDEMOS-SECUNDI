var account_facebook = require('../../routes/account/facebook_login');

/**
 * Use data.email or data.user_id to find, or create a new user in the system.
 * @param data - {user_id : 2134234234 , email : bug@buggy.com}
 * @param callback
 */

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