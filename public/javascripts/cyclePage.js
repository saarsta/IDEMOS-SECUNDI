
function loadCyclePage(cycle_id,start_date, finish_date){
    db_functions.getCycleById(cycle_id,function(err,cycle)
    {
        dust.render('cycle_main',cycle,function(err,out){
            $('#cycleMain').prepend(out);
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