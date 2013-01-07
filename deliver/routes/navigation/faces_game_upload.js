var fs = require('fs') ,
    knox = require('knox'),
    path = require('path'),
common = require('../../../api/common');


module.exports = function(req, res){
    console.log("Faces Game Upload")
    console.log(req.files)      ;
    var name= req.files.Filedata.name


    fu(req,function(err,value) {
        console.log(value)      ;
        if(err)
        {
            console.log('error :' )      ;
            for(var propertyName in err) {

                console.log(propertyName + ": "+ err[propertyName])  ;
            }

            res.write(err);
            res.end();
        }
        else {
            console.log('success :' +value.url)
            res.write(value.url);
            res.end();
        }
    });


};

function fu(req,callback) {

    function writeToFile(fName, stream, callback){
        var filename=  fName,
            mypath =   'deliver/public/faces_game/uploads/'+fName ;// path.join(__dirname,'..','deliver','public','cdn', fName);

        os= fs.createWriteStream(mypath) ;
            stream.on('data',function(data) {
                os.write(data);
            });

            stream.on('end',function() {
                os.on('close', function () {
                    callback(null,{
                        filename: filename,
                        fullPath: mypath
                    });
                });

                os.end();
            });

            stream.resume();

     };

    var knoxClient = require('j-forms').fields.getKnoxClient();


    fName       =req.files.Filedata.name;
    var stream = req.queueStream || req;

    if(knox && knoxClient)
    {
        // First, we write the file to disk. Then we upload it to Amazon.
        writeToFile(fName, stream, function(err,value) {

            if(err) {
                callback(err);
                return;
            }

            setTimeout(function() {

                var value_full_path = value.fullPath;

                stream = fs.createReadStream(value.fullPath);
                knoxClient.putStream(stream, '/fg/'+value.filename , function(err, res){

                    if(err)
                        callback(err);
                    else {
                        var path = res.socket._httpMessage.url;

                        fs.unlink(value_full_path);
                        console.log("res.socket._httpMessage");
                        console.log(res.socket._httpMessage);
                        var value = {
                            path: path,
                            url: path
                        };
                        callback(null,value);
                    }
                });
            },200);
        });
    } else {
        writeToFile(fName, stream, function (err, value) {
            if (err) {
                callback(err);
            } else {
                callback(null, {
                    path: value.filename,
                    url: '/cdn/' + value.filename
                });
            }
        });
    }
};


