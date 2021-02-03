const {
    exec,
    execSync
} = require('child_process');
const os = require('os');


const execa = require('execa');


const Logger = require('./logger.js');
var logger = Logger.initLogger('GKE')

const COMMANDS = {
    getProjectId: "gcloud config get-value project",
    getClusterName: 'gcloud container clusters list --format json(name)',
    getGcloudPath: 'where gcloud',
    getKubectlPath: 'where kubectl'
}


// Get projectId
function getProjectId(callback) {
    logger.info(COMMANDS.getProjectId)


    var cmdRes = COMMANDS.getProjectId.split(" ");

    (async () => {
        try {
            const {
                stdout
            } = await execa(cmdRes[0], cmdRes.slice(1), {
                cwd: './',
                // buffer: false, // for on('data', )
                env: {
                    PYTHONUNBUFFERED: true
                }
            });
            logger.info(stdout)
            callback(stdout.toString().replace(/\r/g, "").replace(/\n/g, ""))
        } catch (error) {
            console.error(`getProjectId child process error with error ${error}`);
        }
    })();

    // let child = execa(cmdRes[0], cmdRes.slice(1), {
    //     cwd: './',
    //     // buffer: false,  // for on('data', )
    //     env: {
    //         PYTHONUNBUFFERED: true
    //     }
    // });


    // child.then(result => {
    //     // console.log(result);
    //     logger.info(result.stdout)
    //     callback(result.stdout.toString().replace(/\r/g, "").replace(/\n/g, ""))
    // }).catch(error => {
    //      console.error(`getProjectId child process error with error ${error}`);
    // });


    // child.stdout.on('data', function(stdout) {
    //     // stdout=new String(stdout);
    //     logger.info(stdout)
    //     callback(stdout.toString().replace(/\r/g, "").replace(/\n/g, ""))
    // })

    // child.stderr.on('data', function(stderr) {
    //     logger.error(stderr)
    //     callback("")
    // })
    // // child.on('error', (error) => {
    // //     console.error(`child process error with error ${error}`);
    // // });
    // child.on('exit', (code) => {
    //     logger.info(`getProjectId child process exited with code ${code}`);
    // }); 

}

// Get getClusterName
function getClusterName(callback) {
    logger.info(COMMANDS.getClusterName)
    var cmdRes = COMMANDS.getClusterName.split(" ");

    (async () => {
        try {
            const {
                stdout
            } = await execa(cmdRes[0], cmdRes.slice(1), {
                cwd: './',
                // buffer: false, // for on('data', )
                env: {
                    PYTHONUNBUFFERED: true
                }
            });
            var clusterName = JSON.parse(stdout);
            logger.info(stdout)
            if (clusterName.length > 0) {
                callback(clusterName[0].name)
            } else {
                callback("")
            }
        } catch (error) {
            console.error(`getClusterName child process error with error ${error}`);
        }
    })();



    // let child = execa(cmdRes[0], cmdRes.slice(1), {
    //     cwd: './',
    //     // buffer: false, // for on('data', )
    //     env: {
    //         PYTHONUNBUFFERED: true
    //     }
    // })

    // child.then(result => {
    //     // console.log(result);
    //     var clusterName = JSON.parse(result.stdout);
    //     logger.info(result.stdout)
    //     if (clusterName.length > 0) {
    //         callback(clusterName[0].name)
    //     } else {
    //         callback("")
    //     }
    // }).catch(error => {
    //     logger.error(`getClusterName child process error with error ` + error);

    // });

    // console.log(child);
    // console.log(a.stdout);

    // child.stdout.on('data', function(stdout) {
    //     console.log(new String(stdout));
    //     var clusterName = JSON.parse(new String(stdout));
    //     logger.info(stdout)
    //     if (clusterName.length > 0) {
    //         callback(clusterName[0].name)
    //     } else {
    //         callback("")
    //     }
    // })

    // child.stderr.on('data', function(stderr) {
    //     logger.warn(stderr)
    //     callback("")
    // })
    // child.on('error', (error) => {
    //     logger.error(`getClusterName child process error with error ` + error);
    // });
    // child.on('close', (code) => {
    //     logger.info('getClusterName child process close with code ' + code);
    //     // child.kill();
    // });


}


// Get gcloudPath
function getGcloudPath(callback) {
    logger.info(COMMANDS.getGcloudPath);
    (async () => {
        try {
            const {
                stdout
            } = await execa(COMMANDS.getGcloudPath);
            logger.info(stdout)


            var paths = stdout.split('\r\n');

            // if (os.type() == 'Windows_NT') {
            // 	//windows
            // } else if (os.type() == 'Darwin') {
            // 	//mac
            // } else if (os.type() == 'Linux') {
            // 	//Linux
            // } else{
            // 	//不支持提示
            // }

            if (os.type() == 'Windows_NT') {
                for (let path of paths) {
                    if (path.indexOf('.cmd') != -1) {
                        callback(path)
                        break;
                    }
                }
            } else {
                for (let path of paths) {
                    if (path.indexOf('.cmd') == -1) {
                        callback(path)
                        break;
                    }
                }
            }


        } catch (error) {
            logger.error(error);
            callback("")
        }
    })();
}
// Get kubectl
function getKubectlPath(callback) {
    logger.info(COMMANDS.getKubectlPath);
    (async () => {
        try {
            const {
                stdout
            } = await execa(COMMANDS.getKubectlPath);
            logger.info(stdout)
            callback(stdout.split('\r\n')[0])
        } catch (error) {
            logger.error(error);
            callback("")
        }
    })();
}

//=========
module.exports = {
    getProjectId: getProjectId,
    getClusterName: getClusterName,
    getGcloudPath: getGcloudPath,
    getKubectlPath: getKubectlPath
}
