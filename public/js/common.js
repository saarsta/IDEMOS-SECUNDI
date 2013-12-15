
window.console || (window.console = { log: function(str) { }, error: function(str) { }})

dust.filters['time'] = function(a){
   // console.log(a);
    var date = $.datepicker.formatDate('dd.mm.yy', new Date(Date.parse(a)));
    var date_short = $.datepicker.formatDate('d.m', new Date(Date.parse(a)));
    var hours = (new Date(Date.parse(a))).getHours();
    var minutes = (new Date(Date.parse(a))).getMinutes();
    if(minutes < 10)
        minutes = "0" + minutes;
    var time = hours + ":" + minutes;

    return date + " " + time;
};

dust.filters['time_only'] = function(a){

    var hours = (new Date(Date.parse(a))).getHours();
    var minutes = (new Date(Date.parse(a))).getMinutes();
    if(minutes < 10)
        minutes = "0" + minutes;
    return hours + ":" + minutes;

};

dust.filters['round'] = function(num){
    return Math.round(num);
};

dust.filters['date'] = function(a){
    return $.datepicker.formatDate('dd.mm.yy', new Date(Date.parse(a)));
};

dust.filters['date_short'] = function(a){
    return $.datepicker.formatDate('d.m', new Date(Date.parse(a)));
};

dust.filters['length'] = function(arr) {
    return arr.length;
};

dust.filters['grade'] = function(grade) {
    return Math.round(grade * 100)/100;
};
var tags_replace = {
    'b' : 'b',
    'i' : 'i',
    'u' : 'u',
    's': 's'
};

