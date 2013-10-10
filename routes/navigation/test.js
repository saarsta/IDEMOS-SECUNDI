var models = require('../../models')
    ,async = require('async')
    ,_ = require('underscore')
    ,$ = require('jquery')
    ,zombie = require('zombie');


module.exports = function(req, res){
    var browser=null;

    var fb_user = req.app.settings['facebook_pages_admin_user'];
    var fb_pass = req.app.settings['facebook_pages_admin_pass'];
    if(GLOBAL.zombie) {
        browser = GLOBAL.zombie

    } else{
        browser = GLOBAL.zombie = new zombie()  ;
    }

    models.Cycle.find({"fb_page.fb_id": {$exists: true} }).exec(function(err, cycles){
        var func_arr =null;

        func_arr =_.map(cycles,function(cycle){
            return  function(callback) {
                getUsersLoop(5,browser,cycle.fb_page.fb_id,function(err,users){
                    if(!err){
                        models.Cycle.update({"fb_page.fb_id": cycle.fb_page.fb_id},{$addToSet:{"fb_page.users" :{ $each : users}}}, function(err,count)
                        {
                            callback(err, users);
                        });
                    }else{
                        callback(err);
                    }

                });
            }
        });

        async.series( func_arr ,function(err, results){
            if(err){
                console.log(err);
                res.send(browser.html());
            }else{
                res.json(results);
            }
        });
    });


    //'253998261397827'
    function getUsersLoop(repeat,browser,page_id, callback){
        if(repeat==0){
            return;
        } else{
            getUsers(browser,page_id,function(err,users){
                if(err=="no_login"){
                    doFBLogin(browser,function(err){
                        if(err){
                            callback("login failed");
                        }else{
                            getUsersLoop(repeat-1,browser,page_id,callback)
                        }
                    })
                }else  if(err){
                    getUsersLoop(repeat-1,browser,page_id,callback);
                } else{
                    callback(null,users) ;
                }
            })

        }
    }

    function doFBLogin (browser, callback){
        console.log("doLogin");
        browser.visit("https://www.facebook.com/", function () {
            console.log(browser.location.pathname);
            var page = $(browser.html());
            if(page.find("#u_0_4").length ==1 ){
                console.log("login to facebook");
                console.log(browser.location.pathname);
                browser.
                    fill("email",fb_user).
                    fill("pass", fb_pass).
                    pressButton("#u_0_4", function() {
                        console.log(browser.location.pathname + " : " + browser.success);
                        callback(null);
                    })
            }
            if(page.find("#u_0_1").length ==1){
                console.log("recognized login to facebook");
                console.log(browser.location.pathname);
                browser.
                    fill("pass", fb_pass).
                    pressButton("#u_0_1", function() {
                        console.log(browser.location.pathname + " : " + browser.success);
                        callback(null);
                    })
            }
            else{
                console.log("facebook page not loaded");
                callback("login failed");
            }

        });
    }

    function getUsers(browser,page_id, callback){

        console.log("getUsers " + page_id);
        browser.visit("https://www.facebook.com/browse/?type=page_fans&page_id="+page_id, function () {
            console.log(browser.location.pathname + " : " + browser.success);
            if(browser.success) {
                var p = $(browser.html());
                var users =p.find('li.fbProfileBrowserListItem a');
                var users_arr=[];
                $.each(users,function(key,obj){
                    var tmp_obj=   eval($(obj).data("gt"));
                    if(tmp_obj) {
                        var user= $(obj);
                        var user_obj=  {}
                        user_obj['fb_id']= tmp_obj.engagement.eng_tid;
                        user_obj['name']= user.text();

                        //users_arr.push(user_obj) ;
                        users_arr.push(tmp_obj.engagement.eng_tid) ;
                    }
                });

                if(users_arr.length==0) {
                    console.log("no users found")  ;
                    if(p.find("#pass").length ==1 ){
                        console.log("no login")  ;
                        callback("no_login")
                    }else{
                        console.log("unknown")  ;
                        callback("unknown")
                    }
                    //res.send(browser.html());
                }   else{
                    //res.json(users_arr);
                    callback(null,users_arr)
                }
            } else  {
                callback(browser.errors)
            }




        }  );
    }
};
