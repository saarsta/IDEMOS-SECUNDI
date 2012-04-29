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


var created_discussion_id = null;

function loadCreateDiscussionPage(subject_id, subject_name){

//    var subject_id = id;
    var vision,
        title,
        first_post,
        tags;
    var user_Shopping_cart;

    $.ajax({
        url: '/api/subjects/' + subject_id,
        type: "GET",
        async: true,
        success: function (data) {
            console.log(data);
            $('#subject_img').attr("src", data.image_field.url
            );
        },

        error: function (xhr, ajaxOptions, thrownError) {
            console.log("error get subject");
        }
    });

    db_functions.getUserShopingCart(function(err,data){
        user_Shopping_cart = data;
        for (var i=0; i < data.objects.length; i++) {
            var item = items.add(data.objects[i], "shopping_cart");
            items.changeButton(item);
        }
        data.objects.forEach(function(obj)
        {
            obj.get_link = function( )
            {
                return '/meida/' + obj._id;
            }
        });
        dust.renderArray('information_item_in_discussion', data.objects,function(err,out)
        {
            $('#shopping_cart').append(out);
            $('#shopping_cart img').autoscale();
        });
    });

    $(".preview_btn").live("click", function(){
        console.log("preview_button");
        console.log(user_Shopping_cart);

        title = $(".title").val();
        vision = $(".vision").val();
        first_post = $(".first_post").val();

        db_functions.createPreviewDiscussion(subject_id, vision, title, function(err, data){
            if (err){
                console.log(err);
            }
            else{
                created_discussion_id = data._id;
                var counter = user_Shopping_cart.objects.length;
                function on_finish()
                {
                    console.log(counter);
                    if(--counter == 0)
                    {
                        window.location.replace("/discussions/" + created_discussion_id);
                    }
                };

                if ($.trim(first_post) != ""){
                    counter++;
                     db_functions.addPostToDiscussion(created_discussion_id, first_post, function(err, data ){
                         if (err){
                             console.log(err);
                         }
                         else{
                             on_finish()
                         }
                     });
                }
            }
        });
    });

    $("#create_discussion_btn").click(function(){
        title = $("#title").val();
        vision = $("#vision").val();
        first_post = $("#first_post").val();
        tags = $("#tags").val();
        tags = tags.split(" ");


        if (!created_discussion_id){
            db_functions.createDiscussion(subject_id, subject_name, vision, title, tags, function(err, data){
                if (err){
                }else{
                    created_discussion_id = data._id;

                    if ($.trim(first_post) != ""){
                        db_functions.addPostToDiscussion(created_discussion_id, first_post, function(err, data){
                            if (err){
                                console.log(err);
                            }else{
                                window.location.replace("/discussions/" + created_discussion_id);
                            }
                        });
                    }else{
                        window.location.replace("/discussions/" + created_discussion_id);

                    }
                }
            });
        }else{
            db_functions.diployDiscussion(created_discussion_id, function(err){
                if (err){
                    console.log(err);
                }
                else{
                    console.log("discussion was diployed");
                    alert("discussion created!");
                    if ($.trim(first_post) != ""){
                        db_functions.addPostToDiscussion(created_discussion_id, first_post, function(err, data){
                            if (err){
                                console.log(err);
                            }else{
                                window.location.replace("/discussions/" + created_discussion_id);
                            }
                        });
                    }else{
                        window.location.replace("/discussions/" + created_discussion_id);

                    }
                }
            });
        }
    });
}
