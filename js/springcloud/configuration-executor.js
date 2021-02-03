const filter = require('filter-files');
const ext = require('filter-ext');
const fs = require("fs-extra");
const path = require("path");
const filepaths = require('filepath-recursive')
const dotProp = require('dot-prop');
const ps = require('prop-search');

const prop = require("../common/parser/properties-parser.js");
const yml = require("../common/parser/yml-parse.js");

const common = require('../common/common.js');
const Logger = require('../common/logger.js');
const logger = Logger.initLogger('SpringCloud');

var getConfigurations = {
    appName: 'spring.application.name',
    port: 'server.port'
}

// var keyReg = new RegExp("^" + key, "i"); // /^eureka/i; 
// var keyReg2 = new RegExp("^#" + key, "i"); // /^#eureka/i
// var keyReg3 = new RegExp("\." + key + "\.", "i"); // /^#eureka/i

var removeConfigurations = [
    // Eureka

    {
        key: "eureka",
        fuzziness: true
    },
    {
        key: "zuul",
        fuzziness: true
    },
    {
        key: "ribbon",
        fuzziness: true
    },
    {
        key: "eureka",
        fuzziness: true
    },
    {
        // Config discovery
        key: "spring.cloud.config.discovery",
        fuzziness: false
    },
    {
        // Kafka, RabbitMQ
        key: "spring.cloud.stream.default-binder",
        fuzziness: false
    }

]

var addConfigurations = [{
        name: "feign.hystrix.enabled",
        value: "true",
        comment: ""
    },
    {
        name: "spring.sleuth.sampler.probability",
        value: "1.0",
        comment: "spring-cloud-gcp-trace\nTo send 100% of traces to Stackdriver Trace"
    },
    {
        name: "spring.sleuth.web.skipPattern",
        value: "(^cleanup.*|.+favicon.*)",
        comment: "To ignore some frequently used URL patterns that are not useful in trace"
    },
    {
        name: "spring.cloud.gcp.logging.enabled",
        value: "true",
        comment: "spring-cloud-gcp-logging"
    },
    {
        name: "management.endpoints.web.exposure.include",
        value: "*",
        comment: "spring-cloud-gcp-metrics"
    },
    {
        name: "management.metrics.tags.application",
        value: "${spring.application.name}",
        comment: ""
    }
]


const replaceConfigurations = [
    // Spring Cloud Stream
    {
        configServer: true,
        before: 'spring.cloud.stream.default-binder',
        removeBefore: true,
        after: [{
            name: "spring.cloud.bus.destination",
            value: "spring-cloud-bus-topic",
            comment: "Config server bus"
        }]
    },
    {
        configServer: false,
        before: 'spring.cloud.config',
        removeBefore: false,
        after: [{
            name: "spring.cloud.config.uri",
            value: "http://{configServer}/",
            comment: "Config server"
        }]
    }
]

// var hasConfiguration = [{
//     excludeConfigServer: true,
//     name: "spring.cloud.config",
//     configs: [{
//         name: "spring.cloud.config.uri",
//         value: "http://{configServer}/", //http://gcp-config-server/   
//         comment: "Config server"
//     }]

// }]




// format `hasConfiguration` data
function formatValue(str, obj) {
    for (let name in obj) {
        str = str.replace(new RegExp("\{" + name + "\}", "g"), obj[name]);
    }
    return str;
}

