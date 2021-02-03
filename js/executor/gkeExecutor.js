/**
 * GKE Executor
 */
const util = require('util');
const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');


const Et = require('easytemplatejs');
const Logger = require('../common/logger.js');
var logger = Logger.initLogger('GKE');

const runCommand = require('../common/run-command.js');

const pomExecutor = require('../springcloud/pom-executor.js')
const clusterExecutor = require('../gke/cluster-executor.js')



var startCommandList = [
    "gcloud config set project {=projectId} --verbosity debug",
    "gcloud config get-value project --verbosity debug"
    // create cluster
];

/*

gcloud container clusters get-credentials test-cluster
gcloud builds submit --tag gcr.io/test-project-id-100/gcp-provider:0.0.1-SNAPSHOT
kubectl apply -f deployment/recreate/deployment.yaml
kubectl rollout status deploy gcp-provider
kubectl apply -f deployment/recreate/service.yaml

*/

var commandList = [
    // Get cluster credentials 
    "gcloud container clusters get-credentials {=clusterName} --verbosity debug",
    // Build a application
    "gcloud builds submit --tag gcr.io/{=projectId}/{=projectName}:{=projectVersion} --verbosity debug",
    // Deployment a application
    "kubectl apply -f deployment/recreate/deployment.yaml",
    "kubectl rollout status deploy {=projectName}",
    // Deployment a service
    "kubectl apply -f deployment/recreate/service.yaml"
];


var isStart = true;
var startCommandIndex = 0;
var commandIndex = 0;


function cmdConvert(cmdStr, executeConfiguration) {

    let res = {
        file: "",
        arguments: []
    }
    var arr = cmdStr.split(" ");
    res.file = arr[0];

    if (res.file == "gcloud") {
        res.file = executeConfiguration.gcloudPath;
    } else if (res.file = "kubectl") {
        res.file = executeConfiguration.kubectlPath;
    }
    res.arguments = arr.slice(1);
    return res;
}

function execStartWinCommands(executeConfiguration, logFn, statusFn, nextFn) {
    if (!isStart) {
        return;
    }
    let stderr = null;
    let cmd = Et.template(startCommandList[startCommandIndex], executeConfiguration);

    logger.info(cmd);
    logFn(cmd, "cmd");

    var cmdRes = cmdConvert(cmd, executeConfiguration);

    runCommand.start({
            file: cmdRes.file,
            arguments: cmdRes.arguments,
            cwd: executeConfiguration.path
        },
        function(stdout) {
            if (!isStart) {
                return;
            }
            logFn(stdout, "stdout");
            logger.info('stdout: ' + stdout);
        },
        function(stderr) {
            if (!isStart) {
                return;
            }
            
            if(cmd.startsWith('gcloud beta container clusters create') && stderr=='.'){
                stderr="creating...";
                logFn(stderr, "stdout");
                logger.info('stdout: ' + stderr);
            }else{
                logFn(stderr, "stderr");
                logger.error('stderr: ' + stderr);
            }
            
        },
        function(err) {
            logFn('child process errors with error: ' + err, "stderr");
            logger.error('child process errors with error: ' + err);
        },
        function(code) {
            logFn(`child process exited with code ${code}`);
            logger.info(`child process exited with code ${code}`);
            if (code == 0) {
                startCommandIndex++;
                if (startCommandIndex < startCommandList.length) {
                    execStartWinCommands(executeConfiguration, logFn, statusFn, nextFn);
                } else {
                    logFn("=== Project commands ===");
                    logger.info('=== Project commands ===');
                    var projectPath = nextFn();
                    if (projectPath) {
                        logFn(projectPath);
                        logger.info("Project: " + projectPath);
                        executeConfiguration.path = projectPath;
                        execProjectWinCommands(executeConfiguration, logFn, statusFn, nextFn);
                    }

                }
            } else {
                statusFn("", "cancel");
            }
        }
    );

}

