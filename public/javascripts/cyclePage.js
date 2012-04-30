
function loadCyclePage(cycle_id,start_date, finish_date){
    db_functions.getCycleById(cycle_id,function(err,cycle)
    {
        db_functions.getDiscussionById(cycle.discussions[0],function(err,discussion)
        {
            cycle.discussion=     discussion   ;
            dust.render('cycle_main',cycle,function(err,out){
                $('#cycleMain').prepend(out);
            });
        });

        dust.render('cycle_action',cycle,function(err,out){
            $('#cycleAction').prepend(out);
        });
        dust.renderArray('cycle_user',cycle.users,null,function(err,out)
        {
            $('#userList').append(out);
        });
        //bugbug:         cycle.users should be replaced with pending actions
        dust.renderArray('cycle_pending_action',cycle.users,null,function(err,out)
        {
            $('#cyclePendingActions').append(out);
        });
        db_functions.getPopularPostsByCycleId(cycle_id,function(err,posts)
        {
            //bugbug:         cycle.users should be replaced with  posts
            dust.renderArray('cycle_popular_post',cycle.users,null,function(err,out)
            {
                $('#cyclePopularPosts').append(out);
            });
        });



        var start_date = Date.parse(cycle.creation_date);
        var span = Date.parse(cycle.due_date) - start_date ;
        db_functions.getActionsByCycle(cycle_id,function(err,data)
        {
            data.objects.push({
                execution_date:new Date()
            });
            data.objects.forEach(function(elm)
            {
                elm.get_left = function(){
                    var x = new Date(Date.parse(elm.execution_date)) - start_date;
                    return (x/span)*100.0;
                };
            });
            dust.renderArray('action_timeline',data.objects,null,function(err,out){
                $('#timeline_placeholder').append(out);
                $('#timeline_placeholder .action_timeline .action_circle').click(function(){
                    $('.box.description', $(this).parents('.action_timeline')).fadeToggle();
                });
            });
        });

    });
}

             //gestdiscussioshopping cart
//getcycleupdate
//getpendingactionsbycyclce




//getPopularPostsByCycleId

//dust.renderArray('hot_info_item', data.objects, null, function(err,out)
//{
//    $('#hot_items_list').append(out);
//    $('#hot_items_list img').autoscale();
//});

//dust.render(template,arr[i],function(err,out){
//    if(callback)
//        callback(err,out);
//    if(err)
//        _err = err;
//    out_arr.push(out);
//});