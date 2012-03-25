/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/03/12
 * Time: 16:04
 * To change this template use File | Settings | File Templates.
 */
var action_item =
{
    add: function(data, parent){
        var item =
        $('<div class="action_item gray_background" >' +
            '<h2>' + data.title + '</h2>' +
            '<textarea disabled="disabled">' + data.description+'</textarea>' +
            '<div class="resources_items"></div>' +
            '<button class="change_action">change this action</button>' +
            '<button class="join">I' + "'" + 'm in</button>' +
            '<p>number of going: <span class="num">' + data.num_of_going + '</span></p>' +
            '</div>')

            .appendTo('.' + parent );

        item.find('button.join').click(function(){
            console.log("inside join button");
            db_functions.addUserToAction(data._id, function(err, data){
                if (err){
                    console.log(err);
                }else{
                    //this is like $('span.num', item).text();
                    var num = parseInt(item.find('span.num').text());
                    item.find('span.num').text(num + 1);
                    console.log('user added to action' + "'" + 's going');
                }
            });
        });

        return item;
    },

    hideButton: function(item){
        item.find('button.change_action').hide();
    }
}

var action_resource_item =
{
    add: function(data, parent){
        $('<div class="action_resource_item">' +
            '<textarea disabled="disabled" class="color" rows="3">' +  'resource name:' + data.resource.name + ' ' +
            'amount needed: ' + data.amount +
            '</textarea>' +
            '</div>')

            .appendTo($('.resources_items', parent));
    }
}

var choose_action_resource_item =
{
    add: function(resource){
        //value holds the category id of resource
        $('<OPTION value="' + resource.category + ' ">'
            + resource.name + '</OPTION>')

            .appendTo("#select_resource");
    }
}

var choose_action_resource_category_item =
{
    add: function(category){
        $('<OPTION value="' + category._id + ' ">'
            + category.name + '</OPTION>')

            .appendTo("#filter_categories");
    }
}

var popular_comment_item =
{
    add: function(data){
        $('<div class="popular_comment_item">' +
            '<h2>' + data.text +'</h2>' +
            '<p>' + data.first_name +'</p>' +
            '<p>' + data.last_name +'</p>' +
            '<p>' + data.creation_date +'</p>' +
            '<p>' + "TOKENS: " + data.tokens +'</p>' +
            '<input type="text" placeholder="Write a comment..."> </input>' +
            '<button>add</button>' +
            '</div>')

            .appendTo('.popular_comments');
    }
}

var arr_action_resource = [];

function loadCyclePage(cycle_id, discussion_id){

    db_functions.getCycleById(cycle_id, function(err, cycle){
        if(err){
            console.log("error get cycle:" + err);
        }else{
            console.log(cycle);

            $("#title").val(cycle.title);
            $("#documnet_").val(cycle.document);
            $("#followers").val("Num of followers is: " + cycle.followers_count);
        }
    });

    db_functions.getApprovedActionByCycle(cycle_id, function(err, data){
       if(err){
           console.log("error getting actions: " + err);
       }else{
           var actions = data.objects;

           for (var i=0; i<actions.length; i++){
               var parent = action_item.add(actions[i], "actions");
               action_item.hideButton(parent);

               for (var j=0; j<actions[i].action_resources.length; j++){
                   var item = action_resource_item.add(actions[i].action_resources[j], parent);
               }
           }
       }
    });

    db_functions.getNotApprovedActionByCycle(cycle_id, function(err, data){
        if(err){
            console.log("error getting actions: " + err);
        }else{
            var actions = data.objects;

            for (var i=0; i<actions.length; i++){
                var parent = action_item.add(actions[i], "not_approved_actions");

                for (var j=0; j<actions[i].action_resources.length; j++){
                    action_resource_item.add(actions[i].action_resources[j], parent);
                }
            }
        }
    });

    db_functions.getActionResoueces(function(err, data){
        if (err){
            console.log("error getting resources: " + err)
        }else{
            var resources = data.objects;
            for (var i=0; i<resources.length; i++){
                choose_action_resource_item.add(resources[i]);
            }
        }
    });

    db_functions.getDiscussionPostsByTokens(discussion_id, 4, function(err, data){

        if(err){
            console.log(err);
        }else{
            for (var i=0; i<data.objects.length; i++){
                popular_comment_item.add(data.objects[i]);
            }
        }
    });

    db_functions.getCategories(function(err, data){
       if (err){
           console.log("error getting categories: " + err)
       }else{
           var categories = data.objects;
           console.log(categories);
           console.log(categories.length);
           for (var i=0; i<categories.length; i++){
               choose_action_resource_category_item.add(categories[i]);
           }
       }
    });

    //ADDING RESOURCES TO ANN ARRAY AND TO THE TEXTAREA
    $("#add_resource_btn").live('click', function() {
        var resource_amount = $("#resource_amount").val();
        var resource_name = $("#select_resource option:selected").text();
        console.log($("#select_resource option:selected").text());
        console.log($("#filter_categories").val());

        var action_resource = {resource: {category : String, name: String}, amount: Number};
        action_resource.resource.category = $("#select_resource").val();
        action_resource.resource.name = resource_name;
        action_resource.amount = resource_amount
        arr_action_resource.push(action_resource);
        console.log(arr_action_resource);

        $('#action_resources').val($('#action_resources').val() + "\n" + resource_name +
          " amount:" + resource_amount);
    });

    $("#save_action_btn").live('click', function() {
       var action_title = $("#action_title").val();
       var action_description = $("#action_description").val();
       var required_participants = 0 || $("#required_participants").val();
       var execution_date =  /*$("#execution_date").val() ||*/ new Date().getTime() + 1000000000;
       var action_resources = arr_action_resource || {};

       db_functions.addAction(cycle_id, action_title, action_description, arr_action_resource, required_participants, execution_date, function (err, result){
           if (err){
               console.log(err);
           }else{
               console.log("Action was added!");
              /* db_functions.getActionById(result._id, function(err, data){
                   if(err){
                       console.log(err);
                   }else{
                       action_item.add(data, "not_approved_actions");
                   }
               });*/
               $( "#popup_contact" ).dialog("close");
           }
       })
    });

    $("#new_action_btn").live('click', function(){

        $( "#popup_contact" ).dialog({
            modal: true,
            buttons: {
                Ok: function() {

                    $( this ).dialog("close");
                }
            }
        });
    });

    $("#follow_btn").live("click", function(){
        db_functions.addUserToCycleFollower(cycle_id, function(err, data){
            if(err){
                console.log(err);
            }else{
                $("#followers").val("Num of followers is: " + data.followers_count);
            }
        });
    });
}

