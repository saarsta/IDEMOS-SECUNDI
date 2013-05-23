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
        okButtonText:'סגור'
        ,message:''
        ,callback: $.noop
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
                     },
                     onClosed:function(){
                         popupConfig.callback();
                     }
                 });
            }
        });
    },

    showOkPopupWithLink:function(popupConfig){
        var defaults = {
            okButtonText:'סגור',
            part_one:'',
            part_two: '',
            part_three: '',
            link: ''
            ,callback: $.noop
            ,onOkCilcked:function(e){
                e.preventDefault();
                $.colorbox.close();
            }
        };

        popupConfig = $.extend(defaults,popupConfig);

        dust.render('ok_popup_link',popupConfig,function(err,out){
            if(!err){
                $.colorbox({ html:out,
                    onComplete:function(e){
                        $('.ok-button').click(popupConfig.onOkCilcked);
                    },
                    onClosed:function(){
                        popupConfig.callback();
                    }
                });
            }
        });
    },

    showExplanationPopup:function(popupConfig){
        var clicked;
        var defaults = {
            okButtonText:'אישור',
            cancelButtonText: 'ביטול',
            tokens_needed: 0,
            tokens_owned: 0,
            callback: $.noop,
            onOkCilcked:function(e){
                e.preventDefault();
                clicked = 'ok';
                $.colorbox.close();
            },
            onCancelClicked:function(e){
                e.preventDefault();
                clicked = 'cancel';
                $.colorbox.close();
            }
        };

        popupConfig = $.extend(defaults,popupConfig);

        dust.render('explanation_popup',popupConfig,function(err,out){
            if(!err){
                $.colorbox({ html:out,
                    onComplete:function(e){
                        $('.ok-button').click(popupConfig.onOkCilcked);
                        $('.cancel-button').click(popupConfig.onCancelClicked);
                    },
                    onClosed:function(){
                        popupConfig.callback(clicked);
                    }
                });
            }
        });
    },

    showDeletePostPopup:function(popupConfig){
        var clicked;
        var defaults = {
            okButtonText:'אישור',
            cancelButtonText: 'ביטול',
            callback: $.noop,
            onCancelClicked:function(e){
                e.preventDefault();
                clicked = 'cancel';
                $.colorbox.close();
            }
        };

        popupConfig = $.extend(defaults,popupConfig);

        dust.render('delete_post_popup',popupConfig,function(err,out){
            if(!err){
                $.colorbox({ html:out,
                    onComplete:function(e){
                        $('.ok-button').click(popupConfig.onOkCilcked);
                        $('.cancel-button').click(popupConfig.onCancelClicked);
                    },
                    onClosed:function(){
                        popupConfig.callback(clicked);
                    }
                });
            }
        });
    },

    showGiveMandatPopup:function(popupConfig){

        this.self = this;

        var defaults = {
            message:''

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
    },

    showLoginPopup:function(popupConfig, callback){

        this.self = this;
        var defaults = {
            message:''
            ,onClosed :function(e){

            }
        };
        popupConfig = $.extend(defaults,popupConfig);
        this.popupConfig=popupConfig;
        dust.render('popup_login', popupConfig, function(err,out) {
            if (err) {
                return;
            }

             $.colorbox({ html:out,
                onComplete:function (e) {
                    $('#login_pop_form').submit(function() {
                        // get all the inputs into an array.
                        var $inputs = $('#login_pop_form :input');

                        // get an associative array of just the values.
                        var values = {};
                        $inputs.each(function() {
                            values[this.name] = $(this).val();
                        });

                        db_functions.login(values["email"], values["password"], function(err, result){
                            if(err){
                                callback(err);
                               // $("#login_title").text("נסה שוב");
                                $(".login-popup .noalert").hide();
                                $(".login-popup .alert").show();
                            }
                            else{
                                $(document).one('cbox_closed', function(){
                                    callback(err, result);
                                });
                                $.colorbox.close();
                            }
                        });
                    });

                    $("#fb_ajax_conncect").live('click', function(){
                            facebookLogin(function(err, result){
                                if(!err){
                                    $(document).one('cbox_closed', function(){
                                        callback(err, result);
                                    });
                                    $.colorbox.close();
                                }else{
                                    callback(err, result);
                                  //  $("#login_title").text(err);
                                }
                            })
                    })
                },
                onClosed:function (e) {
                    popupConfig.onClosed(e);
                }
            });
        });
    }
}