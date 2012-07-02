


var db_functions = {

    loggedInAjax: function(options)
    {
        var onError = options.error || function()
        {
            console.log(arguments[2]);
        };
        options.error =  function (xhr, ajaxOptions, thrownError) {
            if(xhr.status == 401 && (xhr.responseText == 'not authenticated' || xhr.responseText == "Error: Unauthorized - there is not enought tokens" || xhr.responseText == "user must have a least 10 tokens to open create discussion")){
                if (xhr.responseText == 'not authenticated'){
                    connectPopup(function(){
                        onError(xhr,ajaxOptions,thrownError);
                    });
                }else if (xhr.responseText == 'Error: Unauthorized - there is not enought tokens')
                {
                    alert("אין מספיק אסימונים בשביל לבצע פעולה זו");
                }else if (xhr.responseText == "user must have a least 10 tokens to open create discussion")
                    alert("צריך מינימום של 10 אסימונים בשביל ליצור דיון");
            }
            else
                onError(xhr,ajaxOptions,thrownError);
        };
        $.ajax(options);
    },

    registerUser: function(first_name, last_name, password, email, invitation, callback){
        db_functions.loggedInAjax({
            url: '/account/register',
            type: "POST",
            async: true,
            success: function (err, data) {
                console.log(data);

                callback(data);
            },
            error:function(err, data)
            {
                callback(err);
            }
        });
    },

    getHotObjects: function(callback){
        db_functions.loggedInAjax({
            url: '/api/hot_objects',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);

                callback(data);
            }
        });
    },

    //blogs
    getPopularArticles: function(limit_number,callback){
        db_functions.loggedInAjax({
            url: '/api/articles?order_by=-popularity_counter&limit=' + limit_number,
            type: "GET",
            async: true,
            success: function (data) {
                //    console.log(data);
                callback( data);
            }
        });
    },

    getPopularHeadlines: function(limit_number,callback){
        db_functions.loggedInAjax({
            url: '/api/headlines?limit=' + limit_number,
            type: "GET",
            async: true,
            success: function (data) {
                //   console.log(data);
                callback( data);
            }
        });
    },

    addKilkul: function(text_field, callback){
        db_functions.loggedInAjax({
            url: '/api/kilkuls',
            type: "POST",
            async: true,
            data: {"text_field": text_field},
            success: function (data) {
                callback(null, data);
            }
        });
    },

    getSuccessStories: function(callback){
        db_functions.loggedInAjax({
            url: '/api/success_stories',
            type: "GET",
            async: true,
            success: function (data) {
                callback(data);
            }
        });
    },

    getNotifications: function(limit, callback){
        db_functions.loggedInAjax({
            url: '/api/notifications?' + (limit? '&limit='+limit:''),
            type: "GET",
            async: true,
            success: function (data) {
                callback(data);
            }
        });
    },
    getAndRenderFooterTags:function()
    {
        db_functions.loggedInAjax({
            url:'/api/tags?limit=10',
            type:'GET',
            async:true,
            success:function(data){
                dust.render('footer_tags',data,function(err,out)
                {
                    $('#footer_tags').append(out);
                });
            }
        });
    },

    getAllSubjects: function(callback){
        db_functions.loggedInAjax({
            url: '/api/subjects',
            type: "GET",
            async: true,
            success: function (data) {
                $.each(data.objects,function(index,obj)
                {
                    obj.word_count = function()
                    {
                        return Math.min($.trim(obj.name).split(/\s+/).length,3);
                    };
                });
                callback(null,data);
            },
            error:function(data)
            {
                callback(data);
            }
        });
    },
    getHotInfoItems: function(offset,callback){
        db_functions.loggedInAjax({
            url: '/api/information_items/?is_hot_info_item=true&limit=6&offset=' + offset,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null,data);
            },
            error:function(data){
                callback(data);
            }
        });

    }   ,

    getUserShopingCart: function(callback){
        db_functions.loggedInAjax({
            url: '/api/shopping_cart',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            }
        });
    },
    removeInfoItemFromShoppingCart: function(info_item_id, callback){
        db_functions.loggedInAjax({
            url: '/api/shopping_cart/' + info_item_id,
            type: "DELETE",
            async: true,
            success: function () {
//                          removeInfoItemFromUserShoppingCart(info_item_index);
                callback(null)
                console.log('info item deleted from shopping cart');
            }
        });
    },

    createDiscussion: function(subject_id, vision, title, tags, callback){
        db_functions.loggedInAjax({
            url: '/api/discussions/',
            type: "POST",
            async: true,
            data: {"subject_id": subject_id, "subject_name": subject_name, "text_field": vision, "title": title, "tags": tags, "is_published": true},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error:function(err){
                if(err.responseText == "vision can't be more than 800 words")
                    alert("חזון הדיון צריך להיות 800 מילים לכל היותר");
                callback(err, null);
            }
        });
    },
    addSuggestionToDiscussion: function(discussion_id, parts, explanation, callback){
        db_functions.loggedInAjax({
            url: '/api/suggestions/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "parts": parts, "explanation": explanation},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    },
    addFacebookRequest: function(link,request_ids ,callback){
        db_functions.loggedInAjax({
            url: '/api/fb_request/',
            type: "POST",
            async: true,
            contentType:'application/json',
            data: JSON.stringify({"link": link, "fb_request_ids": request_ids}),
            success: function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    },
    getPostByDiscussion: function(discussion_id, callback){
        db_functions.loggedInAjax({
            url: '/api/posts?discussion_id=' + discussion_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    },

    getPostById: function(post_id, callback){
        db_functions.loggedInAjax({
            url: '/api/posts/' + post_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    },

    addLikeToInfoItem: function(info_item_id, callback){
        db_functions.loggedInAjax({
            url: '/api/likes',
            type: "POST",
            data: {"info_item_id" : info_item_id},
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data)
            },
            error:function(err){
                callback(err, null);
            }
        });
    },

    addInfoItemToShoppingCart: function(info_item_id, callback){
        db_functions.loggedInAjax({
            url: '/api/shopping_cart/' + info_item_id,
            type: "PUT",
            async: true,
            success: function (data) {

                callback(null, data);
                console.log("item information inserted to shopping cart");
            }
        });
    },

    voteForPost: function(post_id, method, callback){
        db_functions.loggedInAjax({
            url: '/api/votes/',
            type: "POST",
            async: true,
            data: {"post_id": post_id, "method": method},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    },

    voteForSuggestion: function(suggestionId,method,callback)
    {
        db_functions.loggedInAjax({
            url: '/api/votes_on_suggestion/',
            type: "POST",
            async: true,
            data: {"suggestion_id": suggestionId, "method": method},
            success: function (data) {
                console.log(data);
                alert('success');
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });

    },



    addPostToDiscussion: function(discussion_id, post_content, refParentPostId, callback){
        db_functions.loggedInAjax({
            url: '/api/posts/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "text": post_content, "ref_to_post_id": refParentPostId},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    },

    getSortedPostByDiscussion: function(discussion_id, sort_by, callback){
        db_functions.loggedInAjax({
            url: '/api/posts?discussion_id=' + discussion_id + "&order_by=" + sort_by,
            type: "GET",
            async: true,
            success: function (data) {
                console.log("posts are" + " " + data);
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    },

    addDiscussionGrade: function(discussion_id, grade, grade_id, callback){
        var url = '/api/grades/';
        var type = "POST";

//        grade_id ? url = '/api/grades/' + grade_id : url = '/api/grades/';
//        grade_id ? type = "PUT" : type = "POST";

        if(grade_id && grade_id !== "undefined" && grade_id !== "0"){
            url = '/api/grades/' + grade_id;
            type = "PUT";
        }

        db_functions.loggedInAjax({
            url: url,
            type: type,
            async: true,
            data: {"discussion_id": discussion_id, "evaluation_grade": grade},
            success: function (data) {

                callback(null, data);
            },
            error:function(err){
                if(err.responseText != "not authenticated")
                    alert(err.responseText);
                callback(err, null);
            }
        });
    },
    addSuggestionGrade: function(suggestion_id, discussion_id, grade, grade_id, callback){
        var url;
        var type;

        grade_id ? url = '/api/grades_suggestion/' + grade_id : url = '/api/grades_suggestion/';
        grade_id ? type = "PUT" : type = "POST";

        db_functions.loggedInAjax({
            url: url,
            type: type,
            async: true,
            data: {"suggestion_id": suggestion_id, "discussion_id": discussion_id, "evaluation_grade": grade},
            success: function (data) {

                callback(null, data);
            },
            error:function(err){
                if(err.responseText != "not authenticated")
                    alert(err.responseText);
                callback(err, null);
            }
        });
    },

    getDiscussionShoppingCart: function(discussion_id, callback){
        db_functions.loggedInAjax({
            url: '/api/discussions_shopping_cart?discussion_id=' + discussion_id,
            type: "GET",
            async: true,
            success: function (data) {
                //     console.log(data);
                callback(null, data);
            },

            error:function(err){
                callback(err, null);
            }
        });
    },

    updateUserDetails: function(user_id, biography, callback){
        db_functions.loggedInAjax({
            url: '/api/users/' + user_id,
            type: "PUT",
            data: {biography: biography},
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error:function(err){
                callback(err, null);
            }
        });
    },

    joinOrLeaveUserFollowers: function(user_id, callback){
        db_functions.loggedInAjax({
            url: '/api/user_followers/' + user_id,
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error:function(err){
                callback(err, null);
            }
        });
    },


    addOrRemoveProxyMandate: function(user_id, proxy_id, number_of_namdates, callback){
        db_functions.loggedInAjax({
            url: '/api/user_proxies/' + user_id,
            type: "PUT",
            data: {proxy_id: proxy_id, req_number_of_tokens: number_of_namdates},
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error:function(err){
                callback(err, null);
            }
        });
    },

    deleteProxy: function(user_id, proxy_id, callback){
        db_functions.loggedInAjax({
            url: '/api/user_proxies/' + user_id,
            type: "DELETE",
            dara: {proxy_id: proxy_id   },
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error:function(err){
                callback(err, null);
            }
        });
    },
    
    getUserFollowers: function(user_id, callback){
        db_functions.loggedInAjax({
            url: '/api/user_followers/' + user_id ? user_id : "",
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error:function(err){
                callback(err, null);
            }
        });
    },

    getOnWhomUserFollows: function(user_id, callback){
        db_functions.loggedInAjax({
            url: '/api/users?followers.follower_id=' + user_id,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error:function(err){
                callback(err, null);
            }
        });
    },

    getSuggestionByDiscussion: function(discussion_id, limit, offset, callback){
        db_functions.loggedInAjax({
            url: '/api/suggestions?discussion_id=' + discussion_id + "&is_approved=false" + (limit? '&limit='+limit:'') + (offset? '&offset=' + offset:'') ,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    } ,
    //actionType = follower or leave
    joinToDiscussionFollowers: function(discussion_id,actionType, callback){
        db_functions.loggedInAjax({
            url: '/api/discussions/'+ discussion_id + '/?put='+actionType,
            data: {"follower": true},
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    getListItems : function(type,query,callback)
    {
        var querystring = type;
        switch(type)
        {
            case "actions":
                querystring = "actions?is_approved=true";
                break;
            case "pendingActions":
                querystring = "actions?is_approved=false";
                break;
        }
        db_functions.loggedInAjax({
            url: '/api/' + querystring,
            data:query,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },
    getAllItemsByUser: function(api_resource,userID, callback){
        var userIdParam;
        if(!userID){
            userIdParam='';
        }
        else{
            userIdParam='&user_id='+userID;
        }
        db_functions.loggedInAjax({
            url: '/api/' + api_resource + '?get=myUru'+userIdParam,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    getItemsCountByTagName: function(tag_name, callback){
        db_functions.loggedInAjax({
            url: '/api/items_count_by_tag_name' + (tag_name ? '?tag_name=' + tag_name : ''),
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error:function(err){
                callback(err, null);
            }
        });
    }   ,


    getTagsBySearchTerm: function(search_term, callback){
        db_functions.loggedInAjax({
            url: '/api/tags?tag__contains=' + search_term,
            type: "GET",
            async: true,
            success: function (data) {
                callback(search_term,null, data);
            },
            error:function(err){
                callback(search_term,err, null);
            }
        });
    }   ,

    getDiscussionsByTagName: function(tag_name, callback){
        db_functions.loggedInAjax({
            url: '/api/discussions' + (tag_name ? '?tags=' + tag_name : ''),
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            }
        });
    },

    getCyclesByTagName: function(tag_name, callback){
        db_functions.loggedInAjax({
            url: '/api/cycles' + (tag_name ? '?tags=' + tag_name : ''),
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            }
        });
    },
    getActionsByTagName: function(tag_name, callback){
        db_functions.loggedInAjax({
            url: '/api/actions' + (tag_name ? '?tags=' + tag_name : ''),
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            }
        });
    },

    getInfoItemsByTagName: function(tag_name, callback){
        db_functions.loggedInAjax({
            url: '/api/information_items' + (tag_name ? '?tags=' + tag_name : ''),
            type: "GET",
            async: true,
            success: function (data) {

                console.log(data);
                callback(null, data);
            }
        });
    },

    getBlogsByTagName:  function(tag_name, callback){
        db_functions.loggedInAjax({
            url: '/api/articles' + (tag_name ? '?tags=' + tag_name : ''),
            type: "GET",
            async: true,
            success: function (data) {

                console.log(data);
                callback(null, data);
            }
        });
    },

    getInfoItemsOfSubjectByKeywords: function(keywords, subject_id,sort_by, callback){
        var keywords_arr = $.trim(keywords).replace(/\s+/g,".%2B");
        db_functions.loggedInAjax({
            url: '/api/information_items/?or=text_field__regex,text_field_preview__regex,title__regex&title__regex=' + keywords_arr + '&text_field__regex='+ keywords_arr + '&text_field_preview__regex='+ keywords_arr + '&subject_id=' + subject_id+'&order_by='+sort_by,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data)
            },
            error:function(err){
                callback(err, null);
            }
        });
    }
};


