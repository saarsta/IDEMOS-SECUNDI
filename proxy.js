var http = require('http');

var httpProxy = require('http-proxy');
var proxy = new httpProxy.RoutingProxy();

module.exports = function(req, res) {
  req.headers.host = req.headers.host.replace('test.','www.');
  proxy.proxyRequest(req, res, {
        host: 'localhost',
        port: 8080
    }); 
};
