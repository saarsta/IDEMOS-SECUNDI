var sys = require('sys');
var path = require('path');
var exec = require('child_process').exec;

module.exports = function(voters,rating,callback)
{
    // executes `pwd`
    exec(path.join(__dirname,"thresh_calc_cmd_line.py -v " + voters + " -r " + rating), function (error, stdout, stderr) {
     if(error)
        callback(error);
    else
    {
        var match = /Required votes required in order to change:\s*(\d+)/.exec(stdout);
        if(match)
            callback(null,Number(match[1]));
        else
            callback('threshold calcualtion failed: ' + stderr);
        }
    });
}



if(/thresh_calc\.js/.test(process.argv[1]))
{
    module.exports(1000,10,function(err,result)
    {
        console.log(err);
        console.log(result);
    });
}
