$(document).ready(function(){

    $('.nf_listfield').each(function()
    {
        var name = $(this).attr('name');
        var template = $('.nf_hidden_template',this);
        var list = $('>ul',this);
        function make_delete_button()
        {
            return $('<button class="nf_listfield_delete">X</button>').click(function()
            {
                $(this).parents('li').remove();
            });
        }
        var length = $('>li',list).prepend(make_delete_button()).length;
        var new_elm = $('<li></li>');
        new_elm.append(template.html()).prepend($('<button class="nf_listfield_append">+</button>').click(function()
        {

            var li = $(this).parents('li').prepend(make_delete_button());
            $('[name]',li).each(function()
            {
                var input = $(this);
                input.attr('name',input.attr('name').replace(name + '_tmpl_',name + '_li' + length + '_'));
            });
            length++;
            $(this).remove();
        }));
    });
});
