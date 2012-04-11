
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
writer.write(compile_template('information_item','informationItem.html'));
writer.write(compile_template('cycle','cycle.html'));
writer.write(compile_template('discussion','discussion.html'));
writer.write(compile_template('action','action.html'));
writer.write(compile_template('hot_info_item','hotInfoItem.html'));
writer.write(compile_template('info_item_in_subject_1','infoItemInSubject1.html'));
writer.write(compile_template('shopping_cart_item_1','shoppingCartItem1.html'));
writer.write(compile_template('info_item_full_view','infoItemFullView.html'));



//writer.write(compile_template('template_name','template_file.html'));


// TODO add more templates to compile

writer.end();


