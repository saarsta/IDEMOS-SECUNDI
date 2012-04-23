/*
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
}*/

function laodDiscussionPage(discussion_id){


    console.log("discussion id = " + discussion_id);

    $(".vote_for").live("click", function(){
        var post_id = $(this).parent('div').attr("post_id");
        db_functions.voteForPost(post_id, "add", function(err, post_obj){
            if(!err){
                console.log(post_obj);


                //add to "bead number"
            }
        })
    });

    $(".vote_against").live("click", function(){
        var post_id = $(this).parent('div').attr("post_id");
        db_functions.voteForPost(post_id, "remove", function(err, post_obj){
            if(!err){
                console.log();
                //add to "bead number"
            }
        })
    });

    db_functions.getDiscussionById(discussion_id, function(err, discussion_object){
        if(err){
            console.log(err);
        }
        else{
           dust.render('discussion_full_view', discussion_object, function(err, out){
               $('#discussion').append(out);
           })
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
//            console.log("posts are" + " " + data);

            dust.renderArray('post', data.objects, null, function(err, out){
                if(!err){
                    $("#posts").append(out);
                }
            })

            /*for (var i in data.objects){
                post_items.add(data.objects[i]);
            }*/
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

    $('#sort').change(function() {
        $("#posts").empty();

        if ($(this).val() === 'op_date') {
            db_functions.getPostByDiscussion(discussion_id, function(err, data){
                if(err){
                    console.log(err);
                }else{
                    dust.renderArray('post', data.objects, null, function(err, out){
                        if(!err){
                            $("#posts").append(out);
                        }
                    })
                }
            });

        }
        else{
            if ($(this).val() === 'op_back_date') {
                db_functions.getSortedPostByDiscussion(discussion_id, "order_by=creation_date", function(err, data){
                    if(err){
                        console.log(err);
                    }else{
                        dust.renderArray('post', data.objects, null, function(err, out){
                            if(!err){
                                $("#posts").append(out);
                            }
                        })
                    }
                });


            }else{
                if ($(this).val() === 'op_votes_for') {
                    db_functions.getSortedPostByDiscussion(discussion_id, "order_by=-votes_for", function(err, data){
                        if(err){
                            console.log(err);
                        }else{
                            dust.renderArray('post', data.objects, null, function(err, out){
                                if(!err){
                                    $("#posts").append(out);
                                }
                            })
                        }
                    });

                }else{
                    if ($(this).val() === 'op_most_voted') {
                        db_functions.getSortedPostByDiscussion(discussion_id, "order_by=-total_votes, -votes_for", function(err, data){
                            if(err){
                                console.log(err);
                            }else{
                                dust.renderArray('post', data.objects, null, function(err, out){
                                    if(!err){
                                        $("#posts").append(out);
                                    }
                                })
                            }
                        });
                    }
                }
            }
        }
    });

    $("#btn_close").live("click", function(){
        $(this).parent('div').hide();
    });


}