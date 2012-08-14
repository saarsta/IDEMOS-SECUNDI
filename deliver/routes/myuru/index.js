
module.exports = function(router){
   router.all('', require('./myuru'));
   router.all(/\/([0-9a-f]+)\/?$/,require('./myuru'));

};



