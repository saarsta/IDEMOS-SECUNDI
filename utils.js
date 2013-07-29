 var mongoose = require('mongoose')
     ,events = require('events');

 var SHOW_ONLY_PUBLISHED = false;

 exports.setShowOnlyPublished = function(show_only_published) {
    SHOW_ONLY_PUBLISHED = show_only_published;
 };

 exports.getShowOnlyPublished = function() {
     return SHOW_ONLY_PUBLISHED;
 };


var model = mongoose.Model;
var _find = model.find;
model.find = function()
{
     var args = Array.prototype.slice.call(arguments);
     if(this.schema.paths.is_hidden && SHOW_ONLY_PUBLISHED)
     {
         var query = args.length > 0 && typeof(args[0]) == 'object' ? args[0] : {};
         if(query['is_hidden'] != -1)
            query['is_hidden'] =  false;
         else
             delete query['is_hidden'];
         if(args.length == 0)
             args.unshift(query);
         else if(typeof(args[0]) != 'object')
             args.unshift(query);
         else
             args[0] = query;
     }
     return _find.apply(this,args);
};
var _findOne = model.findOne;
model.findOne = function()
{
     var args = Array.prototype.slice.call(arguments);
     if(this.schema.paths.is_hidden && SHOW_ONLY_PUBLISHED)
     {
         var query = args.length > 0 && typeof(args[0]) == 'object' ? args[0] : {};
         if(query['is_hidden'] != -1)
             query['is_hidden'] =  false;
         else
             delete query['is_hidden'];
         if(args.length == 0)
             args.unshift(query);
         else if(typeof(args[0]) != 'object')
             args.unshift(query);
         else
             args[0] = query;
     }
     return _findOne.apply(this,args);
};

var _count = model.count;
model.count = function()
{
     var args = Array.prototype.slice.call(arguments);
     if(this.schema.paths.is_hidden && SHOW_ONLY_PUBLISHED)
     {
         var query = args.length > 0 && typeof(args[0]) == 'object' ? args[0] : {};
         if(query['is_hidden'] != -1)
             query['is_hidden'] =  false;
         else
             delete query['is_hidden'];
         if(args.length == 0)
             args.unshift(query);
         else if(typeof(args[0]) != 'object')
             args.unshift(query);
         else
             args[0] = query;
     }
     return _count.apply(this,args);
};


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
    var ext = exports.extend_model(name,{},schema_fields,'site_configs');
    return ext.model;//exports.cached_model(ext.model,ext.schema);
};

exports.extend_model = function(name, base_schema, schema, collection,schemaFunc) {
    for (var key in base_schema)
        if (!schema[key]) schema[key] = base_schema[key];
    schema._type = {type:String, 'default':name,editable:false};
    var schemaObj = new mongoose.Schema(schema);
    if(schemaFunc)
        schemaFunc(schemaObj);
    var model = mongoose.model(name, schemaObj, collection);
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
    var old_count = model.count;
    model.count = function () {
        var params = arguments.length ? arguments[0] : {};
        params['_type'] = name;
        if (arguments.length)
            arguments[0] = params;
        else
            arguments = [params];
        return old_count.apply(this, arguments);
    };
    var old_findOne = model.findOne;
    model.findOne = function () {
        var params = arguments.length ? arguments[0] : {};
        params['_type'] = name;
        if (arguments.length)
            arguments[0] = params;
        else
            arguments = [params];
        return old_findOne.apply(this, arguments);
    };
    return {model:model, schema:schemaObj};
};

 exports.revertibleModel = function(schema){
     return schema;
     if(SHOW_ONLY_PUBLISHED)
        return schema;
     schema.add({_unCommitted:{type:mongoose.Schema.Types.Mixed,editable:false},_preview:{type:Date,editable:true}});
     schema.post('init',function(doc){
         doc._orig = _.clone(doc._doc,true);
         if(doc._preview && new Date() - doc._preview < 1000*20){
             if(doc._unCommitted){
                 for(var key in doc._unCommitted)
                    doc[key] = doc._unCommitted[key];
             }
             doc._unCommitted = {};
         }
     });
     schema.methods.preview = function(cbk){
         var self = this;
         var modifiedPaths = this.modifiedPaths();
         self._unCommitted = self._unCommitted || {};
         modifiedPaths.forEach(function(path){
             if(path == '_unCommitted')
                 return;
             self._unCommitted[path] = self[path];
             self[path] = self._orig[path];
         });
         this._unCommitted = JSON.parse(JSON.stringify(this._unCommitted));
         if(Object.keys(this._unCommitted).length)
             this.markModified('_unCommitted');
         this._preview = new Date();
         this.save(cbk);
     }
     schema.methods.revert = function(cbk){
         this._unCommitted = null;
         this._preview = null;
         this.save(cbk);
     }
     return schema;
 };
 /***
  * Temporary stream that it's pause and resume works and  saved data in memory.
  * Until the request stream of nodejs will be fixed
  * @type {Function}
  */
 var queueStream = exports.queueStream = function (req) {
     events.EventEmitter(this);
     var self = this;
     self.req = req;
     var is_paused = false;
     var is_destroyed = false;
     var is_ended = false;
     var queue = [];
     self.pause = function () {
         req.pause();
         is_paused = true;
     };
     self.resume = function () {
         req.resume();
         is_paused = false;
         if (!is_destroyed)
             queue.forEach(function (data) {
                 self.emit('data', data);
             });
         if (is_ended)
             self.emit('end');
     };

     req.on('data', function (data) {
         if (is_destroyed)
             return;
         if (is_paused) {
             queue.push(data);
         }
         else {
             self.emit('data', data);
         }
     });

     req.on('end', function () {
         if (is_destroyed)
             return;
         if (is_paused)
             is_ended = true;
         else
             self.emit('end');
     });

     self.destroy = function () {
         req.destroy();
         is_destroyed = true;
     };
 };

 require('util').inherits(queueStream, events.EventEmitter);

 /*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = exports.dateFormat = function () {
    var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var	_ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "ראשון",
        "שני",
        "שלישי",
        "רביעי",
        "חמישי",
        "שישי",
        "שבת",
        "ראשון",
        "שני",
        "שלישי",
        "רביעי",
        "חמישי",
        "שישי",
        "שבת"
    ],
    monthNames: [
        "ינואר",
        "פברואר",
        "מרץ",
        "אפריל",
        "מאי",
        "יוני",
        "יולי",
        "אוגוסט",
        "סםטמבר",
        "אוקטובר",
        "נובמבר",
        "דצמבר",
        "ינואר",
        "פברואר",
        "מרץ",
        "אפריל",
        "מאי",
        "יוני",
        "יולי",
        "אוגוסט",
        "סםטמבר",
        "אוקטובר",
        "נובמבר",
        "דצמבר"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};