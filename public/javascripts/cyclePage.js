
function loadCyclePage(cycle_id,start_date, finish_date){
    db_functions.getCycleById(cycle_id,function(err,cycle)
    {

        var discussion_id=          cycle.discussions[0]._id;
        cycle.discussion=     cycle.discussions[0]   ;

        dust.render('cycle_main',cycle,function(err,out){

            $('#cycleMain').prepend(out);


            $('#followCycleButton').click(function(){

                if (!cycle.is_follower   )
                {
                    db_functions.joinToCycleFollowers(cycle_id,function(err,cycle1)
                    {
                        dust.render('cycle_main',cycle1,function(err,out){

                            $('#cycleMain').prepend(out);
                            $('#followCycleButton').hide();
                         });
                    } );
                }

            });
        });

        db_functions.getDiscussionShoppingCart(discussion_id,function(err,InformationItems)
        {
          //  InformationItems.
            if(InformationItems.objects.length>0)
            {
                var current=1;
                dust.render('cycle_information_item',InformationItems.objects [0],function(err,out){
                    $('#cycleInformationItem').html(out);
                });
                setInterval(function ()
                {
                    dust.render('cycle_information_item',InformationItems.objects [current],function(err,out){
                        $('#cycleInformationItem').html(out);
                    });
                    current= ++current %   ( InformationItems.objects.length);
                } ,5000);
            }

        } );





        db_functions.getUpdatesOfCycle(cycle_id,function(err,update)
        {
            dust.render('cycle_update',update.objects[0],function(err,out){
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

        db_functions.getPopularPostsByDiscussionId(discussion_id,function(err,posts)
        {
            //bugbug:         cycle.users should be replaced with  posts
            dust.renderArray('cycle_popular_post',posts.objects,null,function(err,out)
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


function loadPopupData(){
   //toolbox data
    (function(){
          db_functions.getCategories(function(error,data){
           $.each(data.objects, function(key, value) {
               $('[name=toolbox]')
                   .append($("<option></option>")
                   .attr("value",value._id)
                   .text(value.name));
           })

         });

        $("select").change(function () {
            $('#resources').empty();
            $("select option:selected").each(function () {
                var value = $(this).attr("value");
                db_functions.getActionResourceByCategoryId(value, function(err, data){
                    for(var i = 0; i < data.objects.length; i++){

                        $('#resources').append(data.objects[i].name + ", ");
                    }
                })
            });

        })
            .trigger('change');
       })();
    
}

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
