const fs = require('fs');
const controllers = require('./controllers')


function addControllers(router, dir) {
    var files = fs.readdirSync(__dirname + "/" + dir)
    var js_files = files.filter((f) => {
        return f.endsWith('.js');
    });

    for (var f of js_files) {
        console.log(`process controller: ${f}...`);
        /** 
        // 方式1 
        var mapping = require(__dirname + '/'+dir+'/' + f);
        addMapping1(router,mapping);  // 方式1 

        */
        // var mappingList = require(__dirname + "/" + dir + "/" + f);
        for (var index in controllers) {
            addMapping(router, controllers[index]);
        }

    }
}

function addMapping(router, mapping) {
    switch (mapping.method) {
        case 'GET':
            router.get(mapping.path, mapping.func);
            console.log(`register URL mapping: GET ${mapping.path}`);
            return;
        case 'POST':
            router.post(mapping.path, mapping.func);
            console.log(`register URL mapping: POST ${mapping.path}`);
            return;
        case 'PUT':
            router.put(mapping.path, mapping.func);
            console.log(`register URL mapping: PUT ${mapping.path}`);
            return;
        case 'DELETE':
            router.del(mapping.path, mapping.func);
            console.log(`register URL mapping: DELETE ${mapping.path}`);
            return;
        default:
            console.log(`invalid URL:${mapping}`)
            return;
    }
}

function addMapping1(router, mapping) {
    for (var url in mapping) {
        if (url.startsWith('GET ')) {
            var path = url.substring(4);
            router.get(path, mapping[url]);
            console.log(`register URL mapping: GET ${path}`);
        } else if (url.startsWith("POST ")) {
            var path = url.substring(5);
            router.get(path, mapping[url]);
            console.log(`register URL mapping: POST ${path}`);

        } else {
            console.log(`invalid URL:${url}`)
        }
    }
}

module.exports = function(dir) {
    let controllers_dir = dir || "controllers";
    let router = require('koa-router')();
    addControllers(router, controllers_dir);

    return router.routes();
}