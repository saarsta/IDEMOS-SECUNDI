module.exports = function(req, res){
    res.writeHead(302, {
        'Location': '/elections_game'
        //add other headers here...
    });
    res.end();

};