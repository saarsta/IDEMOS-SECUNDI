var _ = require('underscore'),
    conf = require('./conf');


module.exports = function(grunt) {

    grunt.initConfig(createGruntConf());

    grunt.loadNpmTasks('grunt-contrib');
    // Default task.
    grunt.registerTask('default', 'concat min');

};


function createGruntConf() {
    var concat = {};
    var min = {};
    var mincss = {};
    _.each(conf.headConfigs,function(value,key) {
        var concatDest = __dirname + '/public' + ((value.min === false && value.final) || value.concat || '/dist/' + value.type + '/' + value.name + '.' + value.type);
        var minDest = __dirname + '/public' + (value.final || '/dist/' + value.type + '/' + value.name + '.min.' + value.type);
        concat[key] = {
            src:_.map(value.src || [],function(src) {
                return __dirname + '/public' + src;
            }),
            dest: concatDest,
            separator:'\n'
        };

        if(value.min !== false) {
            if(value.type == 'js')
                min[key] = {
                    src:[concatDest],
                    dest:minDest
                };
            else {
                mincss[key] = {};
                mincss[key][concatDest] = minDest;
            }
        }
    });

    return {concat:concat, min:min};
};
