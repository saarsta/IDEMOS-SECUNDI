var fs = require('fs') ,
    knox = require('knox'),
    path = require('path'),
common = require('../../../api/common');


module.exports = function(req, res){
    console.log("Faces Game Upload")
    console.log(req.files)      ;
    var name= req.files.Filedata.name


    fu1(req,function(err,value) {
        console.log(value)      ;
        if(err)
        {
            console.log('error :' )      ;
            for(var propertyName in err) {

                console.log(propertyName + ": "+ err[propertyName])  ;
            }

            res.json(400 ,{err:err});
        }
        else {
            console.log('success :' +value)
            res.json({url:value});
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

                    if(err)  {
                        console.log( 'amazone upload fail');
                        callback(err);
                    }
                    else {

                        var path = res.socket._httpMessage.url;
                        console.log( 'amazone upload success '+path);
                        //fs.unlink(value_full_path);
                        callback(null,path);
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


function fu1(req,callback) {
    var name= req.files.Filedata.name
    fs.readFile(req.files.Filedata.path, function (err, data) {
        var newPath = 'deliver/public/faces_game/uploads/'+name ;
        fs.writeFile(newPath, data, function (err) {

            if(err)
            {
                console.log('error :' + err )      ;
                for(var propertyName in err) {

                    console.log(propertyName + ": "+ err[propertyName])  ;
                }
                callback(err);
            }
            else {


                //console.log('success :' +'http://www.uru.org.il/faces_game/uploads/'+name)

                stream = fs.createReadStream(newPath);
                var knoxClient = require('j-forms').fields.getKnoxClient();
                var filename = newPath.substring(newPath.lastIndexOf('/')+1);
                knoxClient.putStream(stream, '/fg/'+filename , function(err, res){
                    if(err)  {
                        callback(err);
                        console.log( 'amazone upload fail');
                    }
                    else {
                        var path = res.socket._httpMessage.url;
                        fs.unlink(newPath);
                        //console.log("res.socket._httpMessage");
                        //console.log(res.socket._httpMessage);
                        console.log( 'amazone upload success '+path);


                        var img = new   models.Face( {url:path,status:'pending'} );
                        img.save(function (err) {

                           if(err){
                                  console.log(err)
                           } else{
                               console.log('added ' )
                           }
                        }) ;


                    }
                });
            }
        });
    });
}




