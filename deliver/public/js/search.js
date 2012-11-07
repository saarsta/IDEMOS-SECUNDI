


$(document).ready(function () {


    var search_term = "";
    var sections = ['information_items', 'discussions', 'cycles', 'actions', 'articles'];
    var selected_tab = null;
    var current_section = typeof(window.current_section) == 'undefined' || window.current_section == null ? -1 : window.current_section;

    $('.search-input').live("submit",function () {
        if (current_section >= 0) {
            search_term = $(this).find(".search_term").val();
            displaySearchResults();

            return false;
        }
        else
            return true;
    });

    $('.tag-search').live("click",function () {
        if (current_section >= 0) {
            search_term = $(this).text();
            displaySearchResults();
            return false;
        }
        else
            return true;
    });

    function displaySearchResults() {

        var pageIndexByType = {};
        if($("body").hasClass('search-active')){
            $('.search-result-box').remove();
            $("body").removeClass('search-active');
        }
        db_functions.getItemsCountByTagName(search_term, function (err, data) {
            var createTabs = function () {
                $(".search-result-box .tabs").tabs({
                    selected: selected_tab,
                    select: function(event,ui){
                        selected_tab = ui.index;
                        populateItems(sections[ui.index], pageIndexByType[sections[ui.index]] || 0);
                    }
                });
            };

            var populateItems = function(type,page) {
                var slide = $("#tabs-" + type + " .tab-slide .slides-one:eq(" + page + ")");
                if(!slide.data('loaded')) {
                    slide.data('loaded','true');
                    db_functions.getItemsByTagNameAndType(type,search_term,page,function(err,data) {
                        if(err)
                            console.error(err);
                        else {
                            $.each(data.objects, function (index, tag) {
                                tag.section = type;
                            });
                        }

                        var items = {
                            items:data.objects
                        };

                        dust.render('search_3_slides', items, function (err, out) {
                            slide.append(out);
                        });

                        //bugbug - timimg issue with rendering
                        //  if(data.objects.length >3)
                        //  {
                    });
                }
            };


            // $(".search-result-box .tabs").tabs("destroy");
            // $(".search-result-box").remove();
            var showEmpty = true; // fix bug 442 - hide empty search results string when not empty
            var current_section_count = [];
            current_section_count[0] = data.info_items_count;
            current_section_count[1] = data.discussions_count;
            current_section_count[2] = data.cycles_count;
            current_section_count[3] = data.actions_count;
            current_section_count[4] = data.blogs_count;
            if (current_section /*&& current_section_count[current_section] > 0*//* && current_section != 0*/) {
                selected_tab = current_section;
            }
            else {
                selected_tab = data.info_items_count > 0 ? 0 : (data.discussions_count > 0 ? 1 : (data.cycles_count > 0 ? 2 : (data.actions_count > 0 ? 3 : (data.blogs_count > 0 ? 4 : null))));
            }
            dust.render('search_results', data, function (err, out) {

                $("body").addClass("search-active");
                $(".search-box").before(out);
                $('.search-result-box .close').on('click', hideSearchResults);

                $.each(sections,function(index,type) {
                    var count = current_section_count[index];
                    var section_data = {
                        name:type,
                        scroll : count > 3,
                        section:type,
                        count:new Array(Math.ceil(count/3))
                    };
                    showEmpty = true;
                    if (count > 0) {
                        showEmpty = false;// fix bug 442 - hide empty search results string when not empty
                        dust.render('search_section', section_data, function (err, out) {
                            $('.tabs').append(out);
                            if(count > 0) {
                                $('.tab-slide-' + type).after('<div class="nav-' + type + ' nav">')
                                    .cycle({
                                        fx:'scrollHorz',
                                        speed:'fast',
                                        timeout:0,
                                        pager:'.nav-' + type,
                                        next:'.prev-' + type,
                                        prev:'.next-' + type,
                                        before:function(currSlideElement, nextSlideElement, options, forwardFlag){
                                            var elm = $(nextSlideElement);
                                            if(index == selected_tab) {
                                                populateItems(type,elm.index() );
                                            }
                                            pageIndexByType[type] = elm.index()
                                        }
                                    });

                                if(selected_tab == index) {
                                    populateItems(type,0);
                                }
                            }
                        });
                    }
                    else if (showEmpty)// fix bug 442 - hide empty search results string when not empty
                    {
                        dust.render('search_section_empty', section_data, function (err, out) {
                            $(".tabs").append(out);
                        });
                    }
                });
                createTabs();
            });
        });
        window.location.hash="search";
    }

    function hideSearchResults() {
        $('.search-result-box').hide();
        $("body").removeClass("search-active");
        return false;

    }



    $(".tab-slide-information_items .slides-one .one").live('click', function () {
        window.location.replace("/information_items/" + $(this).attr("item_id"));
    });
    $(".tab-slide-discussions .slides-one .one").live('click', function () {
        window.location.replace("/discussions/" + $(this).attr("item_id"));
    });
    $(".tab-slide-actions .slides-one .one").live('click', function () {
        window.location.replace("/actions/" + $(this).attr("item_id"));
    });
    $(".tab-slide-blogs .slides-one .one").live('click', function () {
        window.location.replace("/blogs" + $(this).attr("item_id"));
    });
    $(".tab-slide-cycles .slides-one .one").live('click', function () {
        window.location.replace("/cycles/" + $(this).attr("item_id"));
    });

    $("#search_term").blur(function () {
        setTimeout("$('#search_suggest').hide()", 200);
    });

    $("#search_suggest").on("click", "li", function () {
        $("#search_term").val($(this).text());
        $("#search_suggest").hide();
        $('#search_form').submit();
    });

    var cache = {}
    var curret_term = "";
    $("#search_term").keyup(function () {

        var term = $(this).val();
        if (term.length < 2) {
            $("#search_suggest").hide();
            return;
        }
        curret_term = term;
        if (term in cache) {
            displaySuggestResults(cache[ term ]);
            return;
        }

        db_functions.getTagsBySearchTerm(term, function (ret_term, err, data) {
            cache[ term ] = data.objects;
            if (curret_term === ret_term) {
                displaySuggestResults(data.objects);
            }
        });


    });

    function displaySuggestResults(tags) {

        $("#search_suggest li:first").siblings().remove();
        if (tags.length > 0) {
            dust.renderArray('search_suggest_item', tags, null, function (err, out) {
                $("#search_suggest").append(out);
                $("#search_suggest").show();
            });
        }
        else {
            $("#search_suggest").hide();

        }
    }

    search_term = $("#search_term").val()
    if (search_term)
        displaySearchResults();

});
