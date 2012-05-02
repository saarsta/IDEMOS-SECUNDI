var mongoose = require('mongoose');


exports.split_db_url = function(db_url)
{
    var parts = db_url.split('/');
    var conf = {
        db:parts[3],
        collection: 'session',
        clear_interval: 0
    };

    if(parts[2] != 'localhost')
    {
        var middle_part_parts = parts[2].split(':');
        conf['username'] = middle_part_parts[0];
        conf['password'] = middle_part_parts[1].split('@')[0];
        conf['host'] = middle_part_parts[1].split('@')[1];
        conf['port'] = Number(middle_part_parts[2]);
    }
    else
    {
        conf['host'] = 'localhost';
        conf['port'] = 27017;
    }
    return conf;
};

exports.create_cached_model = function()
{
    var schema = arguments[1];
    var model = mongoose.model.apply(mongoose,arguments);
    return exports.cached_model(model,schema);
}

exports.cached_model = function(model,schema)
{
    model.cached = {};

    var invalidate = function(next){
        model.cached = {};
        if(next)
            next();
    };

    schema.pre('save',invalidate);
    schema.pre('remove',invalidate);

    model.findCached = function(){
        var query = arguments[0];
        var str = query + '';
        var callback = arguments[arguments.length-1];
        if(model.cached[str])
            callback(model.cached[str]);
        else
        {
            arguments[arguments.length-1] = function(err,docs)
            {
                if(!err)
                    model.cached[str] = docs;
                callback(err,docs);
            };
            model.find.apply(model,arguments);
        }
    };

    model.findOneCached = function(){
        var query = arguments[0];
        var str = query + '';
        var callback = arguments[arguments.length-1];
        if(model.cached[str])
            callback(model.cached[str]);
        else
        {
            arguments[arguments.length-1] = function(err,docs)
            {
                if(!err)
                    model.cached[str] = docs;
                callback(err,docs);
            };
            model.find.apply(model,arguments);
        }
    };
    return model;
};

exports.config_model = function(name, schema_fields){
    var model = exports.extend_model(name,{},schema_fields,'site_configs');
    return exports.cached_model(model,model.schema);
};

exports.extend_model = function(name, base_schema, schema, collection) {
    for (var key in base_schema)
        if (!schema[key]) schema[key] = base_schema[key];
    schema._type = {type:String, 'default':name,editable:false};
    var model = mongoose.model(name, new Schema(schema), collection);
    var old_find = model.find;
    model.find = function () {
        var params = arguments.length ? arguments[0] : {};
        params['_type'] = name;
        if (arguments.length)
            arguments[0] = params;
        else
            arguments = [params];
        return old_find.apply(this, arguments);
    };
    return model;
}