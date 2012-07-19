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
                user_id:proxyId
            }
        }

        var config = {
            massage:
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
                    if(data && data.proxy){
                        proxy=data.proxy;
                        onProxyChangedCallback(proxy)
                    }
                    if(err){
                        $(document).one('cbox_closed', function (e) {

                            popupProvider.showOkPopup({massage:err.responseText});
                        });
                    }
                    else{
                        if (changeProxy < 0) {
                            $(document).one('cbox_closed', function (e) {
                                popupProvider.showOkPopup( {massage:"האסימונים יעמדו לרשותך שוב בסוף היום"})
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
