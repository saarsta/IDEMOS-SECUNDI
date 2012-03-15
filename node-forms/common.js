var util = require('util');

exports._extends = function(base_class,constr)
{
    util.inherits(constr,base_class);
    return constr;
};

exports.writer_to_string = function(writer,limit)
{
    limit = limit || 1024;
    var buff = new Buffer(limit);
    var pointer = 0;
    writer({write:function(str)
    {
        pointer += buff.write(str,pointer);
    }});
    return buff.toString('utf8',0,pointer);
}
