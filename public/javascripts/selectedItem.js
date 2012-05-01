function loadSelectedItemPage(info_id){

    $(".button.add").live("click", function(){
        var info_item_id = $(this).parent('div').attr('value');
        db_functions.addInfoItemToShoppingCart(info_item_id, function(err, data){
            if(!err){
                dust.render('shopping_cart_item_1', data,function(err,out)
                {
                    $('#shopping_cart').append(out);
                    $('#shopping_cart img').autoscale();
                });
            }
        });
    });

    $(".button.remove").live("click", function(){
        var info_item_id = $(this).parent('div').attr('info_item_id');
        var div = $(this).parent('div');
        db_functions.removeInfoItemFromShoppingCart(info_item_id, function(err){
            if(!err){
                div.remove();
            }
        });
    });



    $.ajax({
        url: '/api/information_items/' + info_id,
        type: "GET",
        async: true,
        success: function (data) {
            $('.breadcrumb').text(data.subject_name);
            console.log(data);
            $('#info_item_full_view').empty();
            data.get_link = function(){
                return '/meida/' + data._id;
            };
            $("#create_new_discussion").attr('href', "/discussions/new?subject_id=" +  data.subject_id + "&subject_name=" + data.subject_name);
             dust.render('info_item_full_view', data, function(err,out)
             {
                 $('#info_item_full_view').append(out);
                 $('#info_item_full_view img').autoscale();
             });

//             $('#search_results').show();
        },

        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });

    db_functions.getUserShopingCart(function(err,data){
        data.objects.forEach(function(obj)
        {
            obj.get_link = function( )
            {
                return '/meida/' + obj._id;
            }
        });
        dust.renderArray('shopping_cart_item_1', data.objects,null,function(err,out)
        {
            $('#shopping_cart').append(out);
            $('#shopping_cart img').autoscale();
        });
    });
}