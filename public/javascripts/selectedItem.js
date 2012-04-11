/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 11/04/12
 * Time: 16:32
 * To change this template use File | Settings | File Templates.
 */


function loadSelectedItemPage(subject_id, info_id){

    $.ajax({
        url: '/api/subjects/' + subject_id,
        type: "GET",
        async: true,
        success: function (data) {
            console.log(data);
            var subject_name = data.name;
            $("#create_new_discussion").attr('href', "/createDiscussion?subject_id=" +
                subject_id + "&subject_name=" +
                subject_name);

//             $('#search_results').show();
        },

        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });

    $.ajax({
        url: '/api/information_items/' + info_id,
        type: "GET",
        async: true,
        success: function (data) {
            console.log(data);
            $('#info_item_full_view').empty();
             dust.render('info_item_full_view', data, function(err,out)
             {
                 $('#info_item_full_view').append(out);
             });

//             $('#search_results').show();
        },

        error: function (xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
        }
    });

    db_functions.getUserShopingCart(function(data){

        dust.renderArray('shopping_cart_item_1', data.objects,function(err,out)
        {
            $('#shopping_cart').append(out);
        });

        /*for (var i in data.objects) {
         var item = items.add(data.objects[i], "shopping_cart");
         items.changeButton(item);
         }*/
    });
}