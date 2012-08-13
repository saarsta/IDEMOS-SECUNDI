/**
 * Created with JetBrains WebStorm.
 * User: Avner
 * Date: 7/17/12
 * Time: 12:54 PM
 * To change this template use File | Settings | File Templates.
 */

var proxyCommon={
    addOrRemoveProxy: function (proxy,proxyId,userName,my_id,onProxyChangedCallback) {
        function findUserProxy(userId) {
            for (var i in proxy) {
                var userProxy = proxy[i];
                if (userProxy.user_id === userId ) {
                    return userProxy;
                }
                else if (userProxy.user_id&& userProxy.user_id._id === userId ) {
                    return userProxy;
                }

            }
            return null;
        }

        var userProxy = findUserProxy(proxyId,proxy);
        if (!userProxy) {
            //you didn't give proxy to this user
            userProxy = {number_of_tokens:0,
                number_of_tokens_to_get_back:0,
                user_id: proxyId
            }
        }

        var config = {
            message:
                'בחר את מספר המנדטים שאתה רוצה לתת ל- '
                    + userName,
            userProxy:userProxy,
            onOkCilcked: function (e) {
                e.preventDefault();
                newAmount = $('.give-mandats-popup').find(':checked').val();

                var changeProxy = newAmount - (userProxy.number_of_tokens - userProxy.number_of_tokens_to_get_back);
                if (changeProxy == 0) {
                    $.colorbox.close();
                }

                db_functions.addOrRemoveProxyMandate(my_id, proxyId, changeProxy, function (err, data) {
                    //  var msg_params = err ? {massage:err.responseText} : {massage:"האסימונים ילקחו בקרוב"};
                    var fixMeProxy;
                    if(data && data.proxy){
                        if(data.ugly_proxy){//fix the proxy object
                           for(var i=0;i<data.proxy.length;i++){
                               fixMeProxy=data.proxy[i].user_id;
                               if(typeof (fixMeProxy._id)==="undefined"){ //need to fix me
                                   fixMeProxy._id=data.ugly_proxy._id;
                                   fixMeProxy.facebook_id=data.ugly_proxy.facebook_id;
                                   fixMeProxy.first_name=data.ugly_proxy.first_name;
                                   fixMeProxy.last_name=data.ugly_proxy.last_name;
                                   fixMeProxy.num_of_given_mandates=data.ugly_proxy.num_of_given_mandates;
                                   break;

                              }
                           }
                        }

                        onProxyChangedCallback(data)
                    }
                    if(err){
                        $(document).one('cbox_closed', function (e) {
                            var message = /[a-zA-Z]/.test(err.responseText) ? 'קרתה תקלה' : err.responseText;
                            popupProvider.showOkPopup({message:message});
                        });
                    }
                    else{
                        if (changeProxy < 0) {
                            $(document).one('cbox_closed', function (e) {
                                popupProvider.showOkPopup( {message:"האסימונים יעמדו לרשותך שוב בסוף היום"})
                            });
                        }

                    }
                    $.colorbox.close();


                })
            }
        };
        popupProvider.showGiveMandatPopup(config);

    }
}
