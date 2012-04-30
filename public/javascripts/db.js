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

    if(callback)
        callback
}

var db_functions = {




    loggedInAjax: function(options)
    {
        var onError = options.error || function()
        {
            console.log(arguments[2]);
        };
        options.error =  function (xhr, ajaxOptions, thrownError) {
            if(thrownError == 401){
                connectPopup(onError);
            }
            else
                onError();
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
                   $('#subjects_list').append(out);

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
        $.ajax({
            url: '/api/information_items?tags=' + tag_name,
            type: "GET",
            async: true,
            success: function (data) {

                console.log(data);
                callback(null, data);
                /*$('#information_items_list').empty();
                dust.renderArray('information_item', data.objects,function(err,out)
                {
                    $('#information_items_list').append(out);
                });

                $('#search_results').show();
                */
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                callback(err, null);
            }
        });
    },

    addInfoItemToShoppingCart: function(info_item_id, callback){
        $.ajax({
            url: '/api/shopping_cart/' + info_item_id,
            type: "PUT",
            async: true,
            success: function (data) {

                callback(null, data);
                console.log("item information inserted to shopping cart");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert(thrownError);
            }
        });
    },

    removeInfoItemFromShoppingCart: function(info_item_id, callback){
        $.ajax({
            url: '/api/shopping_cart/' + info_item_id,
            type: "DELETE",
            async: true,
            success: function () {
//                          removeInfoItemFromUserShoppingCart(info_item_index);
                callback(null)
                console.log('info item deleted from shopping cart');
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError);
                console.log('error delete info item from shoping cart');
            }
        });
    },

    getUserShopingCart: function(callback){
        $.ajax({
            url: '/api/shopping_cart',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError, null);
            }

        });
    },

    getUsersByCycle: function(cycle_id, callback){
        $.ajax({
            url: '/api/users?cycles=' + cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }

        });
    },

    getUsersByDiscussion: function(discussion_id, callback){
        $.ajax({
            url: '/api/users?discussions=' + discussion_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }

        });
    },

    getHotInfoItems: function(){
        $.ajax({
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
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error with hot items');
            }
        });

    },

    getHotObjects: function(resource, callback){
        $.ajax({
            url: '/api/' + resource + '/?is_hot_object=true',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });

    },

    getInfoItemsOfSubjectByKeywords: function(keywords, subject_id, callback){
        var keywords_arr = keywords.trim().replace(/\s+/g,".%2B");
        $.ajax({
            url: '/api/information_items/?text_field__regex='+ keywords_arr + '&text_field_preview__regex='+ keywords_arr + '&subject_id=' + subject_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data)
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                callback(thrownError, null);

            }

        });
    },

    getDiscussionById: function(discussion_id, callback){
        $.ajax({
            url: '/api/discussions/'+ discussion_id /*+ "&is_published=true"  i check it in the server - if isnt published only creator can sea it*/,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);

                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('error');
            }

        });
    },

    getDiscussionsByTagName: function(tag_name){
        $.ajax({
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
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    getDiscussionsBySubject: function(subject_id, callback){
        $.ajax({
            url: '/api/discussions/?subject_id=' + subject_id + "&is_published=true",
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                callback(thrownError, null);
            }
        });
    },

    getAllDiscussions: function(callback){
        $.ajax({
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
            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('error');
            }
        });
    },


    createPreviewDiscussion: function(subject_id, vision, title, callback){
        $.ajax({
            url: '/api/discussions/',
            type: "POST",
            async: true,
                data: {"subject_id": subject_id, "title": title, "vision_text": vision},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('error');
            }
        });
    },

    createDiscussion: function(subject_id, subject_name, vision, title, tags, callback){
        console.log('data: {"subject_id": subject_id, "vision_text": vision, "title": title, "tags": tags, "is_published": true},');
        $.ajax({
            url: '/api/discussions/',
            type: "POST",
            async: true,
            data: {"subject_id": subject_id, "subject_name": subject_name, "vision_text": vision, "title": title, "tags": tags, "is_published": true},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert(' createDiscussion error');
            }
        });
    },

    diployDiscussion: function(created_discussion_id, callback){
        $.ajax({
            url: '/api/discussions/' + created_discussion_id,
            type: "PUT",
            async: true,
            success: function () {
                callback(null);
                console.log("item information inserted to discussion shopping cart");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError);
                alert('error');
            }
        });
    },

    getDiscussionShoppingCart: function(discussion_id, callback){

        $.ajax({
            url: '/api/discussions_shopping_cart?discussion_id=' + discussion_id,
            type: "GET",
            async: true,
            success: function (data) {
           //     console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            //    alert('error');
            }

        });
    } ,

    addInfoItemToDiscussionShoppingCart: function(info_item_id, created_discussion_id, callback){
        $.ajax({
            url: '/api/discussions_shopping_cart/' + info_item_id,
            type: "PUT",
            async: true,
            data: {"discussion_id": created_discussion_id},
            success: function () {
                callback(null);
                console.log("item information inserted to discussion shopping cart");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError);
                alert('error');
            }
        });
    },

    deleteInfoItemFromDiscussionShoppingCart: function(info_item_id, created_discussion_id){
        $.ajax({
            url: '/api/discussions_shopping_cart/' + info_item_id + '/?discussion_id=' + created_discussion_id,
            type: "DELETE",
            async: true,
            success: function () {
                console.log("item information inserted to discussion shopping cart");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    addLikeToInfoItem: function(info_item_id, callback){
        $.ajax({
            url: '/api/likes',
            type: "POST",
            data: {"info_item_id" : info_item_id},
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data)
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                console.log(thrownError);
            }
        });
    },

    getPostByDiscussion: function(discussion_id, callback){
        $.ajax({
            url: '/api/posts?discussion_id=' + discussion_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log("posts are" + " " + data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('get Posts error');
            }
        });
    },

    getSortedPostByDiscussion: function(discussion_id, sort_by, callback){
        $.ajax({
            url: '/api/posts?discussion_id=' + discussion_id + "&" + sort_by,
            type: "GET",
            async: true,
            success: function (data) {
                console.log("posts are" + " " + data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('get Posts error');
            }
        });
    },

    voteForPost: function(post_id, method, callback){
        $.ajax({
            url: '/api/votes/',
            type: "POST",
            async: true,
            data: {"post_id": post_id, "method": method},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError)
                callback(thrownError, null);
            }
        });
    },

    addPostToDiscussion: function(discussion_id, post_content, callback){

        $.ajax({
            url: '/api/posts/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "text": post_content},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError)
                callback(thrownError, null);
                alert('create Post error');
            }
        });
    },

    getDiscussionPostsByTokens: function(discussion_id, limit_number, callback){
        $.ajax({
            url: '/api/posts?discussion_id=' + discussion_id + '&is_comment_on_action=false&order_by=-tokens&limit=' + limit_number,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError)
                callback(thrownError, null);
                alert('get Posts error');
            }
        });
    },

    addSuggestionToDiscussion: function(discussion_id, parts, callback){

        $.ajax({
            url: '/api/suggestions/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "parts": parts},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError)
                callback(thrownError, null);
                alert('create Post error');
            }
        });
    },
    //this post/change_suggestion has ref to a post/suggestion/vision
    addCommentPostToDiscussion: function(discussion_id, post_content, ref_to_post_id, is_comment_on_vision, callback){

        $.ajax({
            url: '/api/posts/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "text": post_content, "ref_to_post_id": ref_to_post_id, "is_comment_on_vision": is_comment_on_vision},
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('create Post error');
            }
        });
    },

    getPopularPostsByAction: function(action_id, callback){

        $.ajax({
            url: '/api/posts_action/',
            type: "Get",
            async: true,
            data: {"action_id": action_id, "text": post_content, "ref_to_post_id": ref_to_post_id, "is_comment_on_vision": is_comment_on_vision},
            success: function (data) {
                //console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
              //  alert('create Post error');
            }
        });
    },

    addDiscussionGrade: function(discussion_id, grade, callback){
        $.ajax({
            url: '/api/grades/',
            type: "POST",
            async: true,
            data: {"discussion_id": discussion_id, "evaluation_grade": grade},
            success: function (data) {
                callback(null, data);

            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);

            }
        });
    },

    getAllCycles: function(){
        $.ajax({
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
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    getCycleById: function(cycle_id, callback){
        $.ajax({
            url: '/api/cycles/'+ cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);

            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);

            }
        });
    },

    getPopularPostsByCycleId: function(cycle_id, callback){
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
    },

    joinToCycleFollowers: function(cycle_id, callback){
        $.ajax({
            url: '/api/cycles/'+ cycle_id,
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);

            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);

            }
        });
    },

    joinToDiscussionFollowers: function(discussion_id, callback){
        $.ajax({
            url: '/api/discussions/'+ discussion_id + '/?put=follower',
            data: {"follower": true},
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);

            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);

            }
        });
    },

     getActionById: function(action_id, callback){
        $.ajax({
            url: '/api/actions_populated/' + action_id,
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    getCyclesByTagName: function(tag_name){
        $.ajax({
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
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    getCyclesBySubject: function(subject_id){
        $.ajax({
            url: '/api/cycles?subject_id=' + subject_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                $.each(data.objects, function(index, value){
                    $("select#sel_cycle").append($("<option />").val(value._id).text(value.title));
                });

            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    getAllCycles: function(callback){
        $.ajax({
            url: '/api/cycles',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
                callback(thrownError, null);
            }
        });
    },

    getApprovedActionByCycle: function(cycle_id, callback){
        $.ajax({
            url: '/api/actions?cycle_id='+ cycle_id + '&is_approved=true',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    getNotApprovedActionByCycle: function(cycle_id, callback){
        $.ajax({
            url: '/api/actions?cycle_id='+ cycle_id + '&is_approved=false',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    getAllPendingActions: function(callback){
        $.ajax({
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
        $.ajax({
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
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                // alert('error');
            }
        });
    },

    getCategories: function(callback){
        $.ajax({
            url: '/api/categories',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    getActionsByTagName: function(tag_name){
        $.ajax({
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
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    getActionsByCycle: function(cycle_id, callback){
        $.ajax({
            url: '/api/actions?is_approved=true&cycle_id=' + cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
            //    console.log(data);
                callback(null,data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
            //    console.log(thrownError);
                callback(thrownError);
            }
        });
    },

    getPendingActionsByCycle: function(cycle_id, callback){
        $.ajax({
            url: '/api/actions?is_approved=false&cycle_id=' + cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
               // console.log(data);
                callback(null,data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
               // console.log(thrownError);
                callback(thrownError,null);
            }
        });
    },

    getActionResoueces: function(callback){
        $.ajax({
            url: '/api/action_resources',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },


    addAction: function(cycle_id, title, description, action_resources, required_participants, execution_date, callback){
        $.ajax({
            url: '/api/actions',
            type: "POST",
            data: {"cycle_id": cycle_id, "title" : title, "description": description, "action_resources": action_resources  || [],
                   "required_participants": required_participants, "execution_date": execution_date},
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    getAllItemsByUser: function(api_resource, callback){
        $.ajax({
            url: '/api/' + api_resource + '?get=myUru',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    addUserToAction: function(action_id, callback){
        $.ajax({
            url: '/api/actions/' + action_id,
            type: "PUT",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    getAllItemsByUser: function(api_resource, callback){
        $.ajax({
            url: '/api/' + api_resource + '?get=myUru',
            type: "GET",
            async: true,
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    joinToAction: function(action_id, callback){
        $.ajax({
            url: '/api/joins/',
            type: "PUT",
            async: true,
            data: {"action_id": action_id},
            success: function (data) {
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
            }
        });
    },

    getUpdatesOfCycle: function(cycle_id, callback){

        $.ajax({
            url: '/api/updates/?cycles=' + cycle_id,
            type: "GET",
            async: true,
            success: function (data) {
              //  console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
              //  console.log(thrownError);
                callback(thrownError, null);
            }
        });
    },

    getSuccessStories: function(cycle_id, callback){

        $.ajax({
            url: '/api/success_stories',
            type: "GET",
            async: true,
            success: function (data) {
            //    console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
              //  console.log(thrownError);
                callback(thrownError, null);
            }
        });
    },

    getHeadlines: function(cycle_id, callback){

        $.ajax({
            url: '/api/headlines',
            type: "GET",
            async: true,
            success: function (data) {
             //   console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
             //   console.log(thrownError);
                callback(thrownError, null);
            }
        });
    },

    //blogs
    getPopularArticles: function(cycle_id, callback){

        $.ajax({
            url: '/api/articles?oreder_by=-popolarity_counter',
            type: "GET",
            async: true,
            success: function (data) {
            //    console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
            //    console.log(thrownError);
                callback(thrownError, null);
            }
        });
    }
}

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
