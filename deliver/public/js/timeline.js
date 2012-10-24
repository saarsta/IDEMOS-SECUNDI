var timeline = {
	render: function (cid, ctitle, display_id) {
		console.log('Rendering timeline.');

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
					name: 'יצירת מעגל תנופה',
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
				items = {
					pre_discussion: [],
					discussion: null,
					past: [],
					today: null,
					future: []
				};

			$.each(data.objects, function (_, item) {
				var type = types[item.type];
				if (!type) {
					console.log("Unknown timeline type: " + item.type);
					return;
				}

				// Set all the item's display properties
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
						items: []
					};
					result[month].items.push(item);
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

			if (discussion_seen) {
				nodes.past.push(items.discussion);
			}

			$.each(items.past, function (month, cluster) {
				nodes.past.push({
					__proto__: timeline_item_prototype,
					template: 'cycle_timeline_past_cluster',
					month: cluster.date.format('mmmm'),
					items: cluster.items
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
			console.log('Original timeline data: ', data.objects);
			console.log('Items:', items);
			console.log('Nodes:', nodes);
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
		});
	}
}