dust.filters['tags'] = function(text) {
    $.each(tags_replace,function(key,value) {
        text = text.replace(RegExp('\\[' + key + '\\]','g'),'<' + value + '>').replace(RegExp('\\[\\/' + key +  '\\]','g'),'</' + value + '>')
    });
    text = text.replace(/\[list\]/g,'<ul><li>').replace(/\[\/list\]/g,'</li></ul>');
    text = text.replace(/\[\*\]/g,'</li><li>').replace(/<ul><li>(.|\n)*?<\/li>/g,'<ul>');
    text = text.replace(/\[url(?:=([^\]]*))\]((?:.|\n)*)?\[\/url\]/,'<a href="$1" target="_blank">$2</a>')
    text = text.replace(/([^"]\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");
    text = text//eplace(/\[url\]((?:.|\n)*)?\[\/url\]/,'<a href="$1" target="_blank">$1</a>')

    return text;
};

dust.filters['check'] = function(text) {
    text = text.replace(/<iframe(.*?)<\/iframe>/g,"");
    return text;
}
dust.filters['post'] = function(text) {
    var isHtml = text.indexOf('<p') == 0;
    text = dust.filters['tags'](text);
    text = text.replace(/\[(?:quote|ציטוט)=(?:"|&quot;)(.*?)(?:"|&quot;)\s*\]\n?((?:.|\n)*?)\n?\[\/(?:quote|ציטוט)\]\n?/g,
        '<div class="post_quote" ><p style="font-style:italic" ><a class="ref_link" href="javascript:void(0);" style="display: block; margin-bottom: 8px; text-decoration: underline;">' +
            ' $1 כתב:' +
            '</a>' +
            '$2' + '</p></div><br><span class="actual_text">');
    if(!isHtml)
        text = text.replace(/\n/g,'<br>');
    text = text + '</span></p>';
    return text;
}

dust.filters['new_post'] = function(text) {
    var isHtml = text.indexOf('<p') == 0;
    text = dust.filters['tags'](text);
    text = text.replace(/\[(?:quote|ציטוט)=(?:"|&quot;)(.*?)(?:"|&quot;)\s*\]\n?((?:.|\n)*?)\n?\[\/(?:quote|ציטוט)\]\n?/g,
        '<div class="quote" ><a class="ref_link" href="javascript:void(0);" style="display: block; margin-bottom: 8px; text-decoration: underline;">' +
            ' $1:' +
            '</a>' +
            '$2' +
            '</div>');
    if(!isHtml)
        text = text.replace(/\n/g,'<br>');
    text = text + '</span></p>';
    return text;
}

dust.filters['qa'] = function(text) {
    text = dust.filters['tags'](text);
    text = text.replace(/\[img\s*(?:,\s*width=(\d+))?\s*(?:,\s*height=(\d+))?\](.*?)\[\/img\]/g,'<div class="auto-scale" style="width:$1px; height:$2px;"><img src="$3"></div>');
    text = text.replace("undefined", 230);

    return text;
};

// cleans quotes, leaves quoted text
dust.filters['comment'] = function(text) {
    text = dust.filters['tags'](text);
    text = text.replace(/\[(?:quote|ציטוט)=(?:"|&quot;)([^"&]*)(?:"|&quot;)\s*\]\n?((?:.|\n)*)?\n?\[\/(?:quote|ציטוט)\]\n?/g,'');
    return text;
};

dust.filters['link'] = function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1'>$1</a>");
}

dust.renderArray = function(template,arr,callback,endCallback)
{
    var out_arr = [];
    var _err = null;
    for(var i=0; i<arr.length; i++)
    {
        dust.render(template,arr[i],function(err,out){
            if(callback)
                callback(err,out);
            if(err)
                _err = err;
            out_arr.push(out);
        });
    }
    if(endCallback)
        endCallback(_err,out_arr.join(''));
};

var scrollTo = function(selector, options){
    options = options || {};
    var offset = $(selector).offset();
    if (offset) {
        $('html, body').animate({
            scrollTop:offset.top
        }, options.duration || 800);
        return true;
    }
    return false;
}

var connectPopup = function(callback){

    //open popup window
     popupProvider.showLoginPopup({}, callback);

};


var tokensInformationPopup = function(needed_tokens, user_tokens, needs_guide_page){

    var msg = "עבור פעולה זו נדרשים" +

        " " +
        "אסימונים"

    if(needs_guide_page){
        msg += '<p><a href="#">למדריך לחץ כאן</a></p>';
    }

    popupProvider.showOkPopup({
        message: msg
    });
};

var notActivatedPopup = function(msg) {
    popupProvider.showOkPopup({
        message: msg
    });
};

var getURLParameter = function (name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

function initTooltip(ui){
    ui.tooltipText({
        bodyHandler: function() {
            return "" +
                "בקרוב"
        },
        showURL: false
    });
    ui.attr('disabled','disabled');
    ui.attr('href','javascript:void(0)');
}

function initTooltipWithMessage(ui, message){
    ui.tooltipText({
        bodyHandler: function() {
            return "" +
                message
        },
        showURL: false
    });
    ui.attr('disabled','disabled');
    ui.attr('href','javascript:void(0)');
}

function fbs_click(ui) {

    ui.click( function() {

        sendFacebookShare($(this).attr('rel'), $(this).data('title'), $(this).data('img_src'), $(this).data('text_preview'), $(this).attr('rel'), function(err) {
            console.log(err);
        });
//            var u = ;
//            window.open(
//                'http://www.facebook.com/sharer.php?u=' + encodeURIComponent(host + u),
//                'sharer',
//                'toolbar=0,status=0'
//            );
        return false;
    });
    ui.attr('href','javascript:void(0);');
}


// handle image loading stuff

$(function(){

    var is_new = /is_new=([^&#]+)/.exec(window.location.href);
    if(is_new) {
        var pixel = '<!-- Postclick Tracking Tag Start --><img src="https://secserv.adtech.de/pcsale/3.0/1158/0/0/0/BeaconId=13757;rettype=img;subnid=1;SalesValue=100;;custom1=' + encodeURIComponent(mail) + '" width="1" height="1"><!-- Postclick Tracking Tag End -->';
        if(is_new[1] == 'register')
            popupProvider.showOkPopup({
                message:'הרשמתך התקבלה בהצלחה. כדי להפעיל את חשבון המשתמש שלך, אנא פתח את מייל המערכת שנשלח לכתובת ' +
                    'שנרשמת איתה.'
                    +
                    pixel

            });
        if(is_new[1] == 'facebook')
            popupProvider.showOkPopup({
                message:'הרשמתך התקבלה בהצלחה.'   +   pixel
            });
        if(is_new[1] == 'activated')
            popupProvider.showOkPopup({
                message:'הרשמתך התקבלה בהצלחה.'            +   pixel
            });
        if(is_new[1] == 'reset')
            popupProvider.showOkPopup({
                message:'הסיסמא שונתה בהצלחה.'
            });
    }


    $('#election_menu').live('click', function(){
        window.location.replace('www.uru.org.il/elections');
    })

    $('.link_to_resource').live('click', function(){
        var link = $(this).data('link');
        window.location.replace(link);
    })

    $('#register_form').submit(function() {
        // get all the inputs into an array.
        var $inputs = $('#register_form :input');

        // get an associative array of just the values.
        var values = {};
        $inputs.each(function() {
            values[this.name] = $(this).val();
        });


        db_functions.login(values["email"], values["password"], function(err, result){
            if(err){
                $("#login_head").text(err.responseText || "נסה שוב");
            }
            else{
                window.location.href = window.location.href;
            }

        });
        return false;
    });

    $("#fb_connect").live('click', function(){
        facebookLogin(function(err, result){
            if(!err){
                if(result.is_new) {
                    if(window.location.href.indexOf('?') > -1)
                        window.location.href = window.location.href + '&is_new=facebook';
                    else
                        window.location.href = window.location.href + '?is_new=facebook';
                }
                else
                    window.location.href = window.location.href;
            }else{
                console.error(err);
                $("#login_head").text("קרתה תקלה");
            }
        });
    });


    var host = window.location.protocol + '//' + window.location.host;

    $('input, textarea').placeholder();

    $('#failureForm').live('submit', function(e){
        e.preventDefault();
        var feedbackTb=this.feedbackTb;
        if(feedbackTb.value.replace(/\s/g,"") == ""){
            return;
        }
        db_functions.addKilkul(this.feedbackTb.value ,function(error,data){
            if(error){
                console.log(error);
            }else{
                feedbackTb.value='';
            }
        });

    });

    db_functions.getAndRenderFooterTags();


    var inCallback = false;

    var callback = function(event){
        if(inCallback)
            return;
        inCallback = true;
        var target_element = event.srcElement || event.target;
        if(target_element){
            if($(target_element).is('.auto-scale'))
                image_autoscale($('img',target_element));
            else
            {
                var autoscale = $('.auto-scale',target_element);
                if(autoscale.length)
                    image_autoscale($('img',autoscale));
            }
            if($(target_element).is('.gray_and_soon'))
                initTooltip($(target_element));
            else
            {
                var tooltip = $('.gray_and_soon',target_element);
                if(tooltip.length)
                    initTooltip(tooltip);
            }
            if($(target_element).is('.share'))
                fbs_click($(target_element));
            else
            {
                var share = $('.share',target_element);
                if(share.length)
                    fbs_click(share);
            }

            if($(target_element).is('.action_comming_soon'))
                initTooltipWithMessage($(target_element), "יעלה בקרוב");
            else
            {
                var tooltip = $('.action_comming_soon',target_element);
                if(tooltip.length)
                    initTooltipWithMessage(tooltip, "יעלה בקרוב");
            }
        }
        inCallback = false;
    };

    if($.browser.msie && Number($.browser.version) == 8)
    {
        var _append = Element.prototype.appendChild;
        Element.prototype.appendChild = function()
        {
            _append.call(this,arguments[0],arguments[1]);
            callback({srcElement:this});
        };
    }
    else
        $('body').bind('DOMNodeInserted',callback);

    image_autoscale($('.auto-scale img'));
    initTooltip($(".gray_and_soon"));
    fbs_click($('.share'));
    initTooltipWithMessage($(".cycle_comming_soon"), "כאן יתקיים התהליך למימוש המציאות הנדרשת שהסכמנו לגביה במערכת הדיונים, באמצעות פעולות, אירועים ועדכונים שוטפים. יעלה בקרוב."   );
    initTooltipWithMessage($(".action_comming_soon"), "יעלה בקרוב");
});

$.fn.autoscale = $.fn.imgscale;

function image_autoscale(obj, params) {
    $(obj).autoscale(params);
};

//animateCluster([$('#d1'),$('#d2')]);
//animateCluster([$('#a1'),$('#a2'),$('#a3'),$('#a4')]);
function animateCluster  (items)
{
   //debugger;
    var isSpread=false,
        isOpening=false,
        isClosing=false,
        unspread=null;

    if(items.length==2)
    {
        var  left=items[0],
            right= items[1];
        left.mouseout(unspreadTimer2);
        left.mouseover(spread2);
        right.mouseout(unspreadTimer2);
        right.mouseover(spread2);



        left.animate({left: '-=4'}, 500);
        right.animate({left: '+=4'}, 500);

    }
    else if(items.length==3)
    {

        var  left=items[0],
            center=items[1],
            right= items[2];
        left.mouseout(unspreadTimer3);
        left.mouseover(spread3);
        right.mouseout(unspreadTimer3);
        right.mouseover(spread3);
        center.mouseout(unspreadTimer3);
        center.mouseover(spread3);
        center.css("z-index",2);
        left.animate({left: '-=8'}, 500);
        right.animate({left: '+=8'}, 500);

    }
    else if(items.length==4)
    {

        var  left=items[0],
            center_left=items[1],
            center_right=items[2],
            right= items[3];
        left.mouseout(unspreadTimer4);
        left.mouseover(spread4);
        right.mouseout(unspreadTimer4);
        right.mouseover(spread4);
        center_left.mouseout(unspreadTimer4);
        center_left.mouseover(spread4);
        center_right.mouseout(unspreadTimer4);
        center_right.mouseover(spread4);

        left.animate({left: '-=12'}, 500);
        right.animate({left: '+=12'}, 500);
        center_left.animate({left: '-=4'}, 500);
        center_right.animate({left: '+=4'}, 500);
    }

    function spread4(){

        clearTimeout(unspread);
        if(!isSpread && !isOpening && !isClosing ) {
            isOpening=true;
            left.animate({
                opacity: 1,
                left: '-=35'
            }, 200, function() {

            });
            center_left.animate({
                opacity: 1,
                left: '-=12'
            }, 200, function() {

            });
            center_right.animate({
                opacity: 1,
                left: '+=12'
            }, 200, function() {

            });
            right.animate({
                opacity: 1,
                left: '+=35'
            }, 200, function() {
                isSpread=true;
                isOpening=false;


            });
        } ;
    }
    function unspreadTimer4(){
        if((isSpread || isOpening)&& ! isClosing) {

            clearTimeout(unspread);

            unspread=setTimeout(function(){
                isClosing=true;
                left.animate({
           //         opacity: 0.5,
                    left: '+=35'
                }, 500, function() {

                });
                center_left.animate({
         //           opacity: 0.5,
                    left: '+=12'
                }, 500, function() {

                });
                center_right.animate({
         //           opacity: 0.5,
                    left: '-=12'
                }, 500, function() {

                });
                right.animate({
           //         opacity: 0.5,
                    left: '-=35'
                }, 500, function() {
                    isSpread=false;
                    isClosing=false;

                });
            }, 1500);
        }
    }
    function spread3(){

        clearTimeout(unspread);
        if(!isSpread && !isOpening && !isClosing ) {
            isOpening=true;
            left.animate({
                opacity: 1,
                left: '-=25'
            }, 200, function() {

            });
            center.animate({
                opacity: 1

            }, 200, function() {

            });
            right.animate({
                opacity: 1,
                left: '+=25'
            }, 200, function() {
                isSpread=true;
                isOpening=false;


            });
        } ;
    }
    function unspreadTimer3(){
        if((isSpread || isOpening)&& ! isClosing) {

            clearTimeout(unspread);

            unspread=setTimeout(function(){
                isClosing=true;
                left.animate({
            //        opacity: 0.5,
                    left: '+=25'
                }, 500, function() {

                });
                center.animate({
             //       opacity: 0.5
                }, 500, function() {

                });


                right.animate({
              //      opacity: 0.5,
                    left: '-=25'
                }, 500, function() {
                    isSpread=false;
                    isClosing=false;

                });
            }, 1500);
        }
    }

    function spread2(){

        clearTimeout(unspread);
        if(!isSpread && !isOpening && !isClosing ) {
            isOpening=true;
            left.animate({
                opacity: 1,
                left: '-=15'
            }, 200, function() {

            });
            right.animate({
                opacity: 1,
                left: '+=15'
            }, 200, function() {
                isSpread=true;
                isOpening=false;


            });
        } ;
    }
    function unspreadTimer2(){
        if((isSpread || isOpening)&& ! isClosing) {

            clearTimeout(unspread);

            unspread=setTimeout(function(){
                isClosing=true;
                left.animate({
      //              opacity: 0.5,
                    left: '+=15'
                }, 500, function() {

                });

                right.animate({
      //              opacity: 0.5,
                    left: '-=15'
                }, 500, function() {
                    isSpread=false;
                    isClosing=false;

                });
            }, 1500);
        }
    }

}

var logFunctionCalls = function (f, name) {
	var stringify = function (x) {
		if (typeof x == "function") {
			return '(function ' + x.name + ')';
		} else {
			try {
				return JSON.stringify(x);
			} catch (e) {
				return x.toString();
			}
		}
	};

	return function () {
		var call = '';
		// context
		if (this && this != window) {
			call += stringify(this);
		}

		// name
		call += name || f.name || 'anonymous';

		// arguments
		var first = true;
		call += '(';
		for (var i = 0; i < arguments.length; i++) {
			if (first) {
				first = false;
			} else {
				call += ', ';
			}

			call += stringify(arguments[i]);
		}
		call += ')';

		// Call the function, log the call and result
		console.log('Calling ' + call);
		var result = f.apply(this, arguments);
		console.log(call + ' = ' + stringify(result));
		return result;
	};
};

var googleMap =(function(){
    var map;
    return {
        init_map: function ( id , center) {
            var myOptions = {
                zoom: 11,
                center: center,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                panControl: false,
                zoomControl: false,
                scaleControl: false,
                mapTypeControl: false,
                streetViewControl: false
            };
            map = new google.maps.Map(document.getElementById( id ), myOptions);
            return map;
        },
        addPlaceMark:function (point,tooltip) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(point.lat,point.lng),
                title:tooltip
            });
            marker.setMap(map);
            return marker;

            var marker = new google.maps.Marker({
                map: map,
                draggable:false,
                position: new google.maps.LatLng(point.lat,point.lng),
                visible: true
            });
        }
    };
})();

var getUserPosition = function(user_position, cbk){
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            console.log(position);
            user_position.lat = position.coords.latitude;
            user_position.lng = position.coords.longitude;
        });
    }
    cbk(user_position);
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateName(name) {
    var re = /^\S{2,}[ ]+\S{2,}$/;
    var b=re.test(name)
    return b;
}
