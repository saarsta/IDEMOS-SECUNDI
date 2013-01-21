module.exports = function(router)
{
    router.get('', require('./verification'));
    router.post('', require('./change'));
    router.all('', require('./verification'));
};
