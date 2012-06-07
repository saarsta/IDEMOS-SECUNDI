
var listCommon = (function(){
    return {
            reloadList: function (uiContainerId,original_type ,template_name,query ){
                var jqueryContainer  = $('#'+uiContainerId)  ;
                if(!query){
                  query={};
                }
                db_functions.getListItems(original_type,query,function(err,data){
                    jqueryContainer.empty();
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
                        jqueryContainer.append(out);
                       // $('#mainList img').autoscale();
                    });
                });
            }
        }
})() ;