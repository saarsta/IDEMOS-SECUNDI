var timeline= {
    render: function (cid, ctitle, display_id) {
		console.log('Rendering timeline.');

        db_functions.getCycleTimeline(cid, function (err, data) {
			console.log('timeline data: ', data.objects);
            var type_names={
                    past:'',
                    cycle_creation :'יצירת מעגל תנופה',
                    due_date :'תאריך יעד',
                    discussion:'יצירת דיון',
                    action  :'פעולה',
                    cycle_update  :'עדכון',
                    today  :'היום',
                    admin_update :'עדכון מערכת'
                },


                i=0,
                j= 0,
                pre_discussion_items = {type:'past',month:'לפני יצירת הדיון',items:[]},
                past_months={},
                clusters={},
                past=true;

            //init items
            var last_item=null;
            $.each(data.objects, function (index, item) {
                item.type_print =  type_names[item.type];
                item.date =item.date.substring(0, item.date.length - 1)  ;
                switch(item.type)
                {

                    case 'due_date':

                        break;
                    case 'cycle_creation':
                        item.short= ctitle;
                        item.link='/cycles/'+cid;
                        break;
                    case 'discussion':

                        break;
                    case 'action':
                        item.short=item.title
                        item.link ='/actions/'+item._id;
                        break;
                    case 'cycle_update':
                        item.short=item.title
                        item.link ='/updates/'+item._id;
                        break;
                    case 'today':
                        past=false;
                        break;
                    case 'admin_update':
                        //this ugly manuver is fot set link for admin_update only when there is such one
                        var temp_text = item.text;
                        temp_text =  temp_text.replace(/\[url(?:=([^\]]*))\]((?:.|\n)*)?\[\/url\]/,'<a href="$1" target="_blank">$2</a>')

                        if(! (temp_text == item.text)){
                            item.text = temp_text;
                            item.manuver_link = true;
                        }

                        item.short = item.text;

                        break;
                    default:
                        console.log("unknow timleline type : "+  item.type);
                }
                // debugger;
                if(!past && last_item && last_item.date.substr(0,10)==item.date.substr(0,10))
                {
                    last_item.cluster=true;
                    item.cluster=true;
                }
                last_item=item;

            });

            nodes= data.objects.slice(0);
            //remove all past items from list and move them into past objects
            //
            past=true;
            var pre_discussion=true,
                custers_count = 0,
                clustered_count=0,
				todayNodeIndex = -1;
            $.each(data.objects, function (index, item) {
                if(item.type=='today')  {
					todayNodeIndex = i;
                    past=false;
                } else if(item.type=='discussion')  {
                    pre_discussion=false;
                } else if (pre_discussion) {

                    pre_discussion_items.items.push(item) ;
                    nodes.shift();
                } else if (past) {
                    var item_date=   new Date(item.date)
                    var ind=item_date.format('mmyy');
                    if(!past_months[ind]) {
                        past_months[ind]=  {type:'past',month:item_date.format('mmmm'),items:[]}
                    }
                    past_months[ind].items.push(item);
                    nodes.splice(1,1);
                } else {    //present and future items
                    if(item.cluster)
                    {
                        var item_date=   new Date(item.date)
                        var ind=item_date.format('d.m');
                        if(!clusters[ind]) {
                            // clusters[ind]=  {type:'cluster',date:item_date,items:[]}
                            clusters[ind]=0;
                            custers_count++;
                        }
                        // clusters[ind].items.push(item);
                        //nodes.splice(1,1);
                        clustered_count++;;
                        clusters[ind]++;
						i--;
                    }
                }
				i++;
            } );
			console.log("Today's index: " + todayNodeIndex);
            i=1;
            $.each(past_months, function (index, item) {
                nodes.splice(i,0,item);
                i++;
            });
            if (pre_discussion_items.items.length>0)
            {
                nodes.splice(1,0,pre_discussion_items);
            }

            var count = nodes.length-1 -clustered_count + custers_count;
			var offsetFromIndex = function offsetFromIndex(index) {
				var LastOffset = 980;
				var TodayOffset = LastOffset / 3;
				if (todayNodeIndex < 0) {
					// No node found for 'today'.
					return (index * LastOffset) / count;
				} else if (index <= todayNodeIndex) {
					return (index * TodayOffset) / todayNodeIndex;
				} else {
					return ((index - todayNodeIndex) * (LastOffset - TodayOffset)) / (count - todayNodeIndex) + TodayOffset;
				}
			};

			offsetFromIndex = logFunctionCalls(offsetFromIndex);

            var render_clusters={};
            i=0;
            $.each(nodes, function (index, item) {

                if(item.cluster)
                {
					console.log('Item ' + index + ' in cluster (index: ' + j + ').');
                    var item_date=   new Date( item.date);
                    var ind=item_date.format('d.m');
                    if(!render_clusters[ind])  {
                        render_clusters[ind]={};
                        render_clusters[ind].items=[];
                    }
                    else
                    {
                        render_clusters[ind].offset = offsetFromIndex(j);
                    }
                    render_clusters[ind].items.push(i);
                    clusters[ind]--;
                }
                item.offset = offsetFromIndex(j);
                item.timeline_index=i;
                switch(item.type)
                {
                    case 'past':
                        dust.render('cycle_timeline_past_cluster', item, timelineAppend);
                        break;
                    case 'due_date':
                        dust.render('cycle_timeline_due_date', item, timelineAppend);
                        break;
                    case 'cycle_creation':
                        dust.render('cycle_timeline_creation', item, timelineAppend);
                        break;
                    case 'discussion':
                        dust.render('cycle_timeline_discussion', item, timelineAppend);
                        break;
                    case 'action':
                        dust.render('cycle_timeline_action', item, timelineAppend);
                        break;
                    case 'cycle_update':
                        dust.render('cycle_timeline_update', item, timelineAppend);
                        break;
                    case 'today':
                        dust.render('cycle_timeline_today', item, timelineAppend);
                        break;
                    case 'admin_update':
                        dust.render('cycle_timeline_admin_update', item, timelineAppend);
                        break;
                    default:
                        console.log("unknow timleline type : "+  item.type);
                }
                i++;
                j++;
                if(item.cluster && clusters[ind]!=0 )
                {
                    j--;
                }
            });

            $.each(render_clusters, function (index1, cluster_array) {
                var it= [];
                var dummy=true;
                var offset=cluster_array.offset;
                $.each(cluster_array.items, function (index2, item) {
                    if($("#timeline_item_"+item).attr("class").indexOf("today") == -1 )
                    {
                        it.push($('#timeline_item_'+item))
                    }
                    else
                    {
                        dummy=false;
                    }
                });
                if (dummy)   {
                    dust.render('cycle_timeline_dummy', {date:index1,offset:offset}, timelineAppend);
                }
                animateCluster(it);
                if(display_id)
                {
                    $('.popup-event[item-id="'+display_id+'"]').addClass('showdiv')   ;
                    $('.popup-event[item-id="'+display_id+'"]').parent().mouseenter(function() {
                        $('.popup-event[item-id="'+display_id+'"]').removeClass('showdiv') ;
                    });

                }

            });
        });

        function timelineAppend  (err, out) {
            $('.followers-diagram').append(out);
        };
    }
}