function propertiesHandler(propertiesPath, config) {
    logger.debug(propertiesPath);
    var editor = prop.createEditor(propertiesPath);

    // replace
    for (let replaceConfig of replaceConfigurations) {

        if (
            (config.isConfigServer && replaceConfig.configServer) ||
            (!config.isConfigServer && !replaceConfig.configServer)
        ) {

            var beforeKeys = editor.findKeys(new RegExp("^" + replaceConfig.before.replace(/\./, "\\."), "g"));
            if (beforeKeys.length > 0) {
                
                if(replaceConfig.removeBefore){
                    // remove before
                    for (let beforeKey of beforeKeys) {
                        editor.unset(beforeKey);
                    }
                }
               
                // add after
                for (let conf of replaceConfig.after) {
                    editor.set(conf.name, formatValue(conf.value, config), conf.comment)
                }
            }
        }
    }

    // // has check
    // for (let hasConfig of hasConfiguration) {

    //     if (config.isConfigServer && hasConfig.excludeConfigServer) {
    //         continue;
    //     }

    //     if (editor.findKeys(new RegExp("^" + hasConfig.name.replace(/\./, "\\."), "g")).length > 0) {
    //         for (let conf of hasConfig.configs) {
    //             editor.set(conf.name, formatValue(conf.value, config), conf.comment)
    //         }
    //     }

    // }

    //remove
    for (let removeConfig of removeConfigurations) {

        if (removeConfig.fuzziness) {
            let key = removeConfig.key;

            var keyReg = new RegExp("^" + key, "i"); // /^eureka/i;
            var keyReg2 = new RegExp("^#" + key, "i"); // /^#eureka/i
            var keyReg3 = new RegExp("\." + key + "\.", "i"); // /^#eureka/i

            let keys = editor.findKeys(keyReg);
            for (let k of keys) {
                editor.unset(k);
            }
            keys = editor.findKeys(keyReg2);
            for (let k of keys) {
                editor.unset(k);
            }
            keys = editor.findKeys(keyReg3);
            for (let k of keys) {
                editor.unset(k);
            }
        } else {
            let key = removeConfig.key;
            var keyReg = new RegExp("^" + key, "i"); // /^eureka/i;
            let keys = editor.findKeys(keyReg);
            for (let k of keys) {
                editor.unset(k);
            }
        }








    }
    // add
    for (let conf of addConfigurations) {
        editor.set(conf.name, conf.value, conf.comment)
    }


    // @TODO Save properties
    // path.basename(propertiesPath)
    // console.log(editor.toString());
    // editor.save("./test.properties");
    let propTxt = editor.toString();
    return fs.outputFile(propertiesPath, propTxt);
}


function ymlHandler(ymlPath, config) {
    logger.debug(ymlPath);
    let ymlObj = yml.ymlToJSON(ymlPath);

    // // has check
    // for (let hasConfig of hasConfiguration) {

    //     if (hasConfig.excludeConfigServer && config.isConfigServer) {
    //         continue;
    //     }

    //     if (dotProp.has(ymlObj, hasConfig.name)) {
    //         for (let conf of hasConfig.configs) {
    //             dotProp.set(ymlObj, conf.name, formatValue(conf.value, config));
    //         }
    //     }
    // }

    // replace
    for (let replaceConfig of replaceConfigurations) {

        if (
            (config.isConfigServer && replaceConfig.configServer) ||
            (!config.isConfigServer && !replaceConfig.configServer)
        ) {

            if (dotProp.has(ymlObj, replaceConfig.before)) {
                
                
                if(replaceConfig.removeBefore){
                   // remove before
                   dotProp.delete(ymlObj, replaceConfig.before);
                }
                

                // add after
                for (let conf of replaceConfig.after) {
                    dotProp.set(ymlObj, conf.name, formatValue(conf.value, config));
                }
            }


        }
    }

    // remove 
    for (let removeConfig of removeConfigurations) {

        let key = removeConfig.key;

        if (removeConfig.fuzziness) {
            var propObjs = ps.searchForExistence(ymlObj, key, {
                separator: '.'
            });
            // console.log(propObjs)

            for (let propObj of propObjs) {
                if (propObj.path) {
                    dotProp.delete(ymlObj, propObj.path + "." + key);
                } else {
                    dotProp.delete(ymlObj, key);
                }
            }

        } else {
            dotProp.delete(ymlObj, key);
        }
    }
    // add
    for (let conf of addConfigurations) {
        dotProp.set(ymlObj, conf.name, conf.value);
    }


    // console.log(res);
    // @TODO Save yaml
    var ymlTxt = yml.jsonToYml(ymlObj);
    // console.log(ymlTxt);
    // console.log(path.basename(ymlPath));

    return fs.outputFile(ymlPath, ymlTxt);
}


