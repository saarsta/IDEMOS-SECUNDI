module.exports = function(req, res){
    console.log('*************** facebook verification ***********');
    console.log(req.query);
    console.log('*******************************************');
    res.write(req.query['hub.challenge']);
    res.end();
    /*
     hub.mode - The string "subscribe" is passed in this parameter
     hub.challenge - A random string
     hub.verify_token - The verify_token value you specified when you created the subscription
     */
}