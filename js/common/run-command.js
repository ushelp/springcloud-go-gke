const execa = require('execa');
// const spawn = require('cross-spawn');
function start(config, stdoutCallback, stderrCallback, errorCallback, exitCallback) {
    // gcloud builds submit --tag gcr.io/test-project-id-100/gcp-consumer-feign:0.0.1-SNAPSHOT

    let closed = false;
    let stderred = false;
    let stdouted = false;

    let child = execa(
        config.file,
        config.arguments, {
            cwd: config.cwd,
            buffer: false,
            env: Object.assign({}, process.env, {
                PYTHONUNBUFFERED: true
            })
        });

    // var stdout = "";
    child.stdout.on('data', function(data) {
        stdouted = true;
        // console.log("====DATA(out): "+new String(data).toString());
        stdoutCallback(new String(data));
        if (closed) {
            exitCallback(code);
        }
    })


    child.stderr.on('data', function(stderr) {
        stderred = true;
        // console.warn(stderr)
        // console.warn(new String(stderr));
        stderrCallback(new String(stderr));
        if (closed) {
            exitCallback(code);
        }
    });
    child.on('close', (code) => {
        closed = true;
        // console.log("====CLOSE: "+`child process close all stdio with code ${code}`);
        if (stdouted || stderred) {
            exitCallback(code);
        }
    });

    // child.on('exit', (code) => {
    //     // console.log(`child process exited with code ${code}`);
    //     // console.log(stdout);
    //     exitCallback(code);
    // });
    child.on('error', (error) => {
        // console.log(`child process error with error ${error}`);
        errorCallback(new String(error));
    });

}


module.exports = {
    start: start
}
