
var items = {
    add: function(data) {
        var item =
            $('<div class="item">' +
                '<h2>' + data.title + '</h2>' +
                '<p>' + data.text_field +'</p>' +
                '</div>')

                .appendTo('.shopping_cart');
    }
}

var post_items = {

    add: function(data){
        var item =
            $('<div class="item">' +
                '<h2>' + data.text +'</h2>' +
                '<p>' + data.first_name +'</p>' +
                '<p>' + data.last_name +'</p>' +
                '<p>' + data.creation_date +'</p>' +
                '</div>')

                .appendTo('.posts');
    }
}

function laodDiscussionPage(discussion_id){

    console.log("discussion id = " + discussion_id);
    db_functions.getDiscussionById(discussion_id, function(err, data){
        if(err){

        }
        else{

            $(".title").val(data.title);
            $(".vision").val(data.vision_text);
            console.log($(".vision").val());
        }
    });

    db_functions.getDiscussionShoppingCart(discussion_id, function(err, data){

        if(err){}
        else{
            for (var i in data.objects){
                items.add(data.objects[i]);
            }
        }
    });

    db_functions.getPostByDiscussion(discussion_id, function(err, data){
        if(err){

        }else{

            for (var i in data.objects){
                post_items.add(data.objects[i]);
            }
        }
    });
}