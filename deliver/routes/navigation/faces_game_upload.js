var fs = require('fs')


module.exports = function(req, res){

    var name= req.files.upload_file.name
    fs.readFile(req.files.upload_file.path, function (err, data) {
        var newPath = 'deliver/public/faces_game/uploads/'+name ;
        fs.writeFile(newPath, data, function (err) {
            if(err) {
                res.write(err);
                res.end();
            }else {
                res.write('http://www.uru.org.il/face_game/uploads/'+name);
                res.end();
            }
        });
    });

};


/*
<?php

// default path for the image to be stored //
$default_path = 'uploads/';

// check to see if a path was sent in from flash //
$target_path = ($_POST['dir']) ? $_POST['dir'] : $default_path;
if (!file_exists($target_path)) mkdir($target_path, 0777, true);

// full path to the saved image including filename //
$destination = $target_path . basename( $_FILES[ 'Filedata' ][ 'name' ] );

// move the image into the specified directory //
if (move_uploaded_file($_FILES[ 'Filedata' ][ 'tmp_name' ], $destination)) {
    echo basename( $_FILES[ 'Filedata' ][ 'name' ] );
} else {
    echo "FILE UPLOAD FAILED";
}
?>
  */

