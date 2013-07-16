
$(function(){

    var original_text = discussion_vision_text || '';


    var SPAN = 250, STEP=100;

    $('[name=parts] ul li:not(.new_li)').each(function(){
        var new_label = $('<label class="field optional_label"></label>').insertBefore($('label:eq(2)',this));

//        $('<span class="field_label">Original</span>').appendTo(new_label);

        var original_div = $('<div class="suggestion_original_text" dir="rtl"></div>').appendTo(new_label);
        var start = $('.field input:eq(0)',this);
        var end = $('.field input:eq(1)',this);
        var onChange = function(){
            var start_index = Number(start.val());
            if(start_index < 0)
                start_index = 0;
            var end_index = Number(end.val());
            if(end_index >= original_text.length)
                end_index = original_text.length - 1;
            var pre_start_index = Math.max(0,start_index - SPAN);
            pre_start_index -= pre_start_index % STEP;
            var post_end_index = Math.min(original_text.length, end_index + SPAN);
            post_end_index -= post_end_index % STEP;
            original_div.html((pre_start_index > 0 ?  '...' : '') +  original_text.substr(pre_start_index,start_index-pre_start_index) + '<font>' + original_text.substr(start_index,end_index - start_index) + '</font>' +
                original_text.substr(end_index,post_end_index-end_index) + (post_end_index < original_text.length-1 ? '...' : ''));
        };

        start.change(onChange);
        end.change(onChange);

        onChange();
    });
});