function start(config) {

    let promiseList = [];

    let resources = path.join(config.projectPath, '/src/main/resources');

    // (dir:str, ext:str) -> arr
    const properties = filepaths(resources, '.properties');
    const ymls = filepaths(resources, '.yml');

    for (let p of properties) {
        let proPromise = propertiesHandler(p, config);
        promiseList.push(proPromise)
    }

    for (let p of ymls) {
        let ymlPromise = ymlHandler(p, config);
        promiseList.push(ymlPromise)
    }

    return new Promise((res, rej) => {
        Promise.all(promiseList).then(() => {
            res('OK')
        }).catch((err) => {
            rej('ConfigurationExecutor ERROR: ' + err)
        })
    });
}


function getConfigInfoHandler(propertiesFiles, ymlFiles, res) {

    // propertiesFiles
    for (let propertiesPath of propertiesFiles) {
        var editor = prop.createEditor(propertiesPath);
        //get
        let appName = editor.get(getConfigurations.appName);
        let port = editor.get(getConfigurations.port);
        if (appName) {
            res.appName = appName;
        }
        if (port) {
            res.port = port;
        }
    }
    // ymlFiles
    for (let ymlPath of ymlFiles) {
        let ymlObj = yml.ymlToJSON(ymlPath);
        //get
        let appName = dotProp.get(ymlObj, getConfigurations.appName);
        let port = dotProp.get(ymlObj, getConfigurations.port);
        if (appName) {
            res.appName = appName;
        }
        if (port) {
            res.port = port;
        }
    }

    return res;
}


function getConfigServerInfoHandler(propertiesFiles, ymlFiles, res) {

    // propertiesFiles
    for (let propertiesPath of propertiesFiles) {
        var editor = prop.createEditor(propertiesPath);
        //get
        let appName = editor.get(getConfigurations.appName);
        let port = editor.get(getConfigurations.port);
        if (appName) {
            res.appName = appName;
        }
        if (port) {
            res.port = port;
        }
    }
    // ymlFiles
    for (let ymlPath of ymlFiles) {
        let ymlObj = yml.ymlToJSON(ymlPath);
        //get
        let appName = dotProp.get(ymlObj, getConfigurations.appName);
        let port = dotProp.get(ymlObj, getConfigurations.port);
        if (appName) {
            res.appName = appName;
        }
        if (port) {
            res.port = port;
        }
    }

    return res;
}

function getConfigInfo(config) {

    if (config.isConfigServer) {
        return getConfigServerInfo(config.projectPath);
    } else {
        let resources = path.join(config.projectPath, '/src/main/resources');

        var res = {
            appName: '',
            port: 8080
        }
        // (dir:str, ext:str) -> arr
        const properties = filepaths(resources, '.properties');
        const ymls = filepaths(resources, '.yml');

        getConfigInfoHandler(properties, ymls, res);

        logger.info("Configuration: " + JSON.stringify(res));
        return res;
    }
}


function getConfigServerInfo(projectPath) {
    let resources = path.join(projectPath, '/src/main/resources');
    var res = {
        appName: '',
        port: 8080
    }
    // (dir:str, ext:str) -> arr
    // (dir:str, ext:str) -> arr
    const properties = [];
    const ymls = [];

    let files = fs.readdirSync(resources)
    for (let file of files) {
        if (path.extname(file) == '.properties') {
            properties.push(path.join(resources, file));
        } else if (path.extname(file) == '.yml') {
            ymls.push(path.join(resources, file));
        }
    }

    getConfigServerInfoHandler(properties, ymls, res);

    logger.info("Config Server: " + JSON.stringify(res));
    return res;
}


module.exports = {
    start: start,
    getConfigInfo: getConfigInfo,
    getConfigServerInfo: getConfigServerInfo
}
// port

// default port 8080
