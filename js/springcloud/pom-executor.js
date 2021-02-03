const util = require('util');
const xml2js = require('xml2js');
const path = require('path');
const fs = require('fs-extra');
const pomParser = require("../common/parser/pom-parse.js");
const common = require('../common/common.js');
const Logger = require('../common/logger.js');
const logger = Logger.initLogger('SpringCloud');


const properties = {
    "spring-cloud-gcp.version": "1.2.4.RELEASE",
}

const dependencies = [
    // GCP pub/sub stream bus
    {
        "groupId": "org.springframework.cloud",
        "artifactId": "spring-cloud-gcp-starter-bus-pubsub"
    },
    // Stackdriver Logging
    {
        "groupId": "org.springframework.cloud",
        "artifactId": "spring-cloud-gcp-starter-logging"
    },
    // Stackdriver Trace 
    {
        "groupId": "org.springframework.cloud",
        "artifactId": "spring-cloud-gcp-starter-trace"
    },
    // Stackdriver Metrics Monitoring 
    {
        "groupId": "org.springframework.boot",
        "artifactId": "spring-boot-starter-actuator"
    },
    {
        "groupId": "org.springframework.cloud",
        "artifactId": "spring-cloud-gcp-starter-metrics"
    }
]

const dependencyManagementDependencies = [{
    "groupId": "org.springframework.cloud",
    "artifactId": "spring-cloud-gcp-dependencies",
    "version": "${spring-cloud-gcp.version}",
    "type": "pom",
    "scope": "import"
}]


const removeDependencies = [
    // Eureka
    {
        "groupId": "org.springframework.cloud",
        "artifactId": "spring-cloud-starter-netflix-eureka-client"
    },
    // Ribbon
    {
        "groupId": "org.springframework.cloud",
        "artifactId": "spring-cloud-starter-netflix-ribbon"
    },
    // Zipkin
    {
        "groupId": "org.springframework.cloud",
        "artifactId": "spring-cloud-starter-zipkin"
    },
    {
        "groupId": "org.springframework.cloud",
        "artifactId": "spring-cloud-starter-sleuth"
    }

    // RabbitMQ
    // {
    //     "groupId": "org.springframework.amqp",
    //     "artifactId": "spring-rabbit"
    // },
]

const replaceDependencies = [
    // Spring Cloud Stream
    {
        before: [
            // RabbitMQ
            {
                "groupId": "org.springframework.cloud",
                "artifactId": "spring-cloud-starter-stream-rabbit"
            },
            {
                "groupId": "org.springframework.cloud",
                "artifactId": "spring-cloud-stream-binder-rabbit"
            },
            // Kafka
            {
                "groupId": "org.springframework.cloud",
                "artifactId": "spring-cloud-starter-stream-kafka"
            },
            {
                "groupId": "org.springframework.cloud",
                "artifactId": "spring-cloud-stream-binder-kafka"
            }
        ],
        after: [{
            "groupId": "org.springframework.cloud",
            "artifactId": "spring-cloud-gcp-pubsub-stream-binder"
        }]
    },
    {
        before: [
            // RabbitMQ
            {
                "groupId": "org.springframework.cloud",
                "artifactId": "spring-cloud-starter-bus-amqp"
            },
            // Kafka
            {
                "groupId": "org.springframework.cloud",
                "artifactId": "spring-cloud-starter-bus-kafka"
            }
        ],
        after: [{
            "groupId": "org.springframework.cloud",
            "artifactId": "spring-cloud-gcp-starter-bus-pubsub"
        }]
    }
]



const configServer = {
    dependencies: [{
        "groupId": "org.springframework.cloud",
        "artifactId": "spring-cloud-gcp-starter-bus-pubsub"
    }],

    removeDependencies: [
        // Eureka
        {
            "groupId": "org.springframework.cloud",
            "artifactId": "spring-cloud-starter-netflix-eureka-client"
        },
        // RabbitMQ
        {
            "groupId": "org.springframework.cloud",
            "artifactId": "spring-cloud-starter-bus-amqp"
        },
        // Kafka
        {
            "groupId": "org.springframework.cloud",
            "artifactId": "spring-cloud-starter-bus-kafka"
        }
    ]
}


function configServerCheck(dependencies) {
    var exists = false;
    let artifactId = "spring-cloud-config-server";
    for (let dependence of dependencies) {
        if (dependence.artifactId == artifactId) {
            exists = true;
            break;
        }
    }

    return exists;
}

