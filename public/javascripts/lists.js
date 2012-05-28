
function loadListItems(original_type,template_name,subject,tag) {
   debugger
    var type = original_type;
   //BUGBUG refctor ***************************/
    db_functions.dbGetAllSubjects(true);

    /**************************************************/
    var query = {};
    if(subject)
        query['subject_id'] = subject;
    if(tag == 'חיפוש עפ TAGS'){
        tag = '';
    }


    function populate_bottom_list()
    {
        db_functions.getListItems(original_type,query,function(err,data)
        {
            $('#mainList').empty();
            data.objects.forEach(function(elm)
            {
                elm.get_link = function()
                {
                    return '/' + original_type + '/' + elm._id;
                };
                elm.get_link_uri = function()
                {
                    return encodeURIComponent(elm.get_link());
                }
            });
            dust.renderArray(template_name,data.objects,null,function(err,out)
            {
                $('#mainList').append(out);
                $('#mainList img').autoscale();
            });
        });
    }
    populate_bottom_list();

    $('#search_form').submit(function()
    {
        $('#search_form .submit-btn').click();
        return false;
    });
    $('#search_form .submit-btn').live("click", function(){
        $('#search_results').show();
        $('.tags').html('');
        var tag_value = $("#look_for_tags").val();
        tag = tag_value;
        $('#search-content .slider').hide().removeAttr('fetched');
        $('#results_' + type).show();

        click_list_type(type);

        event.stopPropagation();
    });

    $('#search_results').hide();
    $("#look_for_tags").attr('value', tag);
    if(tag){
        $('#search_results').show();
    }
    if(type==='information_items')
        db_functions.getHotInfoItems();

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
            db_functions.getItemsByTagNameAndType(type,tag,function(err,data)
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
        click_list_type(type);

    $('#select').on('change',function(){
        var value = $(this).val();
        query['order_by'] = value;
        populate_bottom_list();
    });

    $('#mainList').on('click','.join_button',function(){
        var item_id = $(this).attr('item_id');
        switch(original_type)
        {
            case 'discussions':
                db_functions.joinToDiscussionFollowers(item_id,function(err,data){
                    dust.render('discussion_list_item', data, function(err, html){
                        $("#"+data._id).replaceWith(html);
                    })

                });
                break;
            case 'actions':
                db_functions.joinToAction(item_id,function(err,data){
                    dust.render('action_list_item', data, function(err, html){
                        $("#"+data._id).replaceWith(html);
                    })
                });
                break;
            case "cycles":
                db_functions.joinToCycleFollowers(item_id,function(err,data){
                    dust.render('cycle_list_item', data, function(err, html){
                        $("#"+data._id).replaceWith(html);
                    })
                });
                break;
        }
    });

    $('#mainList').on('click','.leave_button',function(){
        var item_id = $(this).attr('item_id');
        switch(original_type)
        {
            case 'discussions':
                db_functions.leaveDiscussionFollowers(item_id,function(err,data){
                    dust.render('discussion_list_item', data, function(err, html){
                        $("#"+data._id).replaceWith(html);
                    })
                });
                break;
            case 'actions':
                db_functions.leaveAction(item_id,function(err,data){
                    dust.render('action_list_item', data, function(err, html){
                        $("#"+data._id).replaceWith(html);
                    })
                });
                break;
            case "cycles":
                db_functions.leaveCycleFollowers(item_id,function(err,data){
                    dust.render('cycle_list_item', data, function(err, html){
                        $("#"+data._id).replaceWith(html);
                    })
                });
                break;
        }
    });

    if(original_type == 'cycles')
    {
        $('#mainList').on('click','.join_action_button',function(){
            var item_id = $(this).attr('item_id');
            db_functions.joinToAction(item_id,function(){

            });
        });
    }
}
