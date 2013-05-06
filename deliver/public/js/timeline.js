var timeline = {
    map: null,
    user_position: null,
	render: function (cid, ctitle, display_id) {
		console.log('Rendering timeline.');


        var map = timeline.map;
        if(!$('#cycle_map').is(':empty')){
            var tabsData = {title: ctitle};
            dust.render('cycle_timeline_map_tabs', tabsData, function(err, out){
                $('.tabs-box').append(out);
                var default_lng = 34.777821;
                var default_lat = 32.066157;
                map = googleMap.init_map('cycle_map', new google.maps.LatLng(default_lat, default_lng));
            });
        }


		db_functions.getCycleTimeline(cid, function (err, data) {
			var timeline_item_prototype = new (function TimeLineItem() {} );
			timeline_item_prototype.toString = function () {
				return this.type + ' [' + this.short + ']';
			};

			var types = {
				today: {
					name: 'היום'
				},
				due_date: {
					name: 'תאריך יעד'
				},
				discussion: {
					name: 'יצירת דיון'
				},
				cycle_creation: {
					name: 'יצירת קמפיין',
					text: function (item) { return ctitle; },
					link: function (item) { return '/cycles/' + cid; }
				},
				action: {
					name: 'פעולה',
					text: function (item) { return item.title; },
					link: function (item) { return '/actions/' + item._id; }
				},
				cycle_update: {
					name: 'עדכון',
					text: function (item) { return item.title; },
					link: function (item) { return '/updates/' + item._id; }
				},
				admin_update: {
					name: 'עדכון מערכת',
					text: function (item) { return item.text.replace(/\[url(?:=([^\]]*))\]((?:.|\n)*)?\[\/url\]/,'<a href="$1" target="_blank">$2</a>'); }
				}
			};

			// Find all data for each item, and seperate them to different lists

			var discussion_seen = false,
				today_seen = false,
                no_discussion = true,
				items = {
					pre_discussion: [],
					discussion: null,
					past: [],
					today: null,
					future: []
				};
            $.each(data.objects, function (_, item) {
                   if(type === types.discussion)  {
                       no_discussion=false;
                   }

            });
            if(no_discussion)  discussion_seen=true;
			$.each(data.objects, function (_, item) {
				var type = types[item.type];
				if (!type) {
					console.log("Unknown timeline type: " + item.type);
					return;
				}

				// Set all the item's display properties
                if(item.type == 'cycle_update'){
                    if(!item.text_field_preview){
                        item.text_field_preview = item.text_field;
                    }
                }
				item.type_print = type.name;
				if (type.text) item.short = type.text(item);
				if (type.link) item.link = type.link(item);
				item.past = !today_seen;
				item.template = 'cycle_timeline_' + item.type.replace('cycle_', '');
				item.__proto__ = timeline_item_prototype;

				// If the item is a boundary, record having seen it. Then, add the item to the right place in the items object.
				if (type === types.discussion) {
					discussion_seen = true;
					items.discussion = item;
				} else if (type === types.today) {
					today_seen = true;
					items.today = item;
				} else {
					var list = !discussion_seen ? items.pre_discussion
							 : !today_seen ? items.past
							 : items.future;
					list.push(item);
				}
			});

			// Calculate the actual nodes

			var group_by_month = function (items) {
				var result = {};
				$.each(items, function (_, item) {
					var date = new Date(item.date),
						month = date.format('mmyy');
					result[month] = result[month] || {
						date: date,
						is_displayed: false,
						items: []
					};

					result[month].items.push(item);
					result[month].is_displayed = result[month].is_displayed || item.is_displayed;
				});
				return result;
			};

			items.past = group_by_month(items.past);

			var nodes = {
				past: [],
				future: []
			};

			if (items.pre_discussion.length) {
				nodes.past.push({
					__proto__: timeline_item_prototype,
					template: 'cycle_timeline_past_cluster',
					month: 'לפני יצירת הדיון',
					items: items.pre_discussion
				});
			}

			if (discussion_seen && !no_discussion) {
				nodes.past.push(items.discussion);
			}

			$.each(items.past, function (month, cluster) {
				nodes.past.push({
					__proto__: timeline_item_prototype,
					template: 'cycle_timeline_past_cluster',
					month: cluster.date.format('mmmm'),
					items: cluster.items,
					is_displayed: cluster.is_displayed
				});
			});



			nodes.today = items.today;
			nodes.future = items.future;

			// Calculate offsets
			
			var LastOffset = 980;
			var TodayOffset = LastOffset / 3;

			if (today_seen) {
				// Past:
				var todayIndex = nodes.past.length;
				// index 0 should be at offset 0.
				// index {todayIndex} should be at offset {TodayOffset} - that index isn't actually inside this array
				$.each(nodes.past, function (index, item) {
					item.offset = TodayOffset * index / todayIndex;
				});

				nodes.today.offset = TodayOffset;

				// Future:
				var lastIndex = nodes.future.length - 1;
				// index -1 should be at offset {TodayOffset}
				// index {lastIndex} should be at offset {LastOffset} - that index *is* in the array
				$.each(nodes.future, function (index, item) {
					item.offset = ((LastOffset - TodayOffset) * (index + 1) / (lastIndex + 1)) + TodayOffset;
				});
			} else {
				// If we don't have a 'today' item, all nodes are in the past section
				var lastIndex = nodes.past.length - 1;
				// index 0 should be at offset 0
				// index {lastIndex} should be at offset {LastOffset}
				$.each(nodes.past, function (index, item) {
					item.offset = LastOffset * index / lastIndex;
				});
			}

			// Combine past and future bits - we don't need the separation any more.
			//console.log('Original timeline data: ', data.objects);
			//console.log('Items:', items);
			//console.log('Nodes:', nodes);
			nodes = nodes.past.concat([nodes.today], nodes.future);
						
			// Render the now ready timeline.
			$.each(nodes, function (index, item) {
				item.timeline_index = index;
				if (display_id) {
					item.is_displayed = false;
				}

				dust.render(item.template, item, function (err, out) {
					$('.followers-diagram').append(out);
				});
			});

			if(display_id) {
				$('.popup-event[item-id="'+display_id+'"]').addClass('showdiv');
			} else {
				$('.icon').mouseenter(function() {
					var diagram = $('.followers-diagram');

					$.each(diagram.find('div'), function(index, element){
						if($(element).hasClass('showdiv')) {
							$(element).fadeOut(2000);
						}
					})
				});
			}


//----------------------------------------------------------------------------------------------------
            //add actions to cycle map
//----------------------------------------------------------------------------------------------------

            if($('#action_list div.action_map_item')){
                var markers = [];
                var myOptions = {
                    pane: "floatPane",
                    enableEventPropagation: "true",
                    boxStyle: {
                        background: "url(../images/event-popup.png) no-repeat",
                        "padding-top": "7px",
                        "padding-left": "7px",
                        width: "200px",
                        height: "145px"
                    },
                    pixelOffset: new google.maps.Size(-109, -155),
                    closeBoxURL: ""
                };
                var popup = new InfoBox(myOptions);

                $.each(data.objects, function(index, item){
                    if(item.type == 'action' && item.location)
                    {
                        var action_list_box = document.getElementById('action_list');
                        data = {
                            title: item.title,
                            date: item.date,
                            num_of_going: item.num_of_going,
                            is_going: item.is_going,
                            text_field_preview: item.text_field_preview,
                            location: item.location,
                            is_displayed: false,
                            _id: item._id
                        };
                        dust.render('action_map_list_item', data, function(err, out){
                            $('#action_list').append(out);
                        });

                        var markerPosition = new google.maps.LatLng(item.location.geometry.lat, item.location.geometry.lng);
                        var marker = new google.maps.Marker({
                            position : markerPosition,
                            map: map,
                            flat: true,
                            title: item.title,
                            icon: {
                                fillColor: "#3C63EF",
                                fillOpacity: 1,
                                strokeColor: "#2049D3",
                                strokeWeight: 3,
                                strokeOpacity: 1,
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 10
                            },
                            shape: google.maps.SymbolPath.CIRCLE,
                            visible:true
                        });
                        marker.metadata = {"id": item._id};
                        markers.push(marker);

                        google.maps.event.addListener(marker, 'click', function(){
                            var myId = marker.metadata.id;
                            var content;
                            if($('div.popup-event[item-id=' + myId + ']')){
                                content = $('div.popup-event[item-id=' + myId + ']').clone()[0];
                            } else {

                            }
                            popup.setContent(content);
                            popup.open(map, marker);
                            selectActionItem(myId);
                        });


                        $('#action_list .action_map_item').click(function(){
                            var myId = $(this).attr('data-id');
                            selectActionItem(myId);
                            $.each(markers, function(indenx, marker){
                                if(myId == marker.metadata.id){
                                    var content = $('div.popup-event[item-id=' + myId + ']').clone()[0];
                                    popup.setContent(content);
                                    popup.open(map, marker);
                                }
                            })
                        });

                        var selectActionItem = function(id){
                            $.each($('.action_map_item'), function(index, item){
                                if(item.getAttribute('data-id') == id){
                                    $(item).addClass('selected');
                                } else if($(item).hasClass('selected')){
                                    $(item).removeClass('selected');
                                }
                            })
                        }
                    }
                });
                $('.tabs-nav h5').click(function(){
                    var tab = $(this);
                    var mapCenter = map.getCenter();
                    if(!$(this).hasClass('selected')){
                        if($('.map_tab').hasClass('selected')){
                            $('.map_tab').removeClass('selected');
                            $('h5.timeline_tab').append($("#timeline-second-part"));
                        } else {
                            $('.timeline_tab').removeClass('selected');
                            $('.map_tab').append($("#timeline-second-part"));
                            var user_position = timeline.user_position;
                            if(!user_position){
                                user_position = {lng: null, lat: null};
                                getUserPosition(user_position, function(){
                                    if(user_position.lng && user_position.lat){
                                        googleMap.addPlaceMark(user_position);
                                    }else {
                                        user_position.lng = 34.777821;
                                        user_position.lat = 32.066157;
                                        googleMap.addPlaceMark(user_position);
                                    }
                                    timeline.user_position = user_position;
                                });
                            }

                        }
                        $(this).addClass('selected');
                        $('#tabs_cycle_timeline').toggle();
                        $('#tabs_cycle_map').toggle();
                        google.maps.event.trigger(map, 'resize');
                        if(mapCenter != map.getCenter())
                            map.setCenter(mapCenter);
                    }
                })
            }
        });
	}
};
