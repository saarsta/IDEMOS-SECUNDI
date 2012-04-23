
/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 22/02/12
 * Time: 14:37
 * To change this template use File | Settings | File Templates.
 */




function tabSelected(event, ui)
{
    var tabDivId=   ui.panel.id;
    switch (tabDivId)
    {
        case 'tabDiscussions': /*db_functions.getAllDiscussions(function(data){
            var size = data.objects.length;

            dust.renderArray('myCycle_list_item',data.objects,null,function(err,out)
            {
                var seletedTab= $('#ulCycles');
                // seletedTab.remove();
                seletedTab.empty();
                seletedTab.append(out);

            });
        });*/
            break;
        case 'tabCycle':

                        db_functions.getAllItemsByUser('cycles',function(error,data){
                        var size = data.objects.length;
                            debugger;
                        dust.renderArray('myCycle_list_item',data.objects,null,function(err,out)
                        {
                            var seletedTab= $('#ulCycles');
                            // seletedTab.remove();
                            seletedTab.empty();
                            seletedTab.append(out);

                        });
                    });
            break;

        case 'tabActions':
            break;
        default:
    }
   /*
      db_functions.dbGetAllCirclesXXX(function(data){
      var size = data.objects.length;
      dust.renderArray('discussion_list_item',data.objects,null,function(err,out)
      {
          var seletedTab= $('#tabCircles');
         // seletedTab.remove();
          seletedTab.empty();
          seletedTab.append(out);


  });*/


}
/*

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


*/
var COUNTER;

function loadInfoAndMeasures(tag_name) {

    COUNTER = 0;

    if( tag_name == 'חיפוש עפ TAGS')
        tag_name = '';

    $('#search_form').submit(function()
    {
        $('#btn_look').click();
        return false;
    });

    db_functions.dbGetAllSubjects();
    /*
    $('#search_results').hide();
    if(tag_name != undefined && tag_name != "undefined" && tag_name != null){
        $('#search_results').show();
        $("#look_for_tags").attr('value', tag_name);
    }

    db_functions.dbGetAllSubjects();
    db_functions.getHotInfoItems();
     */

    /*

    $('#btn_look').live("click", function(){
        $('#search_results').show();
        $('.tags').html('');
        var tag_value = $("#look_for_tags").val();
        tag_name = tag_value;
        $('#search-content .slider').hide().removeAttr('fetched');
        $('#results_info_items').show();

        click_list_type('information_items');

        event.stopPropagation();
    });

    $('#more_hot_items_btn').live("click", function(){
        COUNTER++;
        console.log(COUNTER);
        //bring me page naumer counter
    });

    function click_list_type(type)
    {
        var results_div = $('#results_' + type);
        $('#search-content .slider:visible').hide();
        results_div.show();
        $('.search-list li.active').removeClass('active');
        $($('a[li-value=' + type +']').parent()).addClass('active');
        if(!results_div.is('[fetched]'))
        {
            $('ul',results_div).empty();
            db_functions.getItemsByTagNameAndType(type,tag_name,function(err,data)
            {
                dust.renderArray(type, data.objects,null,function(err,out){
                    $('ul',results_div).append(out);
                    $('img',results_div).autoscale();
                    results_div.show().attr('fetched','');
                });
            });
        }
    }

    $('#search-content .search-type').click(function(type)
    {
        var a = $(this);
        var type = a.attr('li-value');
        click_list_type(type);
    });

    if($('#search_results:visible').length)
        click_list_type('information_items');
   */
}
