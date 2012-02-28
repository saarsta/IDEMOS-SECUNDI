/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 26/02/12
 * Time: 15:57
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


var user_shopping_cart;
var created_discussion_id = null;

function loadDiscussionPage(data){

    var subject_id = data;
    var vision,
        first_post;

    var user_Shopping_cart;
    db_functions.getUserShopingCart(function(data){
        user_Shopping_cart = data;
        for (var i in data.objects) {
            var item = items.add(data.objects[i], "shopping_cart");
            items.changeButton(item);
        }
    });

    $(".preview_btn").live("click", function(){
        console.log("preview_button");
        console.log(user_Shopping_cart);

        vision = $(".vision").val();
        first_post = $(".first_post").val();

        db_functions.createPreviewDiscussion(subject_id, vision, function(err, data){
            if (err){

            }
            else{

                created_discussion_id = data._id;
                if ($.trim(first_post) != ""){

//                db_functions.addPostToDiscussion();
                }
            }
        });
    });

    $(".create_btn").live("click", function(){

        if (!created_discussion_id){

            db_functions.createDiscussion(subject_id, vision, function(err, data){
                if (err){
                }else{
                    console.log("discussion was created");
                    for (var i in user_Shopping_cart.objects){
                        db_functions.addInfoItemToDiscussionShoppingCart(user_Shopping_cart.objects[i]._id, data._id);
                    }
                    alert("discussion created!");
                }
            });
        }else{
            db_functions.diployDiscussion(created_discussion_id, function(err){
                if (err){
                }
                else{
                    console.log("discussion was diployed");
                    for (var i in user_Shopping_cart.objects){
                        db_functions.addInfoItemToDiscussionShoppingCart(user_Shopping_cart.objects[i]._id, data._id);
                    }

                    alert("discussion created!");
                }
            });
        }
    });
}