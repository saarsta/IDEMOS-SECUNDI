$(document).ready(function () {



var search_term = "";
var sections =['information_items','discussions','cycles','actions','blogs']  ;

$('#search_form').submit(function() {
    search_term  =$("#search_term").val();
    displaySearchResults() ;
    return false;
});

function displaySearchResults(){

    db_functions.getItemsCountByTagName(search_term,function(err,data)
    {
        var selected_tab=null;
        var createTabs = (function(){
            var finishedCalls = 0;
            return function(){
                if (++finishedCalls == 5){
                    $(".search-result-box .tabs").tabs({ selected: selected_tab });
                }
            };
        })();


        $(".search-result-box .tabs").tabs("destroy" );
        $(".search-result-box").remove();
        current_section_count=[];
        current_section_count[0]=  data.info_items_count;
        current_section_count[1]=  data.discussions_count;
        current_section_count[2]=  data.cycles_count;
        current_section_count[3]=  data.actions_count;
        current_section_count[4]=  data.blogs_count;
        if(current_section && current_section_count[current_section]>0) {
            selected_tab=   current_section;
        }
        else{
            selected_tab = data.info_items_count>0   ? 0: (data.discussions_count>0   ? 1:(data.cycles_count>0   ? 2:(data.actions_count>0   ? 3:(data.blogs_count>0   ? 4:null))));
        }
        dust.render('search_results',data,function(err,out)
        {

            $("body").addClass("search-ative");
            $(".search-box").before(out);
            $('.search-result-box .close').on('click', hideSearchResults);

            addSlides("information_items" ,data.info_items_count,db_functions.getInfoItemsByTagName,createTabs);
            addSlides("discussions" ,data.discussions_count,db_functions.getDiscussionsByTagName,createTabs);
            addSlides("cycles" ,data.cycles_count,db_functions.getCyclesByTagName,createTabs);
            addSlides("actions" ,data.actions_count,db_functions.getActionsByTagName,createTabs);
            addSlides("blogs" ,data.blogs_count,db_functions.getBlogsByTagName,createTabs);

        });
    });
}
function hideSearchResults()
{
    $('.search-result-box').hide();
    $("body").removeClass("search-ative");
    return false;

}


function addSlides(name,count, getItemsByTagName, callbackCreateTabs)
{
    var section_data = new Object();
    section_data.name= name;
    if (count>0)
    {
        getItemsByTagName  (search_term,function(err,data)
        {

            section_data.scroll =    data.objects.length >3;
            dust.render('search_section',section_data,function(err,out)
            {
                $(".tabs").append(out);


                for(i=0 ; i<data.objects.length ; i+=3)
                {
                    $.each(data.objects,function(index,tag)
                    {
                        tag.section= name;
                    });
                    var items= new Object();
                    items.items=   data.objects.slice (i,i+3);


                    dust.render('search_3_slides',items,function(err,out)
                    {
                        $("#tabs-"+name+" .tab-slide").append(out);
                    });
                }

                //bugbug - timimg issue with rendering
                //  if(data.objects.length >3)
                //  {
                $('.tab-slide-'+name).after('<div class="nav-'+name+' nav">')
                    .cycle({
                        fx: 'scrollHorz',
                        speed: 'fast',
                        timeout: 0,
                        pager: '.nav-'+name,
                        next: '.prev-'+name,
                        prev: '.next-'+name
                    });

                //  }

                callbackCreateTabs();



            });

        });

    }
    else
    {
        dust.render('search_section_empty',section_data,function(err,out) {
            $(".tabs").append(out);
            callbackCreateTabs();
        });
    }
}

$("#search_term").blur(function() {
    setTimeout( "$('#search_suggest').hide()",200);

});

$("#search_suggest").on("click","li",  function() {
    $("#search_term").val($(this).text());
    $("#search_suggest").hide();
    $('#search_form').submit();
});

var cache = {}
var curret_term="";
$("#search_term").keyup(function() {

    var term = $(this).val();
    if(term.length<2) {
        $("#search_suggest").hide();
        return;
    }
    curret_term=     term;
    if ( term in cache ) {
        displaySuggestResults( cache[ term ] );
        return;
    }

    db_functions.getTagsBySearchTerm(term,function( ret_term, err, data ) {
        cache[ term ] = data.objects;
        if ( curret_term === ret_term ) {
            displaySuggestResults(data.objects);
        }
    });
});

function displaySuggestResults(tags)
{

    $("#search_suggest li:first").siblings().remove();
    if(tags.length>0)
    {
        dust.renderArray('search_suggest_item', tags, null, function (err, out) {
            $("#search_suggest").append(out);
            $("#search_suggest").show();
        });
    }
    else
    {
        $("#search_suggest").hide();

    }
}
/*
 $( "#search_term" ).autocomplete({
 minLength: 2,
 source: function( request, response ) {
 var term = request.term;
 if ( term in cache ) {
 response( cache[ term ] );
 return;
 }

 db_functions.getTagsBySearchTerm(term,function( ret_term, err, data ) {
 cache[ term ] = data;
 if ( term === ret_term ) {
 response( $.map(data.objects, function(item) {
 return {
 label: item.tag,
 value: item._id
 }
 }))  ;
 }
 });
 }
 });
 */

});