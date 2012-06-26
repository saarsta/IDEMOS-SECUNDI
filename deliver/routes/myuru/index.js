
module.exports = function(router){
    router.all('', require('./hisuru'));
   router.all(/\/([0-9a-f]+)\/?$/,require('./hisuru'));

};



