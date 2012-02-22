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
            url: 'http://dev.empeeric.com/api/subjects',
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
    dbGetUserShopingCart: function(){
        $.ajax({
            url: 'http://dev.empeeric.com/api/shopping_cart',
            type: "GET",
            async: true,
            success: function (data) {
                console.log(data);

                for (var i in data.objects) {
                    var item = items.add(data.objects[i], "shopping_cart");
                    items.changeButton(item);
                }
            },

            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }

        });
    },
    dbDeleteInfoItemFromShoppingCart: function(info_item_id){
        $.ajax({
            url: 'http://dev.empeeric.com/api/shopping_cart/' + info_item_id,
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



        console.log('http://dev.empeeric.com/api/information_items/?text_field__regex='+ keywords_arr + '&subject_id=' + subject_id);
        $.ajax({
            url: 'http://dev.empeeric.com/api/information_items/?text_field__regex='+ keywords_arr + '&subject_id=' + subject_id,
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
}
