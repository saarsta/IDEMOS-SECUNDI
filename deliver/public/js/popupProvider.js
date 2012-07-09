/**
 * Created by JetBrains WebStorm.
 * User: Avner
 * Date: 7/2/12
 * Time: 2:21 PM
 * To change this template use File | Settings | File Templates.
 */
//depend on dust



var popupProvider={

    showOkPopup:function(popupConfig){
        var defaults = {
        okButtonText:'ok'
        ,massage:''
        ,onOkCilcked:function(e){
            e.preventDefault();
            $.colorbox.close();
            }
        };

        popupConfig = $.extend(defaults,popupConfig);

        dust.render('ok_popup',popupConfig,function(err,out){
            if(!err){
                 $.colorbox({ html:out,
                     onComplete:function(e){
                       $('.ok-button').click(popupConfig.onOkCilcked);
                     }
                 });
               
            }
        });

    },

    showGiveMandatPopup:function(popupConfig){

        this.self = this;
        var defaults = {
            massage:''

            ,onCancelCilcked:function(e){
                e.preventDefault();
                $.colorbox.close();
            }
            ,onOkCilcked:function(e){
                e.preventDefault();
                $.colorbox.close();
            }
            ,onClosed :function(e){

            }
        };
      // var giveTokens=3;
        popupConfig = $.extend(defaults,popupConfig);
        this.popupConfig=popupConfig;

        var popup;
        dust.render('give_mandat_popup', popupConfig, function(err,out) {
            if (err) {
                return;
            }

            popup = $.colorbox({ html:out,
                onComplete:function (e) {
                    var realProxy = popupConfig.userProxy.number_of_tokens - popupConfig.userProxy.number_of_tokens_to_get_back;
                    $('.ok-button').click(popupConfig.onOkCilcked);
                    $('.cancel-button').click(popupConfig.onCancelCilcked);
                    $('.give-mandats-popup input').eq(realProxy).attr('checked', true);

                },
                onClosed:function (e) {
                    popupConfig.onClosed(e);
                }
            });
        });
        return popup;
    }

}