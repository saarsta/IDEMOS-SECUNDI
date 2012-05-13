
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
    //otherUser is defined in his_uru.ejs
    switch (tabDivId)
    {
        case 'tabDiscussions':
            db_functions.getAllItemsByUser('discussions',otherUser,function(error,data){
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
            db_functions.getAllItemsByUser('cycles',otherUser,function(error,data){
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
            db_functions.getAllItemsByUser('actions',otherUser,function(error,data){
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

        case 'ulKilkul':
            db_functions.getAllItemsByUser('kilkuls',otherUser,function(error,data){
                dust.renderArray('myKilkulListItem',data.objects,null,function(err,out)
                {
                    var seletedTab= $('#ulKilkuls');
                    // seletedTab.remove();
                    seletedTab.empty();
                    seletedTab.append(out);
                    $('img',seletedTab).autoscale();
                });
            });
            break;

        default:
    }



}


