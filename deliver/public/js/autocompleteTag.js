
$(document).ready(function () {
    var createTag = function(tag_text){
        var tag_element = $( document.createElement('span') );
        tag_element.text(tag_text);
        tag_element.attr("class","new_tags");
        $(".tags-list").append(tag_element)  ;
        $("#tag").val("");
    }

    $("#search_suggestion").on("click", "li", function () {
        $("#tag").val($(this).text());
        $("#search_suggestion").hide();
    });

    function displaySuggestResults(tags) {

        $("#search_suggestion li:first").siblings().remove();
        if (tags.length > 0) {
            dust.renderArray('search_suggest_item', tags, null, function (err, out) {
                $("#search_suggestion").append(out);
                $("#search_suggestion").show();
            });
        }
        else {
            $("#search_suggestion").hide();
        }
    }

    $("#tag").blur(function () {
        setTimeout("$('#search_suggestion').hide()", 200);
    });

    var cache = {}
    var curret_term = "";
    $("#tag").keyup(function(){
        var term = $(this).val();
        if(term.length < 2) {
            $("#search_suggestion").hide();
            return;
        }
        curret_term = term;
        if (term in cache) {
            displaySuggestResults(cache[term]);
            return
        }

        db_functions.getTagsBySearchTerm(term, function (ret_term, err, data) {
            cache[ term ] = data.objects;
            if (curret_term === ret_term) {
                displaySuggestResults(data.objects);
            }
        });
    })

    $("#add_tag").click(   function(){
        var tag_text =  $("#tag").val();
        if(tag_text!="")
        {
            createTag(tag_text);
        }
        return false;
    });
});
