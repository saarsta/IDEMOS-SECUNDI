


var db_functions = {

    loggedInAjax: function(options)
    {
        var onError = options.error || function()
        {
            console.log(arguments[2]);
        };
        options.error =  function (xhr, ajaxOptions, thrownError) {
            if(xhr.status == 401 && xhr.responseText == 'not authenticated'){
                connectPopup(function(){
                    onError(xhr,ajaxOptions,thrownError);
                });
            }
            else
                onError(xhr,ajaxOptions,thrownError);
        };
        $.ajax(options);
    },

    getHotObjects: function(callback){
        this.loggedInAjax({
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
        this.loggedInAjax({
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
        this.loggedInAjax({
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
        this.loggedInAjax({
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
        this.loggedInAjax({
            url: '/api/success_stories',
            type: "GET",
            async: true,
            success: function (data) {
                callback(data);
            }
        });
    },
    getNotifications: function(callback){
        this.loggedInAjax({
            url: '/api/notifications?limit=3',
            type: "GET",
            async: true,
            success: function (data) {
                callback(data);
            }
        });
    },
    getAndRenderFooterTags:function()
    {
        this.loggedInAjax({
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
        this.loggedInAjax({
            url: '/api/subjects?limit=7',
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
        this.loggedInAjax({
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
        this.loggedInAjax({
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
        this.loggedInAjax({
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

    createDiscussion: function(subject_id, subject_name, vision, title, tags, callback){
        this.loggedInAjax({
            url: '/api/discussions/',
            type: "POST",
            async: true,
            data: {"subject_id": subject_id, "subject_name": subject_name, "vision_text": vision, "title": title, "tags": tags, "is_published": true},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error:function(err){
                callback(err, null);
            }
        });
    },
    addSuggestionToDiscussion: function(discussion_id, parts, explanation, callback){
        this.loggedInAjax({
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
    getPostByDiscussion: function(discussion_id, callback){
        this.loggedInAjax({
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

    addLikeToInfoItem: function(info_item_id, callback){
        this.loggedInAjax({
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
        this.loggedInAjax({
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
        this.loggedInAjax({
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
        this.loggedInAjax({
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
        this.loggedInAjax({
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
        this.loggedInAjax({
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

        if(grade_id && grade_id !== "undefined"){
            url = '/api/grades/' + grade_id;
            type = "PUT";
        }

        this.loggedInAjax({
            url: url,
            type: type,
            async: true,
            data: {"discussion_id": discussion_id, "evaluation_grade": grade},
            success: function (data) {

                callback(null, data);
            },
            error:function(err){
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

        this.loggedInAjax({
            url: url,
            type: type,
            async: true,
            data: {"suggestion_id": suggestion_id, "discussion_id": discussion_id, "evaluation_grade": grade},
            success: function (data) {

                callback(null, data);
            },
            error:function(err){
                alert(err.responseText);
                callback(err, null);
            }
        });
    },

    getDiscussionShoppingCart: function(discussion_id, callback){
        this.loggedInAjax({
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

    joinOrLeaveUserFollowers: function(user_id, callback){
        this.loggedInAjax({
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
    getSuggestionByDiscussion: function(discussion_id,limit, offset, callback){
        this.loggedInAjax({
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
        debugger;
        this.loggedInAjax({
            url: '/api/' + querystring,
            data:query,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    }

};
