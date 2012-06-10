/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 22/02/12
 * Time: 14:33
 * To change this template use File | Settings | File Templates.
 */



dust.renderArray = function(template,arr,callback,endCallback)
{
    var out_arr = [];
    var _err = null;
    for(var i=0; i<arr.length; i++)
    {
        dust.render(template,arr[i],function(err,out){
            if(callback)
                callback(err,out);
            if(err)
                _err = err;
            out_arr.push(out);
        });
    }
    if(endCallback)
        endCallback(_err,out_arr.join(''));
};

var connectPopup = function(callback){

    //open popup window

    alert('please login');

    if(callback)
        callback();
};

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



    dbGetAllSubjects: function(useSmall){
        this.loggedInAjax({
            url: '/api/subjects',
            type: "GET",
            async: true,
            success: function (data) {
//                var size = data.objects.length;
                dust.renderArray(useSmall?'subject_small' :'subject',data.objects,null,function(err,out)
                {
                    var subjectslist=  $('#subjects_list');
                    subjectslist.empty();
                    subjectslist.append(out);
                    var subjects= $('#subjects_list').find('.subjectFilter').each(function() {
                        $(this).click(function (e){
                            var subject= $(this).find('span')[0].innerText;

                           // loadListItems('discussions','discussion_list_item',subject,'');

                        })

                    });


                });
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
    },

    getItemsByTagNameAndType: function(type,tag_name,callback)
    {
        this.loggedInAjax({
            url: '/api/' + type + (tag_name ? '?tags=' + tag_name : ''),
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    dbGetInfoItemsByTagName: function(tag_name, callback){
        this.loggedInAjax({
            url: '/api/information_items?tags=' + tag_name,
            type: "GET",
            async: true,
            success: function (data) {

                console.log(data);
                callback(null, data);
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

    getUsersByCycle: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/users?cycles=' + cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(data);
            }
        });
    },

    getUsersByDiscussion: function(discussion_id, callback){
        this.loggedInAjax({
            url: '/api/users?discussions=' + discussion_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(data);
            }
        });
    },

    getHotInfoItems: function(){
        this.loggedInAjax({
            url: '/api/information_items/?is_hot_info_item=true',
            type: "GET",
            async: true,
            success: function (data) {
                console.log("in hot info items");
                console.log(data);
                $('#hot_items_list').empty();
                dust.renderArray('hot_info_item', data.objects, null, function(err,out)
                {
                    $('#hot_items_list').append(out);
                    $('#hot_items_list img').autoscale();
                });
            }
        });

    },

    getHotObjects: function(callback){
        this.loggedInAjax({
            url: '/api/hot_objects',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
            },
            error:function(err){
                callback(err, null);
            }
        });

    },

    getInfoItemsOfSubjectByKeywords: function(keywords, subject_id, callback){
        var keywords_arr = keywords.trim().replace(/\s+/g,".%2B");
        this.loggedInAjax({
            url: '/api/information_items/?or=text_field__regex,text_field_preview__regex,title__regex&title__regex=' + keywords_arr + '&text_field__regex='+ keywords_arr + '&text_field_preview__regex='+ keywords_arr + '&subject_id=' + subject_id,
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
    },

    getDiscussionById: function(discussion_id, callback){
        this.loggedInAjax({
            url: '/api/discussions/'+ discussion_id /*+ "&is_published=true"  i check it in the server - if isnt published only creator can sea it*/,
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

    getDiscussionsByTagName: function(tag_name){
        this.loggedInAjax({
            url: '/api/discussions?tags=' + tag_name,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);

                $('#discussion').empty();
                dust.renderArray('information_item', data.objects,function(err,out)
                {
                    $('#discussion').append(out);
                });
            }
        });
    },

    getDiscussionsBySubject: function(subject_id, callback){
        this.loggedInAjax({
            url: '/api/discussions/?subject_id=' + subject_id + "&is_published=true",
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

    getAllDiscussions: function(callback){
        this.loggedInAjax({
            url: '/api/discussions',
           // url: '/discussionListTestData',
            type: "GET",
            async: true,

            success: function (data) {
                var size = data.objects.length;
                dust.renderArray('discussion_list_item',data.objects,null,function(err,out)
                {
                    $('#mainList').append(out);
                    $('#mainList img').autoscale();

                });
                if(callback) callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    },


    createPreviewDiscussion: function(subject_id, vision, title, callback){
        this.loggedInAjax({
            url: '/api/discussions/',
            type: "POST",
            async: true,
                data: {"subject_id": subject_id, "title": title, "vision_text": vision},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error:function(err){
                callback(err, null);
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

    diployDiscussion: function(created_discussion_id, callback){
        this.loggedInAjax({
            url: '/api/discussions/' + created_discussion_id,
            type: "PUT",
            async: true,
            success: function () {
                callback(null);
                console.log("item information inserted to discussion shopping cart");
            },
            error:function(err){
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
    } ,

    addInfoItemToDiscussionShoppingCart: function(info_item_id, created_discussion_id, callback){
        this.loggedInAjax({
            url: '/api/discussions_shopping_cart/' + info_item_id,
            type: "PUT",
            async: true,
            data: {"discussion_id": created_discussion_id},
            success: function () {
                callback(null);
                console.log("item information inserted to discussion shopping cart");
            },
            error:function(err){
                callback(err, null);
            }
        });
    },

    deleteInfoItemFromDiscussionShoppingCart: function(info_item_id, created_discussion_id){
        this.loggedInAjax({
            url: '/api/discussions_shopping_cart/' + info_item_id + '/?discussion_id=' + created_discussion_id,
            type: "DELETE",
            async: true,
            success: function () {
                console.log("item information inserted to discussion shopping cart");
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

    getSuggestionByDiscussion: function(discussion_id, callback){
        this.loggedInAjax({
            url: '/api/suggestions?discussion_id=' + discussion_id,
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

    getSortedPostByDiscussion: function(discussion_id, sort_by, callback){
        this.loggedInAjax({
            url: '/api/posts?discussion_id=' + discussion_id + "&" + sort_by,
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

    voteForPost: function(post_id, method, callback){
        this.loggedInAjax({
            url: '/api/votes/',
            type: "POST",
            async: true,
            data: {"post_id": post_id, "method": method},
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

    addPostToDiscussion: function(discussion_id, post_content, callback){
        this.loggedInAjax({
            url: '/api/posts/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "text": post_content},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    },

    getDiscussionPostsByTokens: function(discussion_id, limit_number, callback){
        this.loggedInAjax({
            url: '/api/posts?discussion_id=' + discussion_id + '&is_comment_on_action=false&order_by=-tokens&limit=' + limit_number,
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
    //this post/change_suggestion has ref to a post/suggestion/vision
    addCommentPostToDiscussion: function(discussion_id, post_content, ref_to_post_id, is_comment_on_vision, callback){

        this.loggedInAjax({
            url: '/api/posts/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "text": post_content, "ref_to_post_id": ref_to_post_id, "is_comment_on_vision": is_comment_on_vision},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },
            error:function(err){
                callback(err, null);
            }
        });
    },

    getPopularPostsByAction: function(action_id, callback){
        this.loggedInAjax({
            url: '/api/posts_of_action?action_id=' + action_id + '&order_by=-popularity',
            type: "Get",
            async: true,
            data: {"action_id": action_id},
            success: function (data) {
                //console.log(data);
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
                alert('discussion was graded !');
                callback(null, data);
            },
            error:function(err){
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
                callback(err, null);
            }
        });
    },

    getAllCycles: function(){
        this.loggedInAjax({
             //  url: '/api/cycles',
            url: '/api/cycles',
            type: "GET",
            async: true,
            success: function (data) {
                var size = data.objects.length;
                dust.renderArray('cycle_list_item',data.objects,null,function(err,out)
                {
                    $('#mainList').append(out);
                });
            }
        });
    },

    getCycleById: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/cycles/'+ cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);

            }
        });
    },

    //get posts by discussion replace it
    /*getPopularPostsByCycleId: function(cycle_id, callback){
        $.ajax({
            url: '/api/posts/'+ cycle_id + "&order_by=-popularity",
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);

            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);

            }
        });
    },*/

    getPopularPostsByDiscussionId: function(discussion_id, callback){
        this.loggedInAjax({
            url: '/api/posts?discussion_id=' + discussion_id + "&order_by=-popularity",
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);

            }
        });
    },

    joinToCycleFollowers: function(cycle_id, callback){
        this.loggedInAjax({
                url: '/api/cycles/'+ cycle_id + '/?put=follow',
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    leaveCycleFollowers: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/cycles/'+ cycle_id + '/?put=leave',
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    joinToDiscussionFollowers: function(discussion_id, callback){
        this.loggedInAjax({
            url: '/api/discussions/'+ discussion_id + '/?put=follower',
            data: {"follower": true},
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    leaveDiscussionFollowers: function(discussion_id, callback){
        this.loggedInAjax({
            url: '/api/discussions/'+ discussion_id + '/?put=leave',
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    getActionById: function(action_id, callback){
         this.loggedInAjax({
            url: '/api/actions_populated/' + action_id,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    getCyclesByTagName: function(tag_name){
        this.loggedInAjax({
            url: '/api/cycles?tags=' + tag_name,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                var length = data.objects.length;
                $('#cycle_list').empty();
                dust.renderArray('information_item', data.objects,function(err,out)
                {
                    $('#cycle_list').append(out);
                });
            }
        });
    },

    getCyclesBySubject: function(subject_id){
        this.loggedInAjax({
            url: '/api/cycles?subject_id=' + subject_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                $.each(data.objects, function(index, value){
                    $("select#sel_cycle").append($("<option />").val(value._id).text(value.title));
                });
            }
        });
    },

    getAllCycles: function(callback){
        this.loggedInAjax({
            url: '/api/cycles',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            }
        });
    },

    getApprovedActionByCycle: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/actions?cycle_id='+ cycle_id + '&is_approved=true',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    getNotApprovedActionByCycle: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/actions?cycle_id='+ cycle_id + '&is_approved=false',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    getAllPendingActions: function(callback){
        this.loggedInAjax({

            //url: '/actionListTestData',
            url: '/api/actions?is_approved=false',
            type: "GET",
            async: true,
            success: function (data) {
                var size = data.objects.length;
                dust.renderArray('pending_action_list_item',data.objects,null,function(err,out)
                {
                    $('#mainList').append(out);
                });
                if(callback) callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                if(callback) callback(thrownError, null);
                // alert('error');
            }
        });
    },


    getAllApprovedActions: function(callback){
        this.loggedInAjax({
            //  url: '/actionListTestData',
            url: '/api/actions?is_approved=true',
            type: "GET",
            async: true,
            success: function (data) {
                var size = data.objects.length;
                dust.renderArray('action_list_item',data.objects,null,function(err,out)
                {
                    $('#mainList').append(out);
                    $('#mainList img').autoscale();

                });
                if(callback) callback(null, data);
            }
        });
    },

    getCategories: function(callback){
        this.loggedInAjax({
            url: '/api/categories',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    getActionResourceByCategoryId: function(category_id, callback){
        this.loggedInAjax({
            url: '/api/action_resources?category=' + category_id,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    getActionsByTagName: function(tag_name){
        this.loggedInAjax({
            url: '/api/actions?tags=' + tag_name,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                $('#action_list').empty();
                dust.renderArray('action', data.objects,function(err,out)
                {
                    $('#action_list').append(out);
                });
            }
        });
    },

    getActionsByCycle: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/actions?is_approved=true&cycle_id=' + cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
            //    console.log(data);
                callback(null,data);
            }
        });
    },

    getPendingActionsByCycle: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/actions?is_approved=false&cycle_id=' + cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
               // console.log(data);
                callback(null,data);
            }
        });
    },

    getPendingActionsByCycleOrederedByCreationDate: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/actions?is_approved=false&cycle_id=' + cycle_id + '&order_by=-creation_date&limit=3',
            type: "GET",
            async: true,
            success: function (data) {
                // console.log(data);
                callback(null,data);
            }
        });
    },

    getActionResoueces: function(callback){
        this.loggedInAjax({
            url: '/api/action_resources',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },


    addAction: function(cycle_id, title, description, action_resources, required_participants, execution_date, location, callback){
        this.loggedInAjax({
            url: '/api/actions',
            type: "POST",
            data: {"cycle_id": cycle_id, "title" : title, "description": description, "action_resources": [],
                   "required_participants": required_participants, "execution_date": execution_date, "location": ""},
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },



    addUserToAction: function(action_id, callback){
        this.loggedInAjax({
            url: '/api/actions/' + action_id,
            type: "PUT",
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
        this.loggedInAjax({
            url: '/api/' + api_resource + '?get=myUru'+userIdParam,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    joinToAction: function(action_id, callback){
        this.loggedInAjax({
            url: '/api/joins/',
            type: "POST",
            async: true,
            data: {"action_id": action_id},
            success: function (data) {
                callback(null, data);
            }
        });
    },

    leaveAction: function(join_id, callback){
        this.loggedInAjax({
            url: '/api/joins/' + join_id,
            type: "DELETE",
            async: true,

            success: function (data) {
                callback(null, data);
            }
        });
    },

    getUpdatesOfCycle: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/updates/?cycles=' + cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
              //  console.log(data);
                callback(null, data);
            }
        });
    },

    getSuccessStories: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/success_stories',
            type: "GET",
            async: true,
            success: function (data) {
            //    console.log(data);
                callback(null, data);
            }
        });
    },

    getHeadlines: function(callback){
        this.loggedInAjax({
            url: '/api/headlines',
            type: "GET",
            async: true,
            success: function (data) {
             //   console.log(data);
                callback(null, data);
            }
        });
    },

    //blogs
   /* getPopularArticles: function(cycle_id, callback){
        this.loggedInAjax({
            url: '/api/articles?order_by=-popolarity_counter',
            type: "GET",
            async: true,
            success: function (data) {
            //    console.log(data);
                callback(null, data);
            }
        });
    },*/

    getPopularTags: function(){
        this.loggedInAjax({
            url: '/api/tags',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            }
        });
    },

    createKilkul: function(text_field, callback){
        this.loggedInAjax({
            url: '/api/kilkuls',
            type: "POST",
            async: true,
            data: {"text_field": text_field},
            success: function (data) {
                callback(null, data);
            }
        });
    }

};

/*dust.filters.str = function(value)
{
    return JSON.stringify(value);
};*/


$.prototype.autoscale = function(params)
{
    var obj = $(this);
    if(obj.length)
        image_autoscale(obj, params);
}

function image_autoscale(obj, params)
{

    params = params || {};
    var fadeIn = params['fade'] || 300;
    obj.css({width:'', height:''}).hide();
    obj.load(function()
    {
        var elm = $(this);
        var parent = $(elm.parent());
        parent.css({'overflow':'hidden'});
        var parent_width = parent.innerWidth();
        var parent_height = parent.innerHeight();
        var parent_prop = parent_width * 1.0 / parent_height;
        parent.css({position:'relative'});

        var width = elm.width();
        var height = elm.height();
        var prop = width * 1.0 / height;
        var top=0.0, left=0.0;
        if( prop < parent_prop)
        {
            width = parent_width;
            height = width / prop;
            top = (parent_height - height)/2;
        }
        else
        {
            height = parent_height;
            width = height * prop;
            left = (parent_width - width)/2;
        }

        elm.css({position:'absolute', width:width, height:height, top:top, left:left});
        elm.fadeIn(fadeIn)
    });

    obj.load();
};

dust.filters['date'] = function(a){
    return $.datepicker.formatDate('dd/mm', new Date(Date.parse(a)));;
};

dust.filters['time'] = function(a){
    return $.datepicker.formatDate('dd-mm-yy', new Date(Date.parse(a)));;
};

dust.filters['ago'] = function(a){
    var amount = 0, unit, units, ago = 'לפני';
    var timespan = new Date() - new Date(Date.parse(a));
    if(timespan < 0)
    {
        timespan *= -1;
        ago = 'עוד';
    }
    timespan /= 1000;
    var weeks = Math.floor(timespan / (7*24*3600));
    if(weeks)
    {
        amount = weeks;
        unit = 'שבוע';
        units = 'שבועות';
    }
    else
    {
        timespan = timespan % (7*24*3600);
        var days = Math.floor(timespan / (24*3600));
        if(days)
        {
            amount = days;
            unit = 'יום';
            units = "ימים";
        }
        else
        {
            timespan = timespan % (24*3600);
            var hours = Math.floor(timespan / (3600));
            if(hours)
            {
                amount = hours;
                unit = 'שעה';
                units = 'שעות';
            }
            else
            {
                timespan = timespan % 3600;
                var minutes = Math.floor(timespan / 60);
                if(minutes)
                {
                    amount = minutes;
                    units = 'דקות';
                    unit = "דקה";
                }
                else
                {
                    var seconds = Math.floor(timespan % 60);
                    amount = seconds;
                    units = "שניות";
                    unit = 'שנייה';
                }
            }
        }
    }
    return ago +  ' ' +
        (amount > 1 ? amount + ' ' + units : unit);

};
