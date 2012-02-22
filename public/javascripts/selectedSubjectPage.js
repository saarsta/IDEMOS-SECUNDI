/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 22/02/12
 * Time: 15:00
 * To change this template use File | Settings | File Templates.
 */

var items = {
    add: function(data, parent) {
        var item =
            $('<div class="item">' +
                '<h2>' + data.title + '</h2>' +
                '<p>' + data.text_field +'</p>' +
                '<button class="add" value="' + data._id + '">add to your shopping cart</button>' +
                '<button class="remove hide" value="' + data._id + '">remove from your shopping cart</button>' +
                '</div>')

                .appendTo('.' + parent);

        item.find('button.add').click(function() {
            console.log("in add");
            self = $(this);
            db_functions.dbAddInfoItemToShoppingCart($(this).val(), function didSucceed(flag){
                if(flag){
                    var item = self.parent('.item').clone().appendTo('.shopping_cart');
                    items.changeButton(item);
                    /////////////////////////////////////////////////////////////
                    item.find('button.remove').click(function() {
                        console.log("In remove");
                        db_functions.dbDeleteInfoItemFromShoppingCart(data._id);
                        $(this).parent('.item').remove();
                    });
                    //////////////////////////////////////////////////////////////
                }else{
                           console.log('information item is already in shopping cart');
                     }
                });
        });

        item.find('button.remove').click(function() {
            console.log("in remove");
                   db_functions.dbDeleteInfoItemFromShoppingCart(data._id);
            $(this).parent('.item').remove();
        });

        return item;
    },

    changeButton: function(item) {
        item.find('button').toggle();
    },

    buttonRemoveItem: function(item, info_item_id){
        item.find('button.remove').click(function() {
            console.log("in remove");
            db_functions.dbDeleteInfoItemFromShoppingCart(info_item_id);
            $(this).parent('.item').remove();
        });
    }
}


var subject_id;

function loadSelectedSubjectPage(data) {
subject_id = data;

    db_functions.dbGetUserShopingCart();
    $.ajax({

        url: '/api/information_items/?subject_id='+subject_id,
        type: "GET",
        async: true,
        success: function (data) {
            console.log(data);
            console.log(JSON.stringify(data));

            for (var i in data.objects){
                items.add(data.objects[i], "info_items_of_subject");
            }
        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert('error');
        }
    });



    $('.btn_look').live("click", function(){
        var key_words = $("#look_for_keywords").val();
        console.log("button clicked, key words are: " + key_words);
        $('.keys').html('');

        db_functions.getInfoItemsOfSubjectByKeywords(key_words, subject_id, function didSucceed(flag, data){

            if (flag){

                $(".info_items_of_subject ").html("");

                for (var i in data.objects) {
                    var item = items.add(data.objects[i], "info_items_of_subject");
                    items.changeButton(item);
                }
            }
        });

    });
}