function start(config) {
    let pomPath = path.join(config.projectPath, "pom.xml");

    var opts = {
        filePath: pomPath
    }

    // Parse the pom based on a path
    return new Promise(function(resolve, reject) {

        pomParser.parse(opts, function(err, pomResponse) {
            if (err) {
                reject('POMExecutor ERROR: ' + err);
                return;
            }


            try {
                var projectObject = pomResponse.pomObject.project;
                projectObject.artifactId = config.artifactId;

                // logger.debug(pomObject);
                logger.debug("OBJECT: " + JSON.stringify(projectObject));

                // var res = {
                //     artifactId: projectObject.artifactId,
                //     version: projectObject.version,
                //     pomXML: ''
                // };

                console.log(properties);
                console.log(projectObject.properties);
                
                if(!projectObject.properties){
                    projectObject.properties={};
                }
                
                // === Properties
                for (let k in properties) {
                    console.log(k, properties[k]);
                    projectObject.properties[k] = properties[k];
                    console.log('xxxx');
                }

                // ==== Dependencymanagement
                // projectObject.dependencyManagement.dependencies.dependency = []
                var flag = util.isArray(projectObject.dependencyManagement.dependencies.dependency);
                if (!flag) {
                    var dependObj = projectObject.dependencyManagement.dependencies.dependency;
                    projectObject.dependencyManagement.dependencies.dependency = [];
                    projectObject.dependencyManagement.dependencies.dependency.push(dependObj);
                }

                for (let s of dependencyManagementDependencies) {
                    if (!common.checkExistsInArr(projectObject.dependencyManagement.dependencies
                            .dependency,
                            null,
                            function(depend) {
                                return depend.groupId == s.groupId && depend.artifactId == s.artifactId
                            })) {
                        projectObject.dependencyManagement.dependencies.dependency.push(s);
                    }
                }

                var isConfigServer = configServerCheck(projectObject.dependencies.dependency);
                var depends = dependencies;
                var removeDepends = removeDependencies;
                if (isConfigServer) {
                    depends = configServer.dependencies;
                    removeDepends = configServer.removeDependencies;
                }


                //==== Dependencies
                for (let s of depends) {

                    if (!common.checkExistsInArr(projectObject.dependencies.dependency,
                            null,
                            function(depend) {
                                return depend.groupId == s.groupId && depend.artifactId == s.artifactId
                            })) {
                        projectObject.dependencies.dependency.push(s);
                    }

                }

                // console.log(projectObject.dependencies.dependency);

                //==== RemoveDependencies
                for (let s of removeDepends) {
                    common.removeAllItemFromArr(projectObject.dependencies.dependency, null,
                        function(
                            depend) {
                            return depend.groupId == s.groupId && depend.artifactId == s.artifactId;
                        })
                }


                // ==== replaceDependencies

                for (let replaceDependence of replaceDependencies) {
                    let before = replaceDependence.before;
                    let after = replaceDependence.after;

                    // if has denpend in before list, replace it use after
                    let hasBefore = false;

                    for (let d of before) {
                        let hasDepend = common.checkExistsInArr(projectObject.dependencies.dependency,
                            null,
                            function(depend) {
                                return depend.groupId == d.groupId && depend.artifactId == d.artifactId
                            });

                        if (hasDepend) {
                            common.removeAllItemFromArr(projectObject.dependencies.dependency, null,
                                function(
                                    depend) {
                                    return depend.groupId == d.groupId && depend.artifactId == d.artifactId;
                                });
                            hasBefore = true;
                        }

                    }

                    // add after dependencies
                    if (hasBefore) {
                        for (let d of after) {
                            if (!common.checkExistsInArr(projectObject.dependencies.dependency,
                                    null,
                                    function(depend) {
                                        return depend.groupId == d.groupId && depend.artifactId == d.artifactId
                                    })) {
                                projectObject.dependencies.dependency.push(d);
                            }

                        }
                    }

                }

                // The parsed pom pbject.
                // logger.info("OBJECT: " + JSON.stringify(projectObject));

                let builder = new xml2js.Builder({
                    rootName: 'project',
                    xmldec: {
                        'version': '1.0',
                        'encoding': 'UTF-8'
                    }
                });
                let xml = builder.buildObject(projectObject);
                // res.pomXML = xml;

                writePomFile(config, xml).then(() => {
                    resolve("ok");
                }).catch((err) => {
                    reject('POMExecutor ERROR: ' + err);
                });

            } catch (e) {
                reject('POMExecutor ERROR: ' + e);
            }

        });

    })

}

function getConfigServer(projectPath) {
    let pomPath = path.join(projectPath, "pom.xml");
    var opts = {
        filePath: pomPath
    }
    // Parse the pom based on a path
    return new Promise(function(resolve, reject) {
        var x = pomParser.parse(opts, function(err, pomResponse) {
            if (err) {
                reject('POMExecutor ERROR: ' + err);
                return;
            }
            var projectObject = pomResponse.pomObject.project;
            for (let dependency of projectObject.dependencies.dependency) {
                if (dependency.artifactId == "spring-cloud-config-server") {
                    // Config Server
                    resolve({
                        projectPath: projectPath,
                        artifactId: projectObject.artifactId
                    });
                    return;
                }
            }
            resolve(null);
        });
    });
}


function getPomInfo(config) {
    let pomPath = path.join(config.projectPath, "pom.xml");

    var opts = {
        filePath: pomPath
    }
    // Parse the pom based on a path
    return new Promise(function(resolve, reject) {

        let pomExists = fs.existsSync(pomPath);

        if (!pomExists) {
            reject("pom.xml not found! ");
            return;
        }

        pomParser.parse(opts, function(err, pomResponse) {
            if (err) {
                reject('POMExecutor ERROR: ' + err);
                return;
            }
            var projectObject = pomResponse.pomObject.project;
            resolve({
                artifactId: projectObject.artifactId,
                version: projectObject.version
            });
        });
    });
}


function writePomFile(config, pomXML) {
    let pomPath = path.join(config.projectPath, "pom.xml");
    return fs.outputFile(pomPath, pomXML);
}

module.exports = {
    start: start,
    getConfigServer: getConfigServer,
    getPomInfo: getPomInfo
}
