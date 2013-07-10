
try{
    var agent = require('webkit-devtools-agent');
    console.log('Webkit-Devtools-Agent is on. To start the porting send \'SIGUSR2\' signal to process with id %d',process.pid);
    if(!process.env.NODE_ENV){
        setTimeout(function(){
            process.emit('SIGUSR2');
        },5000);
    }
}
catch(ex){}

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