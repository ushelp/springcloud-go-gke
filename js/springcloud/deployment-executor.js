const path = require('path');
const filepaths = require('filepath-recursive');
const handler = require('@lnfsink/file-handler');
const fs = require('fs-extra');
const Et = require('easytemplatejs');
const moment = require('moment');

const common = require('../common/common.js');
const Logger = require('../common/logger.js');
const logger = Logger.initLogger('SpringCloud');


function start(config) {

    var srcFolder = "./js/springcloud/templates/deployment";
    var distFolder = path.join(config.projectPath, "/deployment");

    return new Promise((res, rej) => {
        
        fs.copy(srcFolder, distFolder).then(() => {
            var promiseList = [];
            const yamlFiles = filepaths(distFolder, '.yaml');

            for (let yamlFile of yamlFiles) {

                let p = new Promise((res2, rej2) => {
                    fs.readFile(yamlFile, 'utf-8', function(err, text) {
                        let newText = Et.template(text, config);
                        fs.outputFile(yamlFile, newText, (err) => {
                            if (err) {
                                console.error(err);
                                rej2(err);
                            } else {
                                res2("ok")
                            }
                        });
                    })
                })
                promiseList.push(p);

            }

            Promise.all(promiseList).then(() => {
                res("ok")
            }).catch((err) => {
                console.error(err);
                rej('DeploymentExecutor ERROR: ' + err);
            })


        }).catch(err => {
            console.error(err);
            rej('DeploymentExecutor ERROR: ' + err)
        });

    });
}





module.exports = {
    start: start
}
