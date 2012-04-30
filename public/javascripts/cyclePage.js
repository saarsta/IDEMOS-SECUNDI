
function loadCyclePage(cycle_id,start_date, finish_date){
    db_functions.getCycleById(cycle_id,function(err,cycle)
    {
        cycle=cycle[0];
        var discussion_id=          cycle.discussions[0]._id;
        cycle.discussion=     cycle.discussions[0]   ;
        dust.render('cycle_main',cycle,function(err,out){
            $('#cycleMain').prepend(out);
        });

        db_functions.getDiscussionShoppingCart(discussion_id,function(err,discussion)
        {

        } );



        db_functions.getUpdatesOfCycle(cycle_id,function(err,update)
        {
            dust.render('cycle_update',update,function(err,out){
                $('#cycleUpdate').prepend(out);
            });
        });


        dust.renderArray('cycle_user',cycle.users,null,function(err,out)
        {
            $('#userList').append(out);
        });
        //bugbug:         cycle.users should be replaced with pending actions

        db_functions.getPendingActionsByCycle(cycle_id,function(err,pendingActions)
        {
            dust.renderArray('cycle_pending_action',pendingActions.objects,null,function(err,out)
            {
                $('#cyclePendingActions').append(out);
            });
        });

        db_functions.getPopularPostsByCycleId(cycle_id,function(err,posts)
        {
            //bugbug:         cycle.users should be replaced with  posts
            dust.renderArray('cycle_popular_post',cycle.users,null,function(err,out)
            {
                $('#cyclePopularPosts').append(out);
                $('#pupularPostsLink').click(function(){
                    $('#cyclePopularPosts').slideToggle('slow', function() {
                        // Animation complete.
                    });
                });
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


