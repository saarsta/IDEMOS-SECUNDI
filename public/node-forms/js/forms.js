$(document).ready(function(){
    function update_fieldset_behavior()
    {
        $('.nf_fieldset').addClass('collapsed').each(function()
        {
            $('>h2',this).click(function(){
                $($(this).parent()).toggleClass('collapsed');
            });
        });
    }
    $('.nf_datepicker').datetimepicker();

    $('.nf_listfield').each(function()
    {
        var name = $(this).attr('name');
        var template = $('.nf_hidden_template',this).hide();
        var list = $('>ul',this);
        function make_delete_button()
        {
            return $('<button class="nf_listfield_delete">Delete</button>').click(function()
            {
                $(this).parents('li').remove();
            });
        }
        function make_drag_button()
        {
            return $('<div class="nf_listfield_drag">Drag</div>');
        }
        var length = $('>li',list).prepend(make_drag_button()).prepend(make_delete_button()).length;
        function add_new()
        {
            var new_elm = $('<li></li>');
            new_elm.append(template.html()).addClass('new_li').prepend($('<button class="nf_listfield_append">Add</button>').click(function()
            {

                var li = $(this).parents('li').prepend(make_drag_button()).prepend(make_delete_button()).removeClass('new_li');
                $('[name]',li).each(function()
                {
                    var input = $(this);
                    input.attr('name',input.attr('name').replace(name + '_tmpl_',name + '_li' + length + '_'));
                });
                length++;
                $(this).remove();
                add_new();
                update_fieldset_behavior();
            }));
            list.append(new_elm);
        }
        add_new();
        list.sortable({
            update:function()
            {
//                var new_li = $('li.new_li',list).remove();
//                new_li.appendTo(list);
                var i = 0;
                $('>li',this).each(function(){
                    var li = this;
 //                   if($(this).is('.new_li'))
 //                       return;
                    $('[name]',li).each(function() {
                        var input = $(this);
                        input.attr('name',input.attr('name').replace(RegExp(name + '_li[0-9]+_'),name + '_li' + i + '_'));
                    });
                    i++;
                });
            },
            items:'li:not(.new_li)',
            handle:'.nf_listfield_drag'
        });
    });
    update_fieldset_behavior();
});
