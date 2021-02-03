/**
 * SpringCloud Executor
 */
const util = require('util');
const path = require('path');
const fs = require('fs-extra');
// const mvdir = require('mvdir');
const clonefolder = require("clonefolder");
const moment = require('moment');

const execa = require('execa');
const Et = require('easytemplatejs');
const pomExecutor = require('../springcloud/pom-executor.js');
const configurationExecutor = require('../springcloud/configuration-executor.js')
const codeExecutor = require('../springcloud/code-executor.js')
const deploymentExecutor = require('../springcloud/deployment-executor.js')
const dockerExecutor = require('../springcloud/docker-executor.js')

const Logger = require('../common/logger.js');
var logger = Logger.initLogger('SpringCloud');

var commandList = [];

var isStart = true;


// var gcpProjectFolder = "./projects/gcp-projects"


async function execConvert(executeConfiguration, statusFn, nextFn) {
    if (!isStart) {
        return;
    }
    
    

    let sourceConfig = {
        projectId: executeConfiguration.projectId,
        projectPath: executeConfiguration.path,
        replicas: executeConfiguration.replicas,
        serviceType: executeConfiguration.serviceType?"LoadBalancer":"ClusterIP",
        configServer: executeConfiguration.configServer,
        isConfigServer: (executeConfiguration.path == executeConfiguration.configServerProjectPath),
        artifactId: '', // pom.xml
        appName: '', // spring.application.name
        version: '',
        port: 8080,
        datetime: moment().format("YYYY-MM-DD_HHmmssSSS")
    }
    /*
     * 1. If have `spring.application.name`, use it for artifactId and project folder name
     */

    // get `spring.application.name`/`server.port` from properties/yml files
    let pomInfo = null;
    try {
        pomInfo = await pomExecutor.getPomInfo(sourceConfig);
        // get artifactId from pom.xml
        sourceConfig.artifactId = pomInfo.artifactId;
        sourceConfig.version = pomInfo.version;
    } catch (e) {
        console.error(e);
        logger.error('SpringExecutor ERROR: ' + e)
        statusFn(e, "failure");
        nextProject();
        return;
    }


    let configInfo = configurationExecutor.getConfigInfo(sourceConfig);
    sourceConfig.port = configInfo.port;

    if (configInfo.appName) {
        // artifactId=spring.application.name
        sourceConfig.appName = configInfo.appName;
    } else {
        sourceConfig.appName = pomInfo.artifactId;
    }
    // add appName property, same with artifactId
    // sourceConfig.appName = sourceConfig.artifactId;

    // 2. Copy project to dist folder(use `artifactId`)
    let distFolder = path.join(executeConfiguration.outputFolder, '/' + sourceConfig.artifactId);

    fs.copy(executeConfiguration.path, distFolder).then(() => {

            // dist folder config
            let distConfig = Object.assign({}, sourceConfig, {
                projectPath: distFolder
            })

            logger.info(JSON.stringify(distConfig));

            // 3. POM: pom.xml
            let pomPromise = pomExecutor.start(distConfig)

            // 4. Configuration: *.properties/*.yml
            let configPromise = configurationExecutor.start(distConfig);

            // 5. Code
            let codePromise = codeExecutor.start(distConfig)

            // 6. Deployment
            let deploymentPromise = deploymentExecutor.start(distConfig);
            
            // 7. Docker
            let dockerPromise = dockerExecutor.start(distConfig);


            Promise.all([pomPromise, configPromise, codePromise, deploymentPromise, dockerPromise])
                .then(() => {
                    // All successed
                    logger.info(executeConfiguration.path + " execute successed!");
                    statusFn("", "success");
                    nextProject();
                }).catch(err => {
                    // has error
                    console.error(err);
                    logger.error('SpringExecutor ERROR: ' + err);
                    statusFn(err, "failure");
                    nextProject();
                });

        })
        .catch(err => {
            console.error(err);
            logger.error('SpringExecutor ERROR: ' + err)
            statusFn(err, "failure");
            nextProject();
        });



    function nextProject() {
        var projectInfo = nextFn();
        if (projectInfo) {
            executeConfiguration.path = projectInfo.projectPath;
            executeConfiguration.replicas = projectInfo.replicas;
            executeConfiguration.serviceType = projectInfo.serviceType;
            logger.info("Project: " + JSON.stringify(projectInfo));
            execConvert(executeConfiguration, statusFn, nextFn);
        } else {
            logger.info('=== Finish project conversion ===');
        }
    }

    /* 
        // @TODO Project converter
        // ONLY Mock converter
        clonefolder(gcpProjectFolder, executeConfiguration.outputFolder);

        var pomPath = path.join(executeConfiguration.path, "/pom.xml");
        var pomExists = fs.existsSync(pomPath);

        setTimeout(function() {
            if (pomExists) {
                statusFn("", "success");
            } else {
                statusFn("pom.xml not found! ", "failure");
            }
            var projectPath = nextFn();
            if (projectPath) {
                executeConfiguration.path = projectPath;
                logger.info("Project: " + projectPath);
                execConvert(executeConfiguration, statusFn, nextFn);
            }
        }, 3000); */

}

function start(executeConfiguration, statusFn, nextFn) {
    isStart = true;
    logger.info('=== Start project conversion ===');
    execConvert(executeConfiguration, statusFn, nextFn);
}


function stop() {
    isStart = false;
    logger.info("Stop");
}


function getConfigServer(filePaths) {
    let allPromise = [];

    for (let filePath of filePaths) {
        let pomPath = path.join(filePath, "/pom.xml");
        let pomExists = fs.existsSync(pomPath);
        if (pomExists) {
            allPromise.push(pomExecutor.getConfigServer(filePath));
        }
    }

    return new Promise((res, rej) => {
        Promise.all(allPromise).then((values) => {
            let configServerProjectInfo = null;

            for (let value of values) {
                if (value) {
                    configServerProjectInfo = value;
                }
            }

            if (configServerProjectInfo) {
                let configServerName = configServerProjectInfo.artifactId;
                let info = configurationExecutor.getConfigServerInfo(configServerProjectInfo.projectPath);

                if (info.appName) {
                    configServerName = info.appName;
                }
                // Config Server Project App Name
                res({
                    artifactId: configServerProjectInfo.artifactId,
                    appName: configServerName,
                    projectPath: configServerProjectInfo.projectPath
                })
            } else {
                res(null)
            }

        }).catch((err) => {
            console.error(err);
            logger.error(err);
            rej('getConfigServer: ' + err)
        });
    });
}


module.exports = {
    name: "springExecutor",
    start: start,
    stop: stop,
    getConfigServer: getConfigServer

};
