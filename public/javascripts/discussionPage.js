
var shopping_cart_items = {
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
                '<input type="text" placeholder="Write a comment..."> </input>' +
                '<button>add</button>' +
                '</div>')

                .appendTo('.posts');

        item.find('button').click(function(){
            var text = item.find('input').val();
            console.log("text is: " +       text);

            var answer=confirm("a COMMENT will cost you 1 token bro!");
            if(answer){

                db_functions.addCommentPostToDiscussion(discussion_id, text, data._id, false, function(err, data){
                    if (err){
                        console.log(err);
                    }else{
                        console.log("addCommentPostToDiscussion is: ");
                        console.log(data);
                        post_items.add(data);
                    }
                });
            }
        });
    }
}

var discussion_id;

function laodDiscussionPage(data){

    discussion_id = data;
    console.log("discussion id = " + discussion_id);
    db_functions.getDiscussionById(discussion_id, function(err, discussion_object){
        if(err){

        }
        else{
            $(".title").val(discussion_object.title);
            $(".vision").val(discussion_object  .vision_text);
            $("#discussion_grade").val("grade is: " + discussion_object.grade + " count: " + discussion_object.evaluate_counter);
            console.log($(".title").val());
            console.log($(".vision").val());
        }
    });

    db_functions.getDiscussionShoppingCart(discussion_id, function(err, data){

        if(err){}
        else{
            for (var i in data.objects){
                shopping_cart_items.add(data.objects[i]);
            }
        }
    });

    db_functions.getPostByDiscussion(discussion_id, function(err, data){
        if(err){
            console.log(err);
        }else{
            console.log("posts are" + " " + data);
            for (var i in data.objects){
                post_items.add(data.objects[i]);
            }
        }
    });

    $("#btn_grade").live("click", function(){
        var grade = $(".grade input").val();
        console.log(" grade is :  " + grade);

        var reg = /[0-9]$/;
        if((reg.test(grade) == false) || !(grade >= 0 && grade <= 10)){
            alert('Invalid number');
        }else{
            db_functions.addDiscussionGrade(discussion_id, grade, function(err, discussion_object){
                if (err){
                    console.log(err);
                }
                else{
                    console.log(discussion_object);
                    $("#discussion_grade").val("grade is: " + discussion_object.grade + " count: " + discussion_object  .evaluate_counter);
                }
            });
        }
    });
}