var _ = require('underscore');

var o = [
    {
        name: 'test',
        value: '2'
    },

    {
        name: 'test2',
        value: '3'
    },

    {
        name: 'test4',
        value: '4'
    }
];


/*_.each(o, function(object, index, array){
    console.log(arguments);
    console.log("%s name is %s, value is %s", index, object.name, object.value);
});*/

 var a = _.find(o, function(object, index, array){
    object.name == "test"
    console.log(arguments);
    console.log("%s name is %s, value is %s", index, object.name, object.value);
}, );

console.log(a);