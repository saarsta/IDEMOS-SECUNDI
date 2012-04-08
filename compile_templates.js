
var dust = require('dust')
    ,path = require('path')
    ,fs = require('fs');

function compile_template(name,file)
{
    var str = fs.readFileSync(path.join(__dirname,'templates',file),'utf8');
//    console.log(str);
    return dust.compile(str,name);
}

var writer = fs.createWriteStream(path.join(__dirname,'public','js','compiled_templates.js'));

writer.write(compile_template('subject','subject.html'));
writer.write(compile_template('information_item','informationItem.html'));
//writer.write(compile_template('template_name','template_file.html'));


// TODO add more templates to compile

writer.end();


