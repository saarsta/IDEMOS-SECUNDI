/**
 * Created by PyCharm.
 * User: roi
 * Date: 18/10/11
 * Time: 13:05
 * To change this template use File | Settings | File Templates.
 */

var maps = new Array();
var geocoder = window.google ? new google.maps.Geocoder() : null;

$.fn.geopicker = function(params)
{
    if(!this.length)
        return this;
    var defaults = {};
    params = params || {};
    for(var key in params)
        defaults[key] = params[key];
    var elm = $(this);
    var address_input = defaults['address_field'];
    var map_id = defaults['map_id'];
    if(!address_input)
        address_input = elm.attr('address_field');
    if(!map_id)
        map_id = elm.is('[map_id]')? elm.attr('map_id') : null;
    var map;
    var marker;
    var center;
    var init = function()
    {
        if(!map_id)
        {
            var num = Number(new Date());
            map_id = 'map' + num;
            $('<div class="geopicker_map" id="' + map_id + '" style="width:300px; height:300px;"></div>').insertAfter(elm);
        }

////        var button_id = defaults['button_id'];
//        var button = button_id ? $('#' + button_id) : $('<div class="my_location">My Location</div>').insertAfter(elm);

//        button.click(function()
//        {
//            user_position(function(loc)
//            {
//                center = loc;
//                update_location(new google.maps.LatLng(loc.lat, loc.lng));
//            });
//        });
        var latlng = elm.val() || '0,0';

        var m_init_map = function()
        {
            map = init_map(map_id,center);
            marker = add_draggable_marker(map, center, function(loc)
            {
                update_location(loc);
                if(address_input )
                {
                    var geo = new google.maps.Geocoder();
                    geo.geocode( { latLng: loc },function(results,status)
                    {
                        if(results && results.length > 0)
                            $('#' + address_input).val(results[0].formatted_address);
                    });
                }
            });
            if(address_input)
                address_autocomplete(address_input,map_id, function(location) {
                    update_location(location.geometry.location);
                    marker.setPosition(location.geometry.location);
                });
        }
        center = { lat: latlng.split(',')[0], lng: latlng.split(',')[1]};
        if(center.lat == 0.0 && center.lng == 0.0)
        {
            user_position(function(loc)
            {
                center = loc;
                m_init_map();
                update_location(marker.getPosition());
            }, function()
            {
                m_init_map();
            });
        }
        else
            m_init_map();

    };

    var update_location = function(loc)
    {
        var lat = loc.lat();
        var lng = loc.lng();
        elm.val(lat + ',' + lng);
    };

    init();
};

$.fn.geoview = function(params)
{
    if(!this.length)
        return this;

    var defaults = {};
    params = params || {};
    for(var key in params)
        defaults[key] = params[key];
    var elm = $(this);

    var map;
    var marker;
    var center;
    var init = function()
    {
        var map_id = defaults['map_id'];
        var map_div = null;
        if(!map_id)
        {
            var num = Number(new Date());
            map_id = 'map' + num;
            $('<div class="geopicker_map" id="' + map_id + '"></div>').insertAfter(elm);
        }
        var latlng = elm.val() || '0,0';
        center = { lat: latlng.split(',')[0], lng: latlng.split(',')[1]};
        map = init_map(map_id,center);
        marker = add_draggable_marker(map, center,null,function(me){
            init_street_view(map_id,marker.getPosition());
        });
    };

    init();

};

$(document).ready(function()
{
   $('.nf_mapview').geopicker();
});

function user_position(success,error)
{
	var fallbacked = false;
	function fallback()
	{
		// get from ip
		if(fallbacked)
			return;
		fallbacked = true;
        if(window.ip2location_latitude && window.ip2location_longitude)
        {
            var lat = ip2location_latitude();
            var lng = ip2location_longitude();
            success({ lat:Number(lat), lng: Number(lng)});
        }
		else
            error('not supported');
	}
	// if have HTML5
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(loc)
        {
			// no need for fallbacks
			fallbacked = true;
            success({ lat: loc.coords.latitude, lng:loc.coords.longitude });
        },function(error)
		{
			fallback();
		},{timeout:15000});
		// our own timeout
		setTimeout(fallback, 50);
    } else {
		// no HTML5
		fallback();
    }
}

function init_map( id , center){
      if (!center) center = new google.maps.LatLng(-34.397, 34.644);
      else center = new google.maps.LatLng(center.lat, center.lng);
      var myOptions = {
        zoom: 12,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      var map = new google.maps.Map(document.getElementById( id ), myOptions);
      maps[ id ] = map;
     return map;
}
function add_draggable_marker(map,center, location_changed, onclick)
{
    if (!center) center = new google.maps.LatLng(-34.397, 34.644);
    else center = new google.maps.LatLng(center.lat, center.lng);
    var  marker = new google.maps.Marker({
        map: map,
        position: center
    });
    if( onclick)
        google.maps.event.addListener(marker,'click',onclick);
    if(location_changed)
    {
        marker.setDraggable(true);
        google.maps.event.addListener(marker, 'dragend', function(me) {
                location_changed(me.latLng);
        });
    }
    return marker;
}

function get_map(id){
    return maps[id];
}

function stringToLocation( str ){
    str = str.replace("(","").replace(")","").replace(" ","");
    str = str.split(",");
    return new google.maps.LatLng(str[ 0 ], str[ 1 ] );
}
function addMarker( map, loc , marker_icon  , tooltip , link ){
    if ( ! marker_icon ) marker_icon = "http://www.google.com/mapfiles/marker.png";
    var marker = new google.maps.Marker({
                                      position: loc,
                                      map: map,
                                      title:tooltip ,
                                      icon: marker_icon
                                    });
    if (link) {
            google.maps.event.addListener(marker, 'click', function() {
                window.location = link;
            });
    }
}

function getLocation(lat , lng){
    return  new google.maps.LatLng( lat, lng );
}
function centerMap( map_id , loc ){
    var map = get_map( map_id );
    map.setCenter( loc);
}

function init_street_view( id , center ){
    var panoramaOptions = {
      position: center,
      pov: {
        heading: 0,
        pitch: 10,
        zoom: 1
      }
    };
    var panorama = new  google.maps.StreetViewPanorama(document.getElementById(id),panoramaOptions);
    //map.setStreetView(panorama);   //   <=== May be needed...
}

function getLocationFromAdrs( address , suc_callback , failed_callback){
        geocoder.geocode( { 'address': address}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                     var loc = results[0].geometry.location;
                     suc_callback(loc);
          }
          else
          {
                if (failed_callback)  failed_callback(status);
          }
        });
}

function address_autocomplete( input_id , map_id ,changed_callback){
    var input =document.getElementById( input_id );
    var ac = new google.maps.places.Autocomplete(input);
    google.maps.event.addListener(ac, 'place_changed', function() {
        var place = ac.getPlace();
        if (map_id){
            var map = get_map( map_id );
            if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }
        }
        if ( changed_callback ) changed_callback( place );
    });
}


