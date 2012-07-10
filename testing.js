calc_thresh = require('./tools/test_thresh');
//
//var thresh = calc_thresh.calculating_thresh(3, 9.8);
//
//console.log(thresh);

var cron = require('./cron');

console.log("dsflhdsf");
cron.daily_cron.takeProxyMandatesBack(function(err, result){
    console.log("f,jdhlkjdsh");
    console.log(err || result);
})
