var user = {
    update: function(data) {
        $.extend(user.data, data);
    },
    actions_done_by_user: {}
};

var db_functions = {

    loggedInAjax:function (options) {
        var onError = options.error || function () {
            console.error(arguments[2]);
        };
        options.error = function (xhr, ajaxOptions, thrownError) {
            if (xhr.responseText == 'not authenticated') {
                connectPopup(function (err, data) {
                    if (err)
                        onError(xhr, ajaxOptions, thrownError);
                    else {
                        user = date;
                        var success = options.success;
                        options.success = function () {
                            success.apply(this, arguments);

                            if(window.location.href.indexOf('actions/create/')==-1 && window.location.href.indexOf('discussions/new/')==-1)
                            {
                                if(typeof window.vars === "undefined"  || typeof window.vars.afterLogin === "undefined") {
                                    window.location.href = window.location.href;
                                }
                                else
                                {
                                    window.vars.afterLogin  ();
                                }

                            }
                        };
                        options.error = function () {
                            onError.apply(this, arguments);
                            if(typeof window.vars === "undefined"  || typeof window.vars.afterLogin === "undefined") {
                                window.location.href = window.location.href;
                            }
                            else
                            {
                                window.vars.afterLogin ();
                            }
                        };

                        //TODO - for now no need for this popup
                        if(data.hasOwnProperty("actions_done_by_user") && options.hasOwnProperty("user_info")){
                            if(data.actions_done_by_user[options.user_info.action_name] || options.user_info.price <= 0) {
                                $.ajax(options);
                            } else {
                                var config = {
                                    tokens_needed: options.user_info.price,
                                    tokens_owned: data.tokens,
                                    callback: function(clicked){
                                        if(clicked == 'ok'){
                                            $.ajax(options);
                                        }else{
                                            options.success.call(this, "canceled");
                                        }
                                    }
                                };
                                //popupProvider.showExplanationPopup(config);
                            }
                        }
                    }

                    $.ajax(options);
                });
            } else if (xhr.responseText == 'not_activated') {
                var message = 'ההרשמה לאתר לא הושלמה, על מנת להמשיך לחץ על הלינק שנשלח לתיבת הדואר שלך.' +
                    '<br />' +
                    'לשליחה חוזרת לחץ ' +
                '<a href="/account/activation">כאן</a>'
                notActivatedPopup(message);
            } else if (xhr.responseText == 'suspended') {
                var message = "הושעת מהמערכת עקב החלטת מוביל תחום. אם ברצונך לקבל פרטים נוספים או לערער על ההחלטה, אנא שלח מייל לmovilim@uru.org.il.";
                notActivatedPopup(message);
            } else if (xhr.responseText == 'Error: Unauthorized - there is not enought tokens') {
                alert("אין מספיק אסימונים בשביל לבצע פעולה זו");
            } else if (xhr.responseText == "user must have a least 10 tokens to open create discussion")
                alert("צריך מינימום של 10 אסימונים בשביל ליצור דיון");
            else
                onError(xhr, ajaxOptions, thrownError);
        };

//        if(options.type == 'PUT' || options.type == 'POST')
//        {
//            global.user.
//            popupProvider.showOkPopup({
//                message: 'hi'
//            });
//        }

        //TODO - for now no need for this popup

        if((options.hasOwnProperty('user_info') && options.user_info.action_done == false && options.user_info.user_logged_in) && options.user_info.price > 0)
        {
            var config = {
                tokens_needed: options.user_info.price,
                tokens_owned:options.user_info.tokens_owned,
                callback: function(clicked){
                    if(clicked == 'ok'){
                        $.ajax(options);
                    }else{
                        options.success.call(this, "canceled");
                    }
                }
            };
            //popupProvider.showExplanationPopup(config);
        }
        else
        {
            $.ajax(options);
        }
    },

    login:function (email, password, callback) {
        this.loggedInAjax({
            url:'/api/login',
            type:"POST",
            async:true,
            data:{email:email, password:password},

            success:function (err, data) {
                callback(null, data);
            },
            error:function (err, data) {
                callback(err, null);
            }
        });
    },

    resetUserNotifications: function(callback){
        db_functions.loggedInAjax({
            url:'/api/reset_notification',
            type:"POST",
            async:true,
            success:function (data, err) {
                callback(err, data);
            },
            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    // --------------blogs-------------------//
    getArticelsByUser:function (user_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/articles?user_id=' + user_id,
            type:"GET",
            async:true,
            success:function (err, data) {
                callback(data);
            },
            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    addArticleComment:function (text, article_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts_of_article',
            type:"POST",
            async:true,
            data:{"text":text, "article_id":article_id},
            success:function (data, err) {
                callback(err, data);
            },
            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    getArticleComments:function (article_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts_of_article/?article_id=' + article_id,
            type:"GET",
            async:true,
            success:function (data, err) {
                callback(err, data);
            },
            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    //method - "add" or "remove"
    voteOnArticleComment:function (post_article_id, method,user_info, callback) {
        db_functions.loggedInAjax({
            url:'/api/votes_on_article_comment',
            type:"POST",
            async:true,
            data:{"method":method, "post_article_id":post_article_id},
            user_info: user_info,
            success:function (data, err) {
                callback(err, data);
            },
            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    getPopularArticles:function (limit_number, callback) {
        db_functions.loggedInAjax({
            url:'/api/articles?order_by=-popularity_counter&limit=' + limit_number,
            type:"GET",
            async:true,
            success:function (data) {
                //    console.log(data);
                callback(data);
            }
        });
    },

    getUserArticlesByKeywords:function (user_id, keywords, sort_by, callback) {
        var keywords_arr = $.trim(keywords).replace(/\s+/g, ".%2B");
        db_functions.loggedInAjax({
            url:'/api/articles/?user_id=' + user_id + '&or=text__regex,,title__regex&title__regex=' + keywords_arr + '&title__regex=' + keywords_arr + '&text__regex=' + keywords_arr + '&order_by=' + sort_by,
            type:"GET",
            async:true,
            success:function (data, err) {
                callback(err, data)
            },
            error:function (err, data) {
                callback(err, null);
            }
        });
    },
    ///////--------------------------------------/////////

    getUserAfterFbConnect:function (access_token, callback) {
        this.loggedInAjax({
            url:'/api/fb_connect',
            type:"POST",
            async:true,
            data:{access_token:access_token},

            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },
    getUserbyEmail:function (email, callback) {
        this.loggedInAjax({
            url:'/api/users',
            type:"GET",
            async:true,
            data:{email:email},

            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    getOrCreateUserByFBid:function (user_fb_id, access_token) {
        db_functions.loggedInAjax({
            url:'/api/fb_connect',
            type:"Post",
            async:true,
            success:function (data) {
                console.log(data);

                callback(data);
            }
        });
    },

    registerUser:function (first_name, last_name, password, email, invitation, callback) {
        db_functions.loggedInAjax({
            url:'/account/register',
            type:"POST",
            async:true,
            success:function (err, data) {
                console.log(data);

                callback(data);
            },
            error:function (err, data) {
                callback(err);
            }
        });
    },

    register:function (name, email ,cycle, callback) {
        db_functions.loggedInAjax({
            url:'/api/register',
            type:"POST",
            data: {full_name: name,email:email,cycle:cycle},
            async:true,
            success:function (data,err ) {
                console.log(data);
                callback(err, data);
            },
            error:function (data,err ) {
                callback(err, data);
            }
        });
    },

    register_fb:function (cycle, callback) {
        db_functions.loggedInAjax({
            url:'/api/register',
            type:"POST",
            data: {fb:true,cycle:cycle},
            async:true,
            success:function (err, data) {
                console.log(data);
                callback(err, data);
            },
            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    getHotObjects:function (callback) {
        db_functions.loggedInAjax({
            url:'/api/hot_objects',
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);

                callback(data);
            }
        });
    },

    getAboutUruTexts:function (callback) {
        db_functions.loggedInAjax({
            url:'/api/about_uru_texts',
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(data);
            }
        });
    },

    getAboutUruItems:function (callback) {
        db_functions.loggedInAjax({
            url:'/api/about_uru_items',
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(data);
            }
        });
    },

    getTeam:function (callback) {
        db_functions.loggedInAjax({
            url:'/api/team',
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(data);
            }
        });
    },

    getFounders:function (callback) {
        db_functions.loggedInAjax({
            url:'/api/founders?limit=0',
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(data);
            }
        });
    },

    getQaItems:function (callback) {
        db_functions.loggedInAjax({
            url:'/api/qa',
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(data);
            }
        });
    },

    getElectionsItems:function (callback) {
        db_functions.loggedInAjax({
            url:'/api/elections_items',
            type:"GET",
            async:true,
            success:function (err, data) {
                callback(err, data);
            },

            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    getElectionsTexts:function (callback) {
        db_functions.loggedInAjax({
            url:'/api/elections_texts',
            type:"GET",
            async:true,
            success:function (err, data) {
                callback(err, data);
            },

            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    getPopularHeadlines:function (limit_number, callback) {
        db_functions.loggedInAjax({
            url:'/api/headlines?limit=' + limit_number,
            type:"GET",
            async:true,
            success:function (data) {
                //   console.log(data);
                callback(data);
            }
        });
    },

    addKilkul:function (text_field, callback) {
        db_functions.loggedInAjax({
            url:'/api/kilkuls',
            type:"POST",
            async:true,
            data:{"text_field":text_field},
            success:function (data) {
                callback(null, data);
            }
        });
    },

    getNotifications:function (user_id, limit, callback) {
        db_functions.loggedInAjax({
            url:'/api/notifications?' + (user_id ? '&user_id=' + user_id : '') + (limit ? '&limit=' + limit : ''),
            type:"GET",
            async:true,

            success:function (data) {
                callback(data);
            },
            error:function(err){
                callback(err);
            }
        });
    },

    getAndRenderFooterTags:function () {
        db_functions.loggedInAjax({
            url:'/api/tags?limit=10',
            type:'GET',
            async:true,
            success:function (data) {
                dust.render('footer_tags', data, function (err, out) {
                    $('#footer_tags').append(out);
                });
            }
        });
    },

    getAllSubjects:function (callback) {
        db_functions.loggedInAjax({
            url:'/api/subjects',
            type:"GET",
            async:true,
            success:function (data) {
                $.each(data.objects, function (index, obj) {
                    obj.word_count = function () {
                        return Math.min($.trim(obj.name).split(/\s+/).length, 3);
                    };
                });
                callback(null, data);
            },
            error:function (data) {
                callback(data);
            }
        });
    },
    getHotInfoItems:function (offset, callback) {
        db_functions.loggedInAjax({
            url:'/api/information_items/?is_hot_info_item=true&limit=6&offset=' + offset,
            type:"GET",
            async:true,
            success:function (data) {
                callback(null, data);
            },
            error:function (data) {
                callback(data);
            }
        });

    },

    getUserShopingCart:function (callback) {
        db_functions.loggedInAjax({
            url:'/api/shopping_cart',
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            }
        });
    },


    removeInfoItemFromShoppingCart:function (info_item_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/shopping_cart/' + info_item_id,
            type:"DELETE",
            async:true,
            success:function () {
//                          removeInfoItemFromUserShoppingCart(info_item_index);
                callback(null)
                console.log('info item deleted from shopping cart');
            }
        });
    },

	createInformationItem: function (data, callback) {
		db_functions.loggedInAjax({
			url: '/api/information_items/',
			type: 'POST',
			data: data,
			async: true,
			success: function () { callback(null); },
			error: function () { callback('error'); }
		});
	},

    getDiscussionTextField: function(discussion_id, callback){
        db_functions.loggedInAjax({
            url:'/api/discussions/' + discussion_id,
            type:"GET",
            async:true,
            success:function (data) {
                data = data.text_field;
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    createDiscussion: function(subject_id, vision, title, tags, image, user_info, callback) {
        db_functions.loggedInAjax({
            url:'/api/discussions/',
            type:"POST",
            async:true,
            data: {
                "subject_id": subject_id,
                //"subject_name": subject_name,
                "text_field": vision,
                "title": title,
                "tags": tags,
                "is_published": true,
                image_field: image
            },
            user_info: user_info,

            success: function(data) {
                if(data == 'canceled')
                    callback(data);
                else
                    callback(null, data);

            },

            error: function(err) {
                if (err.responseText == "vision can't be more than 800 words")
                    popupProvider.showOkPopup({message:"חזון הדיון צריך להיות 800 מילים לכל היותר"});
                if(err.responseText == "title can't be longer than 75 characters")
                    popupProvider.showOkPopup({message:"אורך כותרת החזון צריך להיות 75 אותיות לכל היותר"});
                else if (err.responseText == "you don't have the min amount of tokens to open discussion")
                    popupProvider.showOkPopup({message:"מצטערים, אין לך מספיק אסימונים..."});
                callback(err, null);
            }
        });
    },
    addSuggestionToDiscussion: function(discussion_id, vision_history_count, parts, explanation, user_info, callback) {
        db_functions.loggedInAjax({
            url:'/api/suggestions/',
            type:"POST",
            async:true,
            data:{"discussion_id":discussion_id, "parts":parts, "explanation":explanation, "vision_history_count": vision_history_count},
            user_info: user_info,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    editSuggestion: function(suggestion_id, text, callback) {
        db_functions.loggedInAjax({
            url:'/api/suggestions/' + suggestion_id,
            type:"PUT",
            async:true,
            data:{"text":text},
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err);
            }
        });
    },


    addFacebookRequest:function (link, response, callback) {
        var request_ids =response ? response.request :null;
        var to  =response ? response.to :null;
        $.ajax({
            url:'/api/fb_request/',
            type:"POST",
            async:true,
            contentType:'application/json',
            data:JSON.stringify({"link":link, "fb_request_ids":request_ids}),
            success:function (data) {
                data.response=  response;
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },
    getPostByDiscussion:function (discussion_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts?discussion_id=' + discussion_id,
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    removePost: function(post_id, callback){
        db_functions.loggedInAjax({
            url:'/api/posts/' +post_id,
            type:"delete",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err);
            }
        });
    },
    
    removeSuggestion: function(suggestion_id, callback){
        db_functions.loggedInAjax({
            url:'/api/suggestions/' +suggestion_id,
            type:"delete",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err);
            }
        });
    },

    removeSuggestionComment: function(comment_id, callback){
        db_functions.loggedInAjax({
            url:'/api/suggestion_posts/' +comment_id,
            type:"delete",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err);
            }
        });
    },

    getSpecialPostsByDiscussion: function(discussion_id, callback){
        db_functions.loggedInAjax({
            url:'/api/special_posts?discussion_id=' + discussion_id,
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    getPostByTypeByDiscussion:function(discussion_id, type, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts?discussion_id=' + discussion_id + '&order_by=-' + type + '&limit=1',
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },
    getCommentsBySuggestion:function (suggestion_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/suggestion_posts?suggestion_id=' + suggestion_id,
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },
    getCommentsByParentComment:function (post_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts_on_comment?post_id=' + post_id,
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    editDiscussionPost: function(post_id, text, callback){
        db_functions.loggedInAjax({
            url:'/api/posts/' + post_id,
            type:"PUT",
            data: {text: text},
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    addCommentToSuggestion : function(suggestion_id, discussion_id, text, callback){
        db_functions.loggedInAjax({
            url:'/api/suggestion_posts',
            type:"POST",
            data: {suggestion_id: suggestion_id, discussion_id: discussion_id, text: text},
            async:true,

            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    addCommentToPost : function(post_id, discussion_id, text, callback){
        db_functions.loggedInAjax({
            url:'/api/posts_on_comment',
            type:"POST",
            data: {post_id: post_id, discussion_id: discussion_id, text: text},
            async:true,

            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    getPostById:function (post_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts/' + post_id,
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    addLikeToInfoItem:function (info_item_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/likes',
            type:"POST",
            data:{"info_item_id":info_item_id},
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data)
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    addInfoItemToShoppingCart:function (info_item_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/shopping_cart/' + info_item_id,
            type:"PUT",
            async:true,
            success:function (data) {

                callback(null, data);
                console.log("item information inserted to shopping cart");
            }
        });
    },

    voteForPost:function (post_id, method, user_info, callback) {
        db_functions.loggedInAjax({
            url:'/api/votes/',
            type:"POST",
            async:true,
            data:{"post_id":post_id, "method":method},
            user_info: user_info,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    voteForSuggestion:function (suggestionId, method, user_info, callback) {
        db_functions.loggedInAjax({
            url:'/api/votes_on_suggestion/',
            type:"POST",
            async:true,
            data:{"suggestion_id":suggestionId, "method":method},
            user_info: user_info,
            success:function (data) {
                console.log(data);
                alert('success');
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });

    },

    addPostToDiscussion:function (discussion_id, post_content, refParentPostId, user_info, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts/',
            type:"POST",
            async:true,
            data:{"discussion_id":discussion_id, "text":post_content, "ref_to_post_id":refParentPostId},
            user_info: user_info,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                if (err.responseText != "not authenticated")
                    if (err.responseText == "must grade discussion first"){
                        var popupConfig = {};
                        popupConfig.message = 'אנא דרג קודם את החזון בראש העמוד.'
                        popupConfig.onOkCilcked = function(e){
                            e.preventDefault();
                            clicked = 'ok';
                            $.colorbox.close();
                            scrollTo('.segment.main .tags')
                        },
                            popupProvider.showOkPopup(popupConfig);
                    }
                callback(err, null);
            }
        });
    },

    getSortedPostByDiscussion:function (discussion_id, sort_by, offset, limit, callback) {
        if(typeof limit === 'function'){
            callback = limit;
            limit = 0;
        }

        db_functions.loggedInAjax({
            url:'/api/posts?discussion_id=' + discussion_id + "&order_by=" + sort_by + '&limit=' + limit + '&offset=' + offset,
            type:"GET",
            async:true,
            success:function (data) {
                console.log("posts are" + " " + data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },


    getPopularPostByCycle:function (discussion_id, sort_by, offset, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts?discussion_id=' + discussion_id + "&order_by=" + sort_by + '&offset=' + offset,
            type:"GET",
            async:true,
            success:function (data) {
                console.log("posts are" + " " + data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    addDiscussionGrade:function (discussion_id, grade, grade_id, user_info, callback) {
        var url = '/api/grades/';
        var type = "POST";

//        grade_id ? url = '/api/grades/' + grade_id : url = '/api/grades/';
//        grade_id ? type = "PUT" : type = "POST";

        if (grade_id && grade_id !== "undefined" && grade_id !== "0") {
            url = '/api/grades/' + grade_id;
            type = "PUT";
        }

        db_functions.loggedInAjax({
            url:url,
            type:type,
            async:true,
            data:{"discussion_id":discussion_id, "evaluation_grade":grade},
            user_info: user_info,
            success:function (data) {
                callback(null, data);
            },
            error:function (err) {
                if (err.responseText != "not authenticated")
                    alert(err.responseText);
                callback(err, null);
            }
        });
    },

    addSuggestionGrade:function (suggestion_id, discussion_id, grade, grade_id, user_info, callback) {
        var url;
        var type;

        grade_id ? url = '/api/grades_suggestion/' + grade_id : url = '/api/grades_suggestion/';
        grade_id ? type = "PUT" : type = "POST";

        db_functions.loggedInAjax({
            url:url,
            type:type,
            async:true,
            data:{"suggestion_id":suggestion_id, "discussion_id":discussion_id, "evaluation_grade":grade},
            user_info: user_info,
            success:function (data) {

                callback(null, data);
            },
            error:function (err) {
                if (err.responseText != "not authenticated"){
                    if (err.responseText == "must grade discussion first"){
                        var popupConfig = {};
                        popupConfig.message = 'אנא דרג קודם את החזון בראש העמוד.'
                        popupConfig.onOkCilcked = function(e){
                            e.preventDefault();
                            clicked = 'ok';
                            $.colorbox.close();
                            scrollTo('.segment.main .tags')
                        },
                        popupProvider.showOkPopup(popupConfig);
                    }
                }
                callback(err, null);
            }
        });
    },

    getDiscussionShoppingCart:function (discussion_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/discussions_shopping_cart?discussion_id=' + discussion_id,
            type:"GET",
            async:true,
            success:function (data) {
                //     console.log(data);
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    updateUserDetails:function (user_id, biography, callback) {
        db_functions.loggedInAjax({
            url:'/api/users/' + user_id,
            type:"PUT",
            data:JSON.stringify({biography:biography}),
            async:true,
            success:function (data) {
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            },
            dataType: 'json',
            processData: false,
            contentType: "application/json"
        });
    },

    joinOrLeaveUserFollowers:function (user_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/user_followers/' + user_id,
            type:"PUT",
            async:true,
            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    addOrRemoveProxyMandate:function (user_id, proxy_id, number_of_namdates, callback) {
        db_functions.loggedInAjax({
            url:'/api/user_proxies/' + user_id,
            type:"PUT",
            data:{proxy_id:proxy_id, req_number_of_tokens:number_of_namdates},
            async:true,
            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    deleteProxy:function (user_id, proxy_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/user_proxies/' + user_id,
            type:"DELETE",
            dara:{proxy_id:proxy_id   },
            async:true,
            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    getUserFollowers:function (user_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/user_followers/' + user_id ? user_id : "",
            type:"GET",
            async:true,
            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    getOnWhomUserFollows:function (user_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/users?followers.follower_id=' + user_id,
            type:"GET",
            async:true,
            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    getSuggestionByDiscussion:function (discussion_id, limit, offset, callback) {
        db_functions.loggedInAjax({
            url:'/api/suggestions?discussion_id=' + discussion_id + "&is_approved=false" + (limit ? '&limit=' + limit : '') + (offset ? '&offset=' + offset : ''),
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    getApprovedSuggestionsByDiscussion:function (discussion_id, limit, offset, callback) {
        db_functions.loggedInAjax({
            url:'/api/suggestions?discussion_id=' + discussion_id + "&is_approved=true&order_by=-approve_date" + (limit ? '&limit=' + limit : '') + (offset ? '&offset=' + offset : ''),
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },
    //actionType = follower or leave
    joinToDiscussionFollowers:function (discussion_id, actionType, callback) {
        db_functions.loggedInAjax({
            url:'/api/discussions/' + discussion_id + '/?put=' + actionType,
            data:{"follower":true},
            type:"PUT",
            async:true,
            success:function (data) {
                callback(null, data);
            }
        });
    },

    getListItems:function (type, query, callback) {
        var querystring;
        switch (type) {
            case "actions":
                querystring = "actions?is_approved=true&";
                break;

            case "pendingActions":
                querystring = "actions?is_approved=false&";
                break;

            default:
                querystring = type + '?';
                break;
        }
        db_functions.loggedInAjax({
            url: '/api/' + querystring + 'limit=0',
            data: query,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    getAllItemsByUser:function (api_resource, userID, callback) {
        var userIdParam;
        if (!userID) {
            userIdParam = '';
        }
        else {
            userIdParam = '&user_id=' + userID;
        }
        db_functions.loggedInAjax({
            url:'/api/' + api_resource + '?get=myUru' + userIdParam,
            type:"GET",
            async:true,
            success:function (data) {
                callback(null, data);
            }
        });
    },

    getItemsCountByTagName:function (tag_name, callback) {
        db_functions.loggedInAjax({
            url:'/api/items_count_by_tag_name' + (tag_name ? '?tag_name=' + encodeURIComponent(tag_name) : ''),
            type:"GET",
            async:true,
            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },


    getTagsBySearchTerm:function (search_term, callback) {
        db_functions.loggedInAjax({
            url:'/api/tags?tag__contains=' + search_term,
            type:"GET",
            async:true,
            success:function (data) {
                callback(search_term, null, data);
            },
            error:function (err) {
                callback(search_term, err, null);
            }
        });
    },

    getItemsByTagNameAndType:function (type, tag_name, page, callback) {
        this.loggedInAjax({
            url:'/api/' + type + '?limit=3&offset=' + (page * 3) + (encodeURIComponent(tag_name) ? '&tags=' + encodeURIComponent(tag_name) : ''),
            type:"GET",
            async:true,
            success:function (data) {
                callback(null, data);
            }
        });
    },

    getDiscussionsByTagName:function (tag_name, callback) {
        db_functions.loggedInAjax({
            url:'/api/discussions' + (tag_name ? '?tags=' + tag_name : ''),
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            }
        });
    },


    getDiscussionsById:function (discussion_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/discussions/' + discussion_id,
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            }
        });
    },

    //---------------------cycles-----------------------//
    getCyclesByTagName:function (tag_name, callback) {
        db_functions.loggedInAjax({
            url:'/api/cycles' + (tag_name ? '?tags=' + tag_name : ''),
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            }
        });
    },

    getCyclesById:function (cycle_id,page_check, callback) {
        db_functions.loggedInAjax({
            url:'/api/cycles/' + cycle_id,
            type:"GET",
            async:true,
            data:{fb_page_check:page_check},
            success:function (err, data) {
                callback(err, data);
            },
            error:function (err, data) {
                callback(err, data);
            }
        });
    },



    getCycleUpdates:function (cycle_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/updates/?cycle=' + cycle_id,
            type:"GET",
            async:true,
            success:function (data, err) {
                callback(err, data);
            },
            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    getCycleShoppingCart:function (cycle_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/cycles_shopping_cart?cycle_id=' + cycle_id,
            type:"GET",
            async:true,
            success:function (data, err) {
                callback(err, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    getCyclePosts:function (cycle_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/cycle_posts?cycle_id=' + cycle_id,
            type:"GET",
            async:true,

            success:function (data, err) {
                callback(err, data);
            },

            error:function (err) {
                callback(err);
            }
        });
    },

    getCylceFollowers:function (cycle_id, page, callback) {
        db_functions.loggedInAjax({
            url:'/api/users?cycles.cycle_id=' + cycle_id + '&limit = 14' + '&offset=' + (page * 14),
            type:"GET",
            async:true,
            success:function (data, err) {
                data.objects = $.map(data.objects/*followers*/, function (follower) {
                    var curr_cycle;
                    for (var i = 0; i < follower.cycles.length; i++) {
                        if (follower.cycles[i].cycle_id == cycle_id)
                            curr_cycle = follower.cycles[i];

                    }

                    return {

                        _id:follower.id,
                        first_name: follower.first_name,
                        last_name: follower.last_name,
                        avatar_url: follower.avatar_url,
                        join_date:curr_cycle.join_date


                    }
                })
                callback(data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    joinToCycleFollowers:function (cycle_id,force_join, callback) {
        db_functions.loggedInAjax({
            url:'/api/cycles/' + cycle_id + '?force='+force_join,
            type:"PUT",
            async:true,
            success:function (data) {
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    getCycleTimeline:function (cycle_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/cycle_timeline?cycle_id=' + cycle_id,
            type:"GET",
            async:true,
            success:function (data) {
                callback(null, data);
            }
        });
    },

    getLikedCyclePages:function ( callback) {
        db_functions.loggedInAjax({
            url:'/api/cycle_pages',
            type:"GET",
            async:true,
            success:function (data) {
                callback(null, data);
            }
        });
    },



    //---------------------------------------------------//


    //----------------------actions----------------------//

    createAction:function (data, user_info, callback) {
        db_functions.loggedInAjax({
            url:'/api/actions',
            type:"POST",
            async:true,
            data: data,
            user_info: user_info,
            success:function (data) {
                callback(null, data);
            },
            error:function (err) {
                callback(err);
            }
        });
    },

    getActionsByTagName:function (tag_name, callback) {
        db_functions.loggedInAjax({
            url:'/api/actions' + (tag_name ? '?tags=' + tag_name : ''),
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            }
        });
    },

    getPendingActionsByCycle:function (cycle_id, limit, callback) {
        db_functions.loggedInAjax({
            url:'/api/actions/?cycle_id.cycle=' + cycle_id + '&is_approved=false' + (limit ? '&limit=' + limit : ''),
            type:"GET",
            async:true,
            success:function (data, err) {
                callback(data);
            }
        });
    },

    getApprovedActionsByCycle:function (cycle_id, limit, callback) {
        db_functions.loggedInAjax({
            url:'/api/actions/?cycle_id.cycle=' + cycle_id + '&is_approved=true' + (limit ? '&limit=' + limit : ''),
            type:"GET",
            async:true,
            success:function (data, err) {
                callback(data);
            }
        });
    },

    joinOrLeaveAction:function (action_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/join/',
            type:"POST",
            data:{action_id:action_id},
            async:true,
            /*user_info: user_info,*/
            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err);
            }
        });
    },

    getActionGoing:function (action_id, offset, paging, callback) {
        db_functions.loggedInAjax({
            //limit=3&offset=' + (page*3)
            url:'/api/join/?action_id=' + action_id + '&offset=' + (paging * offset) + '&limit=' + paging,
            type:"GET",

            async:true,
            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err, null);
            }
        });
    },

    getPostByAction:function (action_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts_of_action?action_id=' + action_id,
            type:"GET",
            async:true,
            success:function (err, data) {
                console.log(err, data);
                callback(null, data);
            },
            error:function (err) {
                callback(err);
            }
        });
    },

    getSortedPostByAction:function (action_id, sort_by, offset, limit, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts_of_action?action_id=' + action_id + "&order_by=" + sort_by + '&offset=' + offset,
            type:"GET",
            async:true,
            success:function (data) {
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    getActionShoppingCart:function (action_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/actions_shopping_cart?action_id=' + action_id,
            type:"GET",
            async:true,
            success:function (data) {
                callback(null, data);
            },

            error:function (err) {
                callback(err);
            }
        });
    },

    addPostToAction:function (action_id, post_content, refParentPostId, user_info, callback) {
        db_functions.loggedInAjax({
            url:'/api/posts_of_action/',
            type:"POST",
            async:true,
            data:{"action_id":action_id, "text":post_content, "ref_to_post_id":refParentPostId},
            user_info: user_info,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err);
            }
        });
    },

    voteForActionPost:function (post_id, method, user_info, callback) {
        db_functions.loggedInAjax({
            url:'/api/votes_on_action_post/',
            type:"POST",
            async:true,
            data:{"post_action_id":post_id, "method":method},
            user_info: user_info,
            success:function (data) {
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    addSuggestionToAction:function (action_id, parts, explanation, user_info, callback) {
        db_functions.loggedInAjax({
            url:'/api/action_suggestions/',
            type:"POST",
            async:true,
            data:{"action_id":action_id, "parts":parts, "explanation":explanation},
            user_info: user_info,
            success:function (data) {
                callback(null, data);
            },
            error:function (err) {
                callback(err);
            }
        });
    },

    addActionGrade:function (action_id, grade, grade_id, user_info, callback) {
        var url = '/api/action_grades/';
        var type = "POST";

        if (grade_id && grade_id !== "undefined" && grade_id !== "0") {
            url = '/api/action_grades/' + grade_id;
            type = "PUT";
        }

        db_functions.loggedInAjax({
            url:url,
            type:type,
            async:true,
            data:{"action_id":action_id, "evaluation_grade":grade},
            user_info: user_info,
            success:function (data) {

                callback(null, data);
            },
            error:function (err) {
                if (err.responseText != "not authenticated")
                    alert(err.responseText);
                callback(err, null);
            }
        });
    },

    addActionSuggestionGrade:function (suggestion_id, action_id, grade, grade_id, callback) {
        var url;
        var type;

        grade_id ? url = '/api/action_suggestion_grades/' + grade_id : url = '/api/action_suggestion_grades/';
        grade_id ? type = "PUT" : type = "POST";

        db_functions.loggedInAjax({
            url:url,
            type:type,
            async:true,
            data:{"suggestion_id":suggestion_id, "action_id":action_id, "evaluation_grade":grade},
            success:function (data) {

                callback(null, data);
            },
            error:function (err) {
                if (err.responseText != "not authenticated")
                    if (err.responseText == "must grade discussion first")
                        popupProvider.showOkPopup({message:'אנא דרג קודם את החזון בראש העמוד.'})
                callback(err, null);
            }
        });
    },

    getSuggestionByAction:function (action_id, limit, offset, callback) {
        db_functions.loggedInAjax({
            url:'/api/action_suggestions?action_id=' + action_id + "&is_approved=false" + (limit ? '&limit=' + limit : '') + (offset ? '&offset=' + offset : ''),
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    //action_resources == [id: (action_resource_id), amount: (to add or remove to/from user)]
    addOrRemoveResourceToAction: function(action_id, action_resources, callback){
        db_functions.loggedInAjax({
            url:'/api/user_helps_action/' + action_id,
            type:"PUT",
            async:true,
            data: {action_resources: action_resources},
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    createNewActionResource: function(action_id, resource_name, amount, amountBringing, user_id, callback){
        db_functions.loggedInAjax({
            url:'/api/action_resources/',
            type:"POST",
            async:true,
            data: {name: resource_name, action_id: action_id, amount: amount, amountBringing: amountBringing, user_id: user_id},
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    //---------------------------------------------------//

    getDiscussionHistory:function (discussion_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/discussions_history/?discussion_id=' + discussion_id,
            type:"GET",
            async:true,
            success:function (err, data) {
                callback(null, data);
            },

            error:function (err, data) {
                callback(err, data);
            }
        });
    },


    getInfoItemsByTagName:function (tag_name, callback) {
        db_functions.loggedInAjax({
            url:'/api/information_items' + (tag_name ? '?tags=' + tag_name : ''),
            type:"GET",
            async:true,
            success:function (data) {

                console.log(data);
                callback(null, data);
            }
        });
    },

    getInfoItemsOfSubjectByKeywords: function (keywords, subject_id, sort_by, callback) {
        var keywords_arr = $.trim(keywords).replace(/\s+/g, ".%2B");
        db_functions.loggedInAjax({
            url:'/api/information_items/?or=text_field__regex,text_field_preview__regex,title__regex&title__regex=' + keywords_arr + '&text_field__regex=' + keywords_arr + '&text_field_preview__regex=' + keywords_arr + '&subject_id=' + subject_id + '&order_by=' + sort_by,
            type:"GET",
            async:true,
            success:function (data) {
                console.log(data);
                callback(null, data)
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    submitInvitedFriends: function (object_type,object_id,facebook_ids,emails, callback) {

        db_functions.loggedInAjax({
            url:'/api/user_invited_friends',
            type:"POST",
            async:true,
            data:{type:object_type, id:object_id,email:emails,facebook:facebook_ids},
            success:function (data, err) {
                callback(err, data);
            },
            error:function (err, data) {
                callback(err, data);
            }
        });
    },

    counterIncrease:function (counter,callback) {

        $.ajax({
            url:'/api/counter/',
            type:"POST",
            async:true,
            data: {counter:counter },
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    },

    updateMailNotification: function(user_id, data, callback){
        $.ajax({
            url:'/api/user_mail_notification_config/' + user_id,
            type:"PUT",
            async:true,
            data: data,
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    }   ,
    activateMailNotification: function (user_id, callback) {
        db_functions.loggedInAjax({
            type: 'PUT',
            async:true,
            url: '/api/user_mail_notification_config/' + user_id,
            data: {activate: true},
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err, null);
            }
        });
    } ,
    getPressItemsByDiscussion: function(discussion_id, callback) {
        db_functions.loggedInAjax({
            url:'/api/press_item',
            type:"GET",
            async:true,
            data:{"discussion_id":discussion_id, "limit":0},
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err);
            }
        });
    },

    sendMailFromUserToSystem: function(mail_config, callback) {
        db_functions.loggedInAjax({
            url:'/api/send_mail',
            type:"POST",
            async:true,
            data:{"mail_config":mail_config},
            success:function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function (err) {
                callback(err);
            }
        });
    },
};


