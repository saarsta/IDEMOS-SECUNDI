module.exports = function(router)
{

    router.all(/\/([0-9a-f]+)\/?$/,require('./main'));

//    router.all('', require('./list'));

};