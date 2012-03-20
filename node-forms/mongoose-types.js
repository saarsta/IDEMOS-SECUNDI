var util = require('util');

exports.loadTypes = function(mongoose)
{
    var File = function File(path,options)
    {
        File.super_.call(this,path,options);
    };
    util.inherits(File,mongoose.SchemaTypes.Mixed);

    mongoose.Types.File = Object;
    mongoose.SchemaTypes.File = File;

    exports.File = File;

    var GeoPoint = function GeoPoint(path,options) {
        GeoPoint.super_.call(this,path,options);
    };
    util.inherits(GeoPoint,mongoose.SchemaTypes.Mixed);

    exports.GeoPoint = GeoPoint;

    mongoose.Types.GeoPoint = Object;
    mongoose.SchemaTypes.GeoPoint = GeoPoint;
};

