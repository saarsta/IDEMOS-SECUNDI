/**
 * Created by JetBrains WebStorm.
 * User: saar
 * Date: 22/02/12
 * Time: 15:00
 * To change this template use File | Settings | File Templates.
 */

var items = {
    add: function(data, parent) {
        var item =
            $('<div class="item">' +
                '<h2>' + data.title + '</h2>' +
                '<p>' + data.text_field +'</p>' +
                '<button class="add" value="' + data._id + '">add to your shopping cart</button>' +
                '<button class="remove hide" value="' + data._id + '">remove from your shopping cart</button>' +
                '</div>')

                .appendTo('.' + parent);

        item.find('button.add').click(function() {
            console.log("in add");
            var self = $(this);
            db_functions.dbAddInfoItemToShoppingCart($(this).val(), function didSucceed(flag){
                if(flag){
                    var item = self.parent('.item').clone().appendTo('.shopping_cart');
                    items.changeButton(item);
                    /////////////////////////////////////////////////////////////
                    item.find('button.remove').click(function() {
                        console.log("In remove");
                        db_functions.dbDeleteInfoItemFromShoppingCart(data._id);
                        $(this).parent('.item').remove();
                    });
                    //////////////////////////////////////////////////////////////
                }else{
                           console.log('information item is already in shopping cart');
                     }
                });
        });

        item.find('button.remove').click(function() {
            console.log("in remove");
                   db_functions.dbDeleteInfoItemFromShoppingCart(data._id);
            $(this).parent('.item').remove();
        });

        return item;
    },

    changeButton: function(item) {
        item.find('button').toggle();
    },

    buttonRemoveItem: function(item, info_item_id){
        item.find('button.remove').click(function() {
            console.log("in remove");
            db_functions.dbDeleteInfoItemFromShoppingCart(info_item_id);
            $(this).parent('.item').remove();
        });
    }
}

var discussions = {
        add: function(data){
            var item =
                $('<OPTION VALUE="/account/discussion?discussion_id=' + data._id
                    +'&subject_name=' + data.subject_name + '">'
                    + data.title + '</OPTION>')

                .appendTo(".active_discussions select");
        },

        onSubmit: function(mySel)
        {
            var myWin, myVal;
            myVal = mySel.options[mySel.selectedIndex].value;
            if(myVal)
            {
                if(mySel.form.target)myWin = parent[mySel.form.target];
                else myWin = window;
                if (! myWin) return true;
                myWin.location = myVal;
            }
            return false;
        }
}

var subject_id,
    subject_name;

function loadSelectedSubjectPage(subject_id, subject_name, tag_name) {
    subject_id = subject_id;
    subject_name = subject_name;
    tag_name = tag_name;


    $('#btn_look').live("click", function(){

        $('.tags').html('');
        var tag_value = $("#look_for_tags").attr('value');

        db_functions.dbGetInfoItemsByTagName(tag_value);
        event.stopPropagation();
    });



    db_functions.getUserShopingCart(function(data){
        data.objects.forEach(function(obj)
        {
            obj.get_link = function( )
            {
                return encodeURIComponent('/selectedItem?subject_id=' + obj.subject_id + '&info_id=' + obj._id);
            }
        });
        dust.renderArray('shopping_cart_item_1', data.objects,function(err,out)
        {
            $('#shopping_cart').append(out);
        });

        /*for (var i in data.objects) {
            var item = items.add(data.objects[i], "shopping_cart");
            items.changeButton(item);
        }*/
    });

    db_functions.getDiscussionsBySubject(subject_id, function(err, data){
        if (err){
            alert("error get discussion by subject");
        }else{
            console.log(subject_id);
            console.log(data);
            for (var i in data.objects){
                console.log(data.objects[i]);
                discussions.add(data.objects[i]);
            }
        }
    });

    $.ajax({

        url: '/api/information_items/?subject_id='+subject_id,
        type: "GET",
        async: true,
        success: function (data) {
            console.log(data);
            console.log(JSON.stringify(data));

            data.objects.forEach(function(obj)
            {
                obj.get_link = function( )
                {
                    return encodeURIComponent('/selectedItem?subject_id=' + obj.subject_id + '&info_id=' + obj._id);
                }
            });
            dust.renderArray('info_item_in_subject_1', data.objects,function(err,out)
            {
                $('#info_items').append(out);
            });

           /* for (var i in data.objects){
                items.add(data.objects[i], "info_items_of_subject");
            }*/
        },

        error: function (xhr, ajaxOptions, thrownError) {
            alert('error');
        }
    });

    $('#look_keyword_btn').live("click", function(){
        var key_words = $('#keyword_input').val();
        console.log("button clicked, key words are: " + key_words);
        $('.keys').html('');

        db_functions.getInfoItemsOfSubjectByKeywords(key_words, subject_id, function(err, data){

                if(!err){
                    $('#info_items').empty();
                    dust.renderArray('info_item_in_subject_1', data.objects,function(err,out)
                    {
                        $('#info_items').append(out);
                    });

                    /*$(".info_items_of_subject ").html("");
                    for (var i in data.objects) {
                        var item = items.add(data.objects[i], "info_items_of_subject");
                        items.changeButton(item);
                    }*/
                }
        });
    });

    db_functions.getCyclesBySubject(subject_id);

    db_functions.getDiscussionsBySubject(subject_id, function(err, data){
        $.each(data.objects, function(index, value){
            $("select#sel_discussion").append($("<option />").val(value._id).text(value.title));
        });
    });

    $(".button.add").live("click", function(){
        var info_item_id = $(this).parent('div').attr('value');
        db_functions.addInfoItemToShoppingCart(info_item_id, function(err, data){
            if(!err){
                dust.render('shopping_cart_item_1', data,function(err,out)
                {
                    $('#shopping_cart').append(out);
                });
            }
        });
    });

    $(".like").live("click", function(){
        var info_item_id = $(this).parent('div').attr('value');
        db_functions.addLikeToInfoItem(info_item_id, function(err, data){
            if(!err){

            }
        });
    });




    /*$('.btn_look_for_discussions').live("click", function(){
        console.log("button btn_look_for_discussions clicked");

        db_functions.getDiscussionsBySubject(subject_id, function displayDiscussions(err, data){

            if (err){
                console.log(err);
            }else{

//               console.log(data);
            }
        });

    });*/

   /* $('.reality_btn').live("click", function(){
        window.location.replace("/account/createDiscussion?subject_id=" + subject_id + '&subject_name=' + subject_name);
    });*/

}