function execProjectWinCommands(executeConfiguration, logFn, statusFn, nextFn) {
    if (!isStart) {
        return;
    }

    executeConfiguration.projectName = path.basename(executeConfiguration.path);

    let pomInfoPromise =  pomExecutor.getPomInfo({
        projectPath: executeConfiguration.path
    });
    
    pomInfoPromise.then((pomInfo)=>{
         // executeConfiguration.projectVersion = '0.0.1-SNAPSHOT';
         executeConfiguration.projectVersion = pomInfo.version;
         run();
    })
    
   
    function run(){
        logger.info(executeConfiguration.path);
        logger.info(executeConfiguration.projectName);
        logger.info(executeConfiguration.projectVersion);
        logFn(executeConfiguration.path);
        logFn(executeConfiguration.projectName);
        logFn(executeConfiguration.projectVersion);
        
        let stderr = null;
        
        let cmd = Et.template(commandList[commandIndex], executeConfiguration);
        
        logger.info(cmd);
        logFn(cmd, "cmd");
        
        
        var cmdRes = cmdConvert(cmd, executeConfiguration);
        
        runCommand.start({
                file: cmdRes.file,
                arguments: cmdRes.arguments,
                cwd: executeConfiguration.path
            }, function(stdout) {
                if (!isStart) {
                    return;
                }
                logFn(stdout, "stdout");
                logger.info('stdout: ' + stdout);
        
                if (cmd.startsWith('kubectl')) {
        
                    commandIndex++;
                    if (commandIndex < commandList.length) {
                        execProjectWinCommands(executeConfiguration, logFn, statusFn, nextFn);
                    } else {
                        statusFn("", "success");
                        commandIndex = 0;
                        var projectPath = nextFn();
                        if (projectPath) {
                            executeConfiguration.path = projectPath;
                            logFn(projectPath);
                            logger.info("Project: " + projectPath);
                            execProjectWinCommands(executeConfiguration, logFn, statusFn, nextFn);
                        }
                    }
                }
            },
            function(stderr) {
                if (!isStart) {
                    return;
                }
                logFn(stderr.toString(), "stderr");
                logger.error('stderr: ' + stderr.toString());
                if (cmd.startsWith('kubectl')) {
                    if (commandIndex >= commandList.length) {
                        statusFn("", "failure");
                    }
                }
            },
            function(err) {
                logFn('child process errors with error: ' + err, "stderr");
                logger.error('child process errors with error: ' + err);
                if (cmd.startsWith('kubectl')) {
                    if (commandIndex >= commandList.length) {
                        statusFn("", "failure");
                    }
        
                }
            },
            function(code) {
                logger.info(`child process exited with code ${code}`);
        
                if (!cmd.startsWith('kubectl')) {
        
                    if (code == 0) {
                        commandIndex++;
                        if (commandIndex < commandList.length) {
                            execProjectWinCommands(executeConfiguration, logFn, statusFn, nextFn);
                        } else {
                            statusFn("", "success");
                            commandIndex = 0;
                            var projectPath = nextFn();
                            if (projectPath) {
                                executeConfiguration.path = projectPath;
                                logFn(projectPath);
                                logger.info("Project: " + projectPath);
                                execProjectWinCommands(executeConfiguration, logFn, statusFn, nextFn);
                            }
                        }
                    } else {
                        statusFn("", "failure");
                    }
                }
            });
    }

    

}

function start(executeConfiguration, logFn, statusFn, nextFn) {
    isStart = true;
    startCommandIndex = 0;
    commandIndex = 0;

    if (!logFn) {
        logFn = function() {}
    }
    if (!statusFn) {
        statusFn = function() {}
    }
    if (!nextFn) {
        nextFn = function() {}
    }


    logFn("=== Start commands ===");
    logger.info('=== Start commands ===');
    execStartWinCommands(executeConfiguration, logFn, statusFn, nextFn);

}


function stop() {
    isStart = false;
    startCommandIndex = 0;
    commandIndex = 0;
    logger.info("Stop");
}



function createCluster(configData) {
    let cmd = clusterExecutor.getCreateClusterCmd(configData);
    startCommandList.splice(2);
    startCommandList.push(cmd);
}

module.exports = {
    name: "gkeExecutor",
    start: start,
    stop: stop,
    createCluster: createCluster
};
