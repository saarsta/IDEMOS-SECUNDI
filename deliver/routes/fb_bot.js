

module.exports = function(req,res,next) {
    console.log('***************************************************************************************');

    console.log('facebook bot');

    console.log(req.url);
    console.log('***************************************************************************************');
    next();
};