const path = require('path');
const filepaths = require('filepath-recursive')
const handler = require('@lnfsink/file-handler')

const common = require('../common/common.js');
const Logger = require('../common/logger.js');
const logger = Logger.initLogger('SpringCloud');


var removeLines = [
    "@EnableDiscoveryClient",
    "@EnableHystrixDashboard",
]

var replaceLines = [{
    // @FeignClient(value = "users-provider", fallback = UsersClientFallback.class, configuration = MultipartSupportConfig.class)
    pattern: /^@FeignClient\(.*\)$/i,
    // @FeignClient(name = "users-provider", fallback = UsersClientFallback.class, configuration = MultipartSupportConfig.class, url="http://users-provider")
    replacer: function(str) {
        let res = str.replace(/\ /g, "").replace('value="', 'name="');
        let value = /name=\"([^\"]*)\"/.exec(res)[1];
        res = res.substring(0, res.length - 1);
        return res + ', url="http://' + value + '")';
    }
}]


function codeHandler(config) {
    var srcFolder = path.join(config.projectPath, "src/main/java");
    const javaFiles = filepaths(srcFolder, '.java');

    let modified = false;

    for (let javaFile of javaFiles) {
        modified = false;
        let writeLines = [];

        let reader = handler.read(javaFile, {
            bufferSize: 1024 * 1024, // 1M Default
            encoding: 'utf8' // Default
        });


        for (let line of reader) {
            let newLine = line;
            for (let rml of removeLines) {
                if (rml == line.trim()) {
                    newLine = null;
                    modified = true;
                }
            }

            for (let rpl of replaceLines) {
                if (rpl.pattern.test(line.trim())) {
                    modified = true;
                    newLine = rpl.replacer(line.trim());
                }
            }

            if (newLine) {
                writeLines.push(newLine);
            }
        }

        if (modified) {
            let writer = handler.write(javaFile, {
                cacheLines: 1000 // Cache some lines before writing to the file
            })
            for (let line of writeLines) {
                writer.writeLine(line)
            }
            writer.close();
        }

    }
}

function start(config) {
    return new Promise((res, rej) => {
        try {
            codeHandler(config);
            res("ok");
        } catch (err) {
            rej(err);
        }
    })
}


module.exports = {
    start: start
}
