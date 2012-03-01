/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 22/02/12
 * Time: 14:33
 * To change this template use File | Settings | File Templates.
 */

var db_functions = {
    dbGetAllSubjects: function(){
        $.ajax({
            url: '/api/subjects',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                console.log(JSON.stringify(data));
                var size = data.objects.length;

                for (var i=0; i < size; i++){
                    var subject = data.objects[i];

                    var subject_link = $(document.createElement('a'))
                        .attr("id", 'subject_link_' + i);
                    subject_link.attr('href', "/account/selectedSubjectPage?subject_id="+subject._id + '&subject_name=' + subject.name);
                    subject_link.text(subject.name);
                    $('.subject').append(subject_link).append('<br />');

                    if (subject.is_hot){
                        var hot_subject_link = $(document.createElement('a'))
                            .attr("id", 'hot_subject_link_' + i);
                        hot_subject_link.attr('href', "/account/selectedSubjectPage?subject_id="+subject._id + '&subject_name=' + subject.name);
                        hot_subject_link.text(subject.name);
                        console.log(hot_subject_link);
                        $('.hot_subject').append(hot_subject_link).append('<br />');
                    }
                }
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },

    dbGetInfoItemsByTagName: function(tag_name){
        $.ajax({
            url: '/api/information_items?tags=' + tag_name,
            type: "GET",
            async: true,
            success: function (data) {

                console.log(data);

                var length = data.objects.length;

                if (length > 0){
                    var blank_row = $(document.createElement('p'))
                        .attr('id', 'tags_header');
                    blank_row.text('I FOUND THOSE ITEMS:');
                    $('.tags').append(blank_row);
                }else{
                    alert('no information items!');
                }

                for (var i in data.objects)
                    items.add(data.objects[i], "tags");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    },
    dbAddInfoItemToShoppingCart: function(info_item_id, callback){
        $.ajax({
            url: 'http://dev.empeeric.com/api/shopping_cart/' + info_item_id,
            type: "PUT",
            async: true,
            success: function () {
//                            addInfoItemToUserShoppingCart(info_item_index, info_item_id);
                callback(true);
                console.log("item information inserted to shopping cart");
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(false);
                alert('error');
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
                callback(data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }

        });
    },

    dbDeleteInfoItemFromShoppingCart: function(info_item_id){
        $.ajax({
            url: '/api/shopping_cart/' + info_item_id,
            type: "DELETE",
            async: true,
            success: function () {
//                          removeInfoItemFromUserShoppingCart(info_item_index);
                console.log('info item deleted from shopping cart');
            },

            error: function (xhr, ajaxOptions, thrownError) {
                console.log('error delete info item from shoping cart');
            }
        });
    },

    getInfoItemsOfSubjectByKeywords: function(keywords, subject_id, callback){
        console.log("inside getInfoItemsOfSubjectByKeywords:");
        var keywords_arr = keywords.trim().replace(/\s+/g,".%2B");

        console.log("keywords_arr: " + keywords_arr);



        console.log('/api/information_items/?text_field__regex='+ keywords_arr + '&subject_id=' + subject_id);
        $.ajax({
            url: '/api/information_items/?text_field__regex='+ keywords_arr + '&subject_id=' + subject_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);

                callback(true, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(false, null);
                alert('error');
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

    getDiscussionsBySubject: function(subject_id, callback){
        $.ajax({
            url: '/api/discussions/?subject_id=' + subject_id + "&is_published=true",
            type: "GET",
            async: true,
            success: function (data) {
//                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('error');
            }

        });
    },

    createPreviewDiscussion: function(subject_id, vision, callback){
        $.ajax({
            url: '/api/discussions/',
            type: "POST",
            async: true,
                data: {"subject_id": subject_id, "vision_text": vision},
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

    createDiscussion: function(subject_id, vision, title, callback){
        console.log('data: {"subject_id": subject_id, "vision_text": vision, "title": title, "is_published": true},');
        $.ajax({
            url: '/api/discussions/',
            type: "POST",
            async: true,
            data: {"subject_id": subject_id, "vision_text": vision, "title": title, "is_published": true},
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
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('error');
            }

        });
    } ,

    addInfoItemToDiscussionShoppingCart: function(info_item_id, created_discussion_id){
        $.ajax({
            url: '/api/discussions_shopping_cart/' + info_item_id,
            type: "PUT",
            async: true,
            data: {"discussion_id": created_discussion_id},
            success: function () {
                console.log("item information inserted to discussion shopping cart");
            },

            error: function (xhr, ajaxOptions, thrownError) {
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

    getPostByDiscussion: function(discussion_id, callback){
        $.ajax({
            url: '/api/posts?discussion_id=' + discussion_id,
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);
                callback(null, data);
            },

            error: function (xhr, ajaxOptions, thrownError) {
                callback(thrownError, null);
                alert('get Posts error');
            }
        });
    },

    addPostTodiscussion: function(discussion_id, post_content, callback){

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
                callback(thrownError, null);
                alert('create Post error');
            }
        });
    }
}
