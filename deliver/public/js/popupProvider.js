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

    }
}