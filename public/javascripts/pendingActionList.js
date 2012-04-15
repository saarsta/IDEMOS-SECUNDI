/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 22/02/12
 * Time: 14:37
 * To change this template use File | Settings | File Templates.
 */

var COUNTER;

function loadActionList() {
    COUNTER = 0;

    db_functions.dbGetAllPendingActions();

    /*
    if( tag_name == 'חיפוש עפ TAGS')
        tag_name = '';

    $('#search_form').submit(function()
    {
        $('#btn_look').click();
        return false;
    });

    $('#search_results').hide();
    if(tag_name != undefined && tag_name != "undefined" && tag_name != null){
        $('#search_results').show();
        $("#look_for_tags").attr('value', tag_name);
    }

    db_functions.dbGetAllSubjects(!tag_name);
    db_functions.getHotInfoItems();

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

$(function() {
    loadActionList();
});