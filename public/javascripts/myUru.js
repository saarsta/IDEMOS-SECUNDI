
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
        case 'tabDiscussions':
            db_functions.getAllItemsByUser('discussions',function(error,data){
                var size = data.objects.length;
                dust.renderArray('myDiscussion_list_item',data.objects,null,function(err,out)
                {

                    var seletedTab= $('#ulDiscussions');
                    // seletedTab.remove();
                    seletedTab.empty();

                    seletedTab.append(out);
                    $('img',seletedTab).autoscale();

                });
            });

            break;
        case 'tabCycle':
                        db_functions.getAllItemsByUser('cycles',function(error,data){
                        var size = data.objects.length;
                        dust.renderArray('myCycle_list_item',data.objects,null,function(err,out)
                        {
                            var seletedTab= $('#ulCycles');
                            // seletedTab.remove();
                            seletedTab.empty();
                            seletedTab.append(out);
                            $('img',seletedTab).autoscale();
                        });
                    });
            break;

        case 'tabActions':
            db_functions.getAllItemsByUser('actions',function(error,data){
                var size = data.objects.length;
                dust.renderArray('myAction_list_item',data.objects,null,function(err,out)
                {
                    var seletedTab= $('#ulActions');
                    // seletedTab.remove();
                    seletedTab.empty();
                    seletedTab.append(out);
                    $('img',seletedTab).autoscale();
                });
            });
            break;

            break;
        default:
    }



}


