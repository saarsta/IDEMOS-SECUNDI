if(process.env.NODETIME_ACCOUNT_KEY) {
    require('nodetime').profile({
        accountKey: process.env.NODETIME_ACCOUNT_KEY,
        appName: 'uru'
    });
}

setInterval(function(){
    var mem = process.memoryUsage();
    console.log('HEAP USED:',mem.rss);
    if (mem.rss > (1000 * 1000 * 400)){
        console.error('exiting due to high memory usage');
        setTimeout(function(){
            process.exit(1);
        },100);
    }
},1000*60*5);