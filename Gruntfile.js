var _ = require('underscore'),
    conf = require('./conf');

module.exports = function (grunt) {

    grunt.initConfig(createGruntConf());

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
     // Default task.
     grunt.registerTask('default', ['concat','uglify']);

    // Project configuration.
//    grunt.initConfig({
//        concat:{
//            options:{
//                separator:';'
//            },
//            dist:{
//                src:[
//                    /*'deliver/public/js/jquerypp/jquery-1.8.2.min.js',
//                    'deliver/public/js/jquerypp/jquery-ui-1.9.1.custom.min.js',
//                    'deliver/public/js/lib/dust-full-0.3.0.js',
//                    'deliver/public/js/InfoBox.js',
//                    'deliver/public/js/lib/fileuploader.js',
//                    'deliver/public/js/imgscale.jquery.min.js',
//                    'deliver/public/js/jquerypp/jqtouch.min.js',
//                    'deliver/public/js/jquerypp/jquery-fieldselection.js',
//                    'deliver/public/js/jquerypp/jquery.autoellipsis-1.0.8.min.js',
//                    'deliver/public/js/jquerypp/jquery.colorbox-min.js',
//                    'deliver/public/js/jquerypp/jquery.cycle.all.js',
//                    'deliver/public/js/jquerypp/jquery.easing.1.3.js',
//                    'deliver/public/js/jquerypp/jquery.placeholder.min.js',
//                    'deliver/public/js/jquerypp/jquery.tools.min.js',
//                    'deliver/public/js/jquerypp/jquery.tooltip.min.js',
//                    'deliver/public/js/jquerypp/jquery.validate.min.js',
//                    'deliver/public/js/jquerypp/jquery.compare.js',
//                    'deliver/public/js/jquerypp/jquery.range.js',
//                    'deliver/public/js/jquerypp/jquery.selection.js',
//                    'deliver/public/js/lib/date.format.js',
//                    'deliver/public/js/select2.js',
//                    'deliver/public/plugins/ckeditor/ckeditor.js',
//                    'deliver/public/plugins/ckeditor/adapters/jquery.js',
//
//                    'deliver/public/js/compiled_templates.js',
//                    'deliver/public/js/common.js',
//                    'deliver/public/js/db.js',
//                    'deliver/public/js/fb.js',
//                    'deliver/public/js/lib/search.js',
//                    'deliver/public/js/timeline.js',
//                    'deliver/public/js/tokensbar_model.js',
//                    'deliver/public/js/listCommon.js',
//                    'deliver/public/js/popupProvider.js',
//                    'deliver/public/js/proxy_common.js',
//                    'deliver/public/js/lib/maps.js',
//
//                    'deliver/public/js/jquerypp/jquery.movingboxes.js',
//                    'deliver/public/js/jquery.cookie.js',
//                    'deliver/public/js/storyjs-embed.js',
//                    'deliver/public/js/jquerypp/jquery.dotdotdot-1.5.6-packed.js'*/
//                    conf.headConfigs.js_includes.src
//                ],
//                dest:'deliver/public/dist/js/built.js'
//            }
//        },
//
//        uglify:{
//            my_target:{
//                files:{
//                    'deliver/public/dist/js/built.min.js':['deliver/public/dist/js/built.js']
//                }
//            }
//        }
//    });

//
//
//    //default task
//    grunt.registerTask('default', ['concat', 'uglify']);
//
//    grunt.registerTask('heroku', ['concat', 'uglify']);

};


function createGruntConf() {
    var concat = {};
    var min = {};
    var mincss = {};
    _.each(conf.headConfigs, function (value, key) {
        var concatDest = __dirname + '/deliver/public' + ((value.min === false && value.final) || value.concat || '/dist/' + value.type + '/' + value.name + '.' + value.type);
        var minDest = __dirname + '/deliver/public' + (value.final || '/dist/' + value.type + '/' + value.name + '.min.' + value.type);
        concat[key] = {
            src:_.map(value.src || [], function (src) {
                return __dirname + '/deliver/public' + src;
            }),
            dest:concatDest,
            options:{separator:value.type == 'js' ? ';\n' : '\n'}
        };

        if (value.min !== false) {
            if (value.type == 'js')
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

    return {concat:concat, uglify:min};
};
