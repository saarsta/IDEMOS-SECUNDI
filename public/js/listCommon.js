
var listCommon = (function(){
    return {
            reloadList: function (uiContainerId,original_type ,template_name,query ){
                var jqueryContainer  = $('#'+uiContainerId)  ;
                if(!query){
                  query={};
                }
                db_functions.getListItems(original_type, query, function(err,data){
                    jqueryContainer.css('height',jqueryContainer.height());
                    jqueryContainer.empty();
                    $.each(data.objects,function(index,elm)
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
                        jqueryContainer.css('height','');
                       // $('#mainList img').autoscale();
                    });
                });
            }
        }
})() ;