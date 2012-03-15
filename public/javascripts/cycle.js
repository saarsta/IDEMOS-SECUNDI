/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 13/03/12
 * Time: 16:04
 * To change this template use File | Settings | File Templates.
 */
var action_item =
{
    add: function(data){
        var item =
        $('<div class="action_item gray_background" >' +
            '<h2>' + data.title + '</h2>' +
            '<textarea>' + data.description+'</textarea>' +
            '<p>category:' + data.category + '</p>' +
            '<div class="resources_items"></div>' +
            '</div>')

            .appendTo('.actions');
        return item;
    }
}

var action_resource_item =
{
    add: function(data, parent){
        $('<div class="action_resource_item">' +
            '<textarea class="color" rows="3">' +  'resource name:' + data.resource.name + ' ' +
            'amount needed: ' + data.amount +
            '</textarea>' +
            '</div>')

            .appendTo($('.resources_items', parent));
    }
}

function loadCyclePage(cycle_id){

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

    db_functions.getActionByCycle(cycle_id, function(err, data){
       if(err){
           console.log("error getting actions: " + err);
       }else{
           var actions = data.objects;

           for (var i=0; i<actions.length; i++){
               var parent = action_item.add(actions[i]);

               for (var j=0; j<actions[i].action_resources.length; j++){
                   action_resource_item.add(actions[i].action_resources[j], parent);
               }
           }
       }
    });


}