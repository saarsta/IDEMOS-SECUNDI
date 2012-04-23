
var dust = require('dust')
    ,path = require('path')
    ,fs = require('fs');

function compile_template(name,file)
{
    var str = fs.readFileSync(path.join(__dirname,'templates',file),'utf8');
    return dust.compile(str,name);
}

var writer = fs.createWriteStream(path.join(__dirname,'public','js','compiled_templates.js'));

writer.write(compile_template('subject','subject.html'));
writer.write(compile_template('subject_small','subject_small.html'));
writer.write(compile_template('information_items','informationItem.html'));
writer.write(compile_template('cycles','cycle.html'));
writer.write(compile_template('create_discussion','createDiscussion.html'));
writer.write(compile_template('actions','action.html'));
writer.write(compile_template('hot_info_item','hotInfoItem.html'));
writer.write(compile_template('info_item_in_subject_1','infoItemInSubject1.html'));
writer.write(compile_template('shopping_cart_item_1','shoppingCartItem1.html'));
writer.write(compile_template('info_item_full_view','infoItemFullView.html'));
writer.write(compile_template('pending_action_list_item','pendingActionListItem.html'));
writer.write(compile_template('action_list_item','actionListItem.html'));
writer.write(compile_template('discussion_list_item','discussionListItem.html'));
writer.write(compile_template('cycle_list_item','cycleListItem.html'));
writer.write(compile_template('discussion_full_view','discussionFullView.html'));
writer.write(compile_template('shopping_cart_item_in_create_discussion_1', 'shoppingCartItemInCreateDiscussion1.html'))
writer.write(compile_template('post','post.html'));


//writer.write(compile_template('template_name','template_file.html'));


// TODO add more templates to compile

writer.end();


