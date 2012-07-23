//
//var dust = require('dustjs-linkedin')
//    ,path = require('path')
//    ,fs = require('fs');
//
//function compile_template(name,file)
//{
//    var str = fs.readFileSync(path.join(__dirname,'..','templates',file),'utf8');
//    return dust.compile(str,name);
//}
//
//var writer = fs.createWriteStream(path.join(__dirname,'..','public','js','compiled_templates_old.js'));
//
//
//writer.write(compile_template('subject','subject.html'));
//writer.write(compile_template('subject_small','subject_small.html'));
//writer.write(compile_template('information_items','informationItem.html'));
//writer.write(compile_template('cycles','cycle.html'));
//writer.write(compile_template('create_discussion','createDiscussion.html'));
//writer.write(compile_template('actions','action.html'));
//writer.write(compile_template('hot_info_item','hotInfoItem.html'));
//writer.write(compile_template('info_item_in_subject_1','infoItemInSubject1.html'));
//writer.write(compile_template('shopping_cart_item_1','shoppingCartItem1.html'));
//writer.write(compile_template('pending_action_list_item','pendingActionListItem.html'));
//writer.write(compile_template('action_list_item','actionListItem.html'));
//writer.write(compile_template('discussion_list_item','discussionListItem.html'));
//writer.write(compile_template('cycle_list_item','cycleListItem.html'));
//writer.write(compile_template('discussion_full_view','discussionFullView.html'));
//writer.write(compile_template('action_timeline','action_timeline.html'))
//writer.write(compile_template('action_full_view','actionFullView.html'));
//writer.write(compile_template('action_map','action_map.html'));
//writer.write(compile_template('cycle_main','cycle_main.html'));
//writer.write(compile_template('cycle_user','cycle_user.html'));
//writer.write(compile_template('cycle_update','cycle_update.html'));
//writer.write(compile_template('cycle_pending_action','cycle_pending_action.html'));
//writer.write(compile_template('cycle_popular_post','cycle_popular_post.html'));
//writer.write(compile_template('cycle_information_item','cycle_information_item.html'));
//writer.write(compile_template('information_item_in_discussion','information_item_in_discussion.html'));
//
//
//writer.write(compile_template('myCycle_list_item','myCycleListItem.html'));
//writer.write(compile_template('myDiscussion_list_item','myDiscussionItem.html'));
//writer.write(compile_template('myAction_list_item','myActionItem.html'));
//writer.write(compile_template('myKilkulListItem','myKilkulListItem.html'));
//writer.write(compile_template('post','post.html'));
//
//writer.write(compile_template('discussion_suggestion','discussion_suggestion.html'));
//
//
////writer.write(compile_template('cycle_list_item','cycleListItem.html'));
//writer.write(compile_template('discussion_full_view','discussionFullView.html'))
//
////
//
//
////writer.write(compile_template('template_name','template_file.html'));
//
//
//// TODO add more templates to compile
//
//writer.end();
//
//
