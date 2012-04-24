
function loadCyclePage(cycle_id,start_date, finish_date){
    db_functions.getCycleById(cycle_id,function(err,cycle)
    {
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
