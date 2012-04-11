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

var COUNTER;

function loadInfoAndMeasures(tag_name) {
    COUNTER = 0;

    if(tag_name){
        $("#look_for_tags").attr('value', tag_name);
        db_functions.dbGetInfoItemsByTagName(tag_name, function(err,data){
            $('#information_items_list').empty();
            dust.renderArray('information_item', data.objects,function(err,out)
            {
                $('#information_items_list').append(out);
            },function(){
                $('#information_items_list img').autoscale();
            });
        });
    }else{
        $('#search_results').hide();
    }

    db_functions.dbGetAllSubjects();
    db_functions.getHotInfoItems();

    $('#btn_look').live("click", function(){

        $('.tags').html('');
        var tag_value = $("#look_for_tags").attr('value');

        db_functions.dbGetInfoItemsByTagName(tag_value, function(err,data){
            $('#information_items_list').empty();
            dust.renderArray('information_item', data.objects,function(err,out)
            {
                $('#information_items_list').append(out);
            });

            $('#search_results').show();

        });
        event.stopPropagation();
    });

    $('#more_hot_items_btn').live("click", function(){
        COUNTER++;
        console.log(COUNTER);
        //bring me page naumer counter
    })

    /*db_functions.getUserShopingCart(function(data){

        for (var i in data.objects) {
            var item = items.add(data.objects[i], "shopping_cart");
            items.changeButton(item);
        }
    });*/
}