jQuery.webshims.register("mediaelement-swf",function(c,e,k,s,p,i){var l=e.mediaelement,y=k.swfobject,t=Modernizr.audio&&Modernizr.video,z=y.hasFlashPlayerVersion("9.0.115"),q=0,k={paused:!0,ended:!1,currentSrc:"",duration:k.NaN,readyState:0,networkState:0,videoHeight:0,videoWidth:0,error:null,buffered:{start:function(a){if(a)e.error("buffered index size error");else return 0},end:function(a){if(a)e.error("buffered index size error");else return 0},length:0}},H=Object.keys(k),A={currentTime:0,volume:1,
muted:!1};Object.keys(A);var B=c.extend({isActive:"html5",activating:"html5",wasSwfReady:!1,_bufferedEnd:0,_bufferedStart:0,_metadata:!1,_durationCalcs:-1,_callMeta:!1,currentTime:0,_ppFlag:p},k,A),C=/^jwplayer-/,j=function(a){if(a=s.getElementById(a.replace(C,"")))return a=e.data(a,"mediaelement"),"third"==a.isActive?a:null},m=function(a){return(a=e.data(a,"mediaelement"))&&"third"==a.isActive?a:null},g=function(a,b){b=c.Event(b);b.preventDefault();c.event.trigger(b,p,a)},I=i.playerPath||e.cfg.basePath+
"jwplayer/"+(i.playerName||"player.swf"),D=i.pluginPath||e.cfg.basePath+"swf/jwwebshims.swf";e.extendUNDEFProp(i.params,{allowscriptaccess:"always",allowfullscreen:"true",wmode:"transparent"});e.extendUNDEFProp(i.vars,{screencolor:"ffffffff"});e.extendUNDEFProp(i.attrs,{bgcolor:"#000000"});var v=function(a,b){var d=a.duration;if(!(d&&0<a._durationCalcs)){try{if(a.duration=a.jwapi.getPlaylist()[0].duration,!a.duration||0>=a.duration||a.duration===a._lastDuration)a.duration=d}catch(f){}a.duration&&
a.duration!=a._lastDuration?(g(a._elem,"durationchange"),("audio"==a._elemNodeName||a._callMeta)&&l.jwEvents.Model.META(c.extend({duration:a.duration},b),a),a._durationCalcs--):a._durationCalcs++}},h=function(a,b){3>a&&clearTimeout(b._canplaythroughTimer);if(3<=a&&3>b.readyState)b.readyState=a,g(b._elem,"canplay"),clearTimeout(b._canplaythroughTimer),b._canplaythroughTimer=setTimeout(function(){h(4,b)},4E3);if(4<=a&&4>b.readyState)b.readyState=a,g(b._elem,"canplaythrough");b.readyState=a};c.extend(c.event.customEvent,
{updatemediaelementdimensions:!0,flashblocker:!0,swfstageresize:!0,mediaelementapichange:!0});l.jwEvents={View:{PLAY:function(a){var b=j(a.id);if(b&&!b.stopPlayPause&&(b._ppFlag=!0,b.paused==a.state)){b.paused=!a.state;if(b.ended)b.ended=!1;g(b._elem,a.state?"play":"pause")}}},Model:{BUFFER:function(a){var b=j(a.id);if(b&&"percentage"in a&&b._bufferedEnd!=a.percentage){b.networkState=100==a.percentage?1:2;(isNaN(b.duration)||5<a.percentage&&25>a.percentage||100===a.percentage)&&v(b,a);if(b.ended)b.ended=
!1;if(b.duration){2<a.percentage&&20>a.percentage?h(3,b):20<a.percentage&&h(4,b);if(b._bufferedEnd&&b._bufferedEnd>a.percentage)b._bufferedStart=b.currentTime||0;b._bufferedEnd=a.percentage;b.buffered.length=1;if(100==a.percentage)b.networkState=1,h(4,b);c.event.trigger("progress",p,b._elem,!0)}}},META:function(a,b){if(b=b&&b.networkState?b:j(a.id))if("duration"in a){if(!b._metadata||!((!a.height||b.videoHeight==a.height)&&a.duration===b.duration)){b._metadata=!0;var d=b.duration;if(a.duration)b.duration=
a.duration;b._lastDuration=b.duration;if(a.height||a.width)b.videoHeight=a.height||0,b.videoWidth=a.width||0;if(!b.networkState)b.networkState=2;1>b.readyState&&h(1,b);b.duration&&d!==b.duration&&g(b._elem,"durationchange");g(b._elem,"loadedmetadata")}}else b._callMeta=!0},TIME:function(a){var b=j(a.id);if(b&&b.currentTime!==a.position){b.currentTime=a.position;b.duration&&b.duration<b.currentTime&&v(b,a);2>b.readyState&&h(2,b);if(b.ended)b.ended=!1;g(b._elem,"timeupdate")}},STATE:function(a){var b=
j(a.id);if(b)switch(a.newstate){case "BUFFERING":if(b.ended)b.ended=!1;h(1,b);g(b._elem,"waiting");break;case "PLAYING":b.paused=!1;b._ppFlag=!0;b.duration||v(b,a);3>b.readyState&&h(3,b);if(b.ended)b.ended=!1;g(b._elem,"playing");break;case "PAUSED":if(!b.paused&&!b.stopPlayPause)b.paused=!0,b._ppFlag=!0,g(b._elem,"pause");break;case "COMPLETED":4>b.readyState&&h(4,b),b.ended=!0,g(b._elem,"ended")}}},Controller:{ERROR:function(a){var b=j(a.id);b&&l.setError(b._elem,a.message)},SEEK:function(a){var b=
j(a.id);if(b){if(b.ended)b.ended=!1;if(b.paused)try{b.jwapi.sendEvent("play","false")}catch(d){}if(b.currentTime!=a.position)b.currentTime=a.position,g(b._elem,"timeupdate")}},VOLUME:function(a){var b=j(a.id);if(b&&(a=a.percentage/100,b.volume!=a))b.volume=a,g(b._elem,"volumechange")},MUTE:function(a){if(!a.state){var b=j(a.id);if(b&&b.muted!=a.state)b.muted=a.state,g(b._elem,"volumechange")}}}};var J=function(a){var b=!0;c.each(l.jwEvents,function(d,f){c.each(f,function(c){try{a.jwapi["add"+d+"Listener"](c,
"jQuery.webshims.mediaelement.jwEvents."+d+"."+c)}catch(r){return b=!1}})});return b},K=function(a){var b=a.actionQueue.length,d=0,c;if(b&&"third"==a.isActive)for(;a.actionQueue.length&&b>d;)d++,c=a.actionQueue.shift(),a.jwapi[c.fn].apply(a.jwapi,c.args);if(a.actionQueue.length)a.actionQueue=[]},E=function(a){a&&(a._ppFlag===p&&c.prop(a._elem,"autoplay")||!a.paused)&&setTimeout(function(){if("third"==a.isActive&&(a._ppFlag===p||!a.paused))try{c(a._elem).play()}catch(b){}},1)};l.playerResize=function(a){a&&
(a=s.getElementById(a.replace(C,"")))&&c(a).triggerHandler("swfstageresize")};c(s).on("emptied",function(a){a=m(a.target);E(a)});var u;l.jwPlayerReady=function(a){var b=j(a.id),d=0,f=function(){if(!(9<d))if(d++,J(b)){if(b.wasSwfReady)c(b._elem).mediaLoad();else{var g=parseFloat(a.version,10);(5.1>g||6<=g)&&e.warn("mediaelement-swf is only testet with jwplayer 5.6+")}b.wasSwfReady=!0;b.tryedReframeing=0;K(b);E(b)}else clearTimeout(b.reframeTimer),b.reframeTimer=setTimeout(f,9*d),2<d&&9>b.tryedReframeing&&
(b.tryedReframeing++,b.shadowElem.css({overflow:"visible"}),setTimeout(function(){b.shadowElem.css({overflow:"hidden"})},16))};if(b&&b.jwapi){if(!b.tryedReframeing)b.tryedReframeing=0;clearTimeout(u);b.jwData=a;b.shadowElem.removeClass("flashblocker-assumed");c.prop(b._elem,"volume",b.volume);c.prop(b._elem,"muted",b.muted);f()}};var w=c.noop;if(t){var L={play:1,playing:1},F="play,pause,playing,canplay,progress,waiting,ended,loadedmetadata,durationchange,emptied".split(","),G=F.map(function(a){return a+
".webshimspolyfill"}).join(" "),M=function(a){var b=e.data(a.target,"mediaelement");b&&(a.originalEvent&&a.originalEvent.type===a.type)==("third"==b.activating)&&(a.stopImmediatePropagation(),L[a.type]&&b.isActive!=b.activating&&c(a.target).pause())},w=function(a){c(a).off(G).on(G,M);F.forEach(function(b){e.moveToFirstEvent(a,b)})};w(s)}l.setActive=function(a,b,d){d||(d=e.data(a,"mediaelement"));if(d&&d.isActive!=b){"html5"!=b&&"third"!=b&&e.warn("wrong type for mediaelement activating: "+b);var f=
e.data(a,"shadowData");d.activating=b;c(a).pause();d.isActive=b;"third"==b?(f.shadowElement=f.shadowFocusElement=d.shadowElem[0],c(a).addClass("swf-api-active nonnative-api-active").hide().getShadowElement().show()):(c(a).removeClass("swf-api-active nonnative-api-active").show().getShadowElement().hide(),f.shadowElement=f.shadowFocusElement=!1);c(a).trigger("mediaelementapichange")}};var N=function(){var a="_bufferedEnd,_bufferedStart,_metadata,_ppFlag,currentSrc,currentTime,duration,ended,networkState,paused,videoHeight,videoWidth,_callMeta,_durationCalcs".split(","),
b=a.length;return function(d){if(d){var c=b,e=d.networkState;for(h(0,d);--c;)delete d[a[c]];d.actionQueue=[];d.buffered.length=0;e&&g(d._elem,"emptied")}}}(),x=function(a,b){var d=a._elem,f=a.shadowElem;c(d)[b?"addClass":"removeClass"]("webshims-controls");"audio"==a._elemNodeName&&!b?f.css({width:0,height:0}):f.css({width:d.style.width||c(d).width(),height:d.style.height||c(d).height()})};l.createSWF=function(a,b,d){if(z){1>q?q=1:q++;var f=c.extend({},i.vars,{image:c.prop(a,"poster")||"",file:b.srcProp}),
g=c(a).data("vars")||{};d||(d=e.data(a,"mediaelement"));if(d&&d.swfCreated)l.setActive(a,"third",d),N(d),d.currentSrc=b.srcProp,c.extend(f,g),i.changeSWF(f,a,b,d,"load"),n(a,"sendEvent",["LOAD",f]);else{var r=c.prop(a,"controls"),o="jwplayer-"+e.getID(a),j=c.extend({},i.params,c(a).data("params")),h=a.nodeName.toLowerCase(),m=c.extend({},i.attrs,{name:o,id:o},c(a).data("attrs")),k=c('<div class="polyfill-'+h+' polyfill-mediaelement" id="wrapper-'+o+'"><div id="'+o+'"></div>').css({position:"relative",
overflow:"hidden"}),d=e.data(a,"mediaelement",e.objectCreate(B,{actionQueue:{value:[]},shadowElem:{value:k},_elemNodeName:{value:h},_elem:{value:a},currentSrc:{value:b.srcProp},swfCreated:{value:!0},buffered:{value:{start:function(a){if(a>=d.buffered.length)e.error("buffered index size error");else return 0},end:function(a){if(a>=d.buffered.length)e.error("buffered index size error");else return(d.duration-d._bufferedStart)*d._bufferedEnd/100+d._bufferedStart},length:0}}}));x(d,r);k.insertBefore(a);
t&&c.extend(d,{volume:c.prop(a,"volume"),muted:c.prop(a,"muted")});c.extend(f,{id:o,controlbar:r?i.vars.controlbar||("video"==h?"over":"bottom"):"video"==h?"none":"bottom",icons:""+(r&&"video"==h)},g,{playerready:"jQuery.webshims.mediaelement.jwPlayerReady"});f.plugins=f.plugins?f.plugins+(","+D):D;e.addShadowDom(a,k);w(a);l.setActive(a,"third",d);i.changeSWF(f,a,b,d,"embed");c(a).on("updatemediaelementdimensions updateshadowdom",function(){x(d,c.prop(a,"controls"))});y.embedSWF(I,o,"100%","100%",
"9.0.0",!1,f,j,m,function(b){if(b.success)d.jwapi=b.ref,r||c(b.ref).attr("tabindex","-1").css("outline","none"),setTimeout(function(){if(!b.ref.parentNode&&k[0].parentNode||"none"==b.ref.style.display)k.addClass("flashblocker-assumed"),c(a).trigger("flashblocker"),e.warn("flashblocker assumed");c(b.ref).css({minHeight:"2px",minWidth:"2px",display:"block"})},9),u||(clearTimeout(u),u=setTimeout(function(){var a=c(b.ref);1<a[0].offsetWidth&&1<a[0].offsetHeight&&0===location.protocol.indexOf("file:")?
e.error("Add your local development-directory to the local-trusted security sandbox:  http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html"):(2>a[0].offsetWidth||2>a[0].offsetHeight)&&e.warn("JS-SWF connection can't be established on hidden or unconnected flash objects")},8E3))})}}else setTimeout(function(){c(a).mediaLoad()},1)};var n=function(a,b,d,c){return(c=c||m(a))?(c.jwapi&&c.jwapi[b]?c.jwapi[b].apply(c.jwapi,d||[]):(c.actionQueue.push({fn:b,args:d}),10<
c.actionQueue.length&&setTimeout(function(){5<c.actionQueue.length&&c.actionQueue.shift()},99)),c):!1};["audio","video"].forEach(function(a){var b={},d,f=function(c){"audio"==a&&("videoHeight"==c||"videoWidth"==c)||(b[c]={get:function(){var a=m(this);return a?a[c]:t&&d[c].prop._supget?d[c].prop._supget.apply(this):B[c]},writeable:!1})},h=function(a,c){f(a);delete b[a].writeable;b[a].set=c};h("volume",function(a){var b=m(this);if(b){if(a*=100,!isNaN(a)){var c=b.muted;(0>a||100<a)&&e.error("volume greater or less than allowed "+
a/100);n(this,"sendEvent",["VOLUME",a],b);if(c)try{b.jwapi.sendEvent("mute","true")}catch(f){}a/=100;if(!(b.volume==a||"third"!=b.isActive))b.volume=a,g(b._elem,"volumechange")}}else if(d.volume.prop._supset)return d.volume.prop._supset.apply(this,arguments)});h("muted",function(a){var b=m(this);if(b){if(a=!!a,n(this,"sendEvent",["mute",""+a],b),!(b.muted==a||"third"!=b.isActive))b.muted=a,g(b._elem,"volumechange")}else if(d.muted.prop._supset)return d.muted.prop._supset.apply(this,arguments)});h("currentTime",
function(a){var b=m(this);if(b){if(a*=1,!isNaN(a)){if(b.paused)clearTimeout(b.stopPlayPause),b.stopPlayPause=setTimeout(function(){b.paused=!0;b.stopPlayPause=!1},50);n(this,"sendEvent",["SEEK",""+a],b);if(b.paused){if(0<b.readyState)b.currentTime=a,g(b._elem,"timeupdate");try{b.jwapi.sendEvent("play","false")}catch(c){}}}}else if(d.currentTime.prop._supset)return d.currentTime.prop._supset.apply(this,arguments)});["play","pause"].forEach(function(a){b[a]={value:function(){var b=m(this);if(b)b.stopPlayPause&&
clearTimeout(b.stopPlayPause),n(this,"sendEvent",["play","play"==a],b),setTimeout(function(){if("third"==b.isActive&&(b._ppFlag=!0,b.paused!=("play"!=a)))b.paused="play"!=a,g(b._elem,a)},1);else if(d[a].prop._supvalue)return d[a].prop._supvalue.apply(this,arguments)}}});H.forEach(f);e.onNodeNamesPropertyModify(a,"controls",function(b,d){var f=m(this);c(this)[d?"addClass":"removeClass"]("webshims-controls");if(f){try{n(this,d?"showControls":"hideControls",[a],f)}catch(g){e.warn("you need to generate a crossdomain.xml")}"audio"==
a&&x(f,d);c(f.jwapi).attr("tabindex",d?"0":"-1")}});d=e.defineNodeNameProperties(a,b,"prop")});if(z){var O=c.cleanData,P=c.browser.msie&&9>e.browserVersion,Q={object:1,OBJECT:1};c.cleanData=function(a){var b,c,e;if(a&&(c=a.length)&&q)for(b=0;b<c;b++)if(Q[a[b].nodeName]){if("sendEvent"in a[b]){q--;try{a[b].sendEvent("play",!1)}catch(g){}}if(P)try{for(e in a[b])"function"==typeof a[b][e]&&(a[b][e]=null)}catch(h){}}return O.apply(this,arguments)}}t||(["poster","src"].forEach(function(a){e.defineNodeNamesProperty("src"==
a?["audio","video","source"]:["video"],a,{reflect:!0,propType:"src"})}),["autoplay","controls"].forEach(function(a){e.defineNodeNamesBooleanProperty(["audio","video"],a)}),e.defineNodeNamesProperties(["audio","video"],{HAVE_CURRENT_DATA:{value:2},HAVE_ENOUGH_DATA:{value:4},HAVE_FUTURE_DATA:{value:3},HAVE_METADATA:{value:1},HAVE_NOTHING:{value:0},NETWORK_EMPTY:{value:0},NETWORK_IDLE:{value:1},NETWORK_LOADING:{value:2},NETWORK_NO_SOURCE:{value:3}},"prop"))});
