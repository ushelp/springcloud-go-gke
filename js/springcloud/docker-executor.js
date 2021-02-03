const path = require('path');
const filepaths = require('filepath-recursive');
const handler = require('@lnfsink/file-handler');
const fs = require('fs-extra');
const Et = require('easytemplatejs');

const common = require('../common/common.js');
const Logger = require('../common/logger.js');
const logger = Logger.initLogger('SpringCloud');


function start(config) {

    var srcFile = "./js/springcloud/templates/Dockerfile";
    var distFile = path.join(config.projectPath, "/Dockerfile");

    return new Promise((res, rej) => {
        fs.copy(srcFile, distFile).then(() => {
            fs.readFile(distFile, 'utf-8', function(err, text) {
                let newText = Et.template(text, config);
                fs.outputFile(distFile, newText, (err) => {
                    if (err) {
                        console.error(err);
                        rej(err);
                    } else {
                        res("ok")
                    }
                });
            })

        }).catch(err => {
            console.error(err);
            rej('DockerExecutor ERROR: ' + err)
        });

    });
}



module.exports = {
    start: start
}
