/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 22/02/12
 * Time: 14:37
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
            self = $(this)
            db_functions.dbAddInfoItemToShoppingCart($(this).val(), function didSucceed(flag){
                console.log(flag);
                if(flag){
                    var item = self.parent('.item').clone().appendTo('.shopping_cart');
                    items.changeButton(item);
                    ////////////////////////////////////////////////////////////////////////////////////////
                    item.find('button.remove').click(function() {
                        console.log("In remove");
                        db_functions.dbDeleteInfoItemFromShoppingCart(data._id);
                        $(this).parent('.item').remove();
                    });
                    ////////////////////////////////////////////////////////////////////////////////////////
                }else{
                    console.log('information item is already in shopping cart');
                }
            });
        });

        item.find('button.remove').click(function() {
            console.log("In remove");
            db_functions.dbDeleteInfoItemFromShoppingCart(data._id);
            $(this).parent('.item').remove();
        });

        return item;
    },
    changeButton: function(item) {
        item.find('button').toggle();
    },
    remove: false
};



function loadInfoAndMeasures() {

    $('#search_results').hide();

    db_functions.dbGetAllSubjects();

    /*$.ajax({
     url: '/api/information_items/?is_hot_info_item=true',
     type: "GET",
     async: true,
     success: function (data) {

     console.log(data);
     var object = data.objects[i];
     var length = data.objects.length;

     for(var i = 0; i < length; i++){
     var hot_info_item_object = $(document.createElement('a'))
     .attr("id", 'hot_info_item_object' + i);
     hot_info_item_object.attr('href', '');
     hot_info_item_object.text(object.title);
     console.log(hot_info_item_object);
     $('.hot_information_item').append(hot_info_item_object).append(object.text_field);
     }
     },

     error: function (xhr, ajaxOptions, thrownError) {
     alert('error with hot items');
     }
     });*/

    $('#btn_look').live("click", function(){

        $('.tags').html('');
        var tag_value = $("#look_for_tags").attr('value');

        db_functions.dbGetInfoItemsByTagName(tag_value);
        event.stopPropagation();
    });

    db_functions.getUserShopingCart(function(data){

        for (var i in data.objects) {
            var item = items.add(data.objects[i], "shopping_cart");
            items.changeButton(item);
        }
    });
}