$(function() {

    const Logger = require('../js/common/logger.js');
    var logger = Logger.initLogger('GKE')
    const init = require('../js/common/init.js')
    const common = require('../js/common/common.js');
    const gkeExecutor = require('../js/executor/gkeExecutor.js');

    function initForm() {
        // CPU: 2-32
        var cpu = $('#CPU');
        var memory = $('#memory');
        var region = $('#region');
        var zone = $('#zone');


        for (var i = 2; i <= 32; i++) {
            cpu[0].options.add(new Option(i, i))
        }

        for (var i = 1; i <= 16; i = i + 0.5) {
            memory[0].options.add(new Option(i, i))
        }

        for (var i in globalData.gcp.regionList) {
            var v = globalData.gcp.regionList[i];
            region[0].options.add(new Option(v, v))
        }
        for (var i in globalData.gcp.zoneList) {
            var v = globalData.gcp.zoneList[i];
            zone[0].options.add(new Option(v, v))
        }

        $('#autoCreate').on('change', function() {
            if (this.checked) {
                $('#clusterDiv').show();
            } else {
                $('#clusterDiv').hide();
            }
        })


        $('#autoScaling').on('change', function() {
            if (this.checked) {
                $('#autoScalingDiv').show();
                $('#numNodesDiv').hide();
            } else {
                $('#numNodesDiv').show();
                $('#autoScalingDiv').hide();
            }
        });

        $('[name="locationType"]').on('change', function() {
            var chkType = this.value;
            var unChkType = chkType == 'region' ? 'zone' : 'region';

            $(`#${chkType}Div`).show();
            $(`#${unChkType}Div`).hide();
        });

        $('#bufferHeight').on('blur', function() {

            $('#runlog').css({
                'max-height': this.value + 'px'
            })
        })

        $('#gcloudPathLoading').show();
        init.getGcloudPath(function(gcloudPath) {
            $('#gcloudPath').html(gcloudPath);
            $('#gcloudPathLoading').hide();
        })

        $('#kubectlPathLoading').show();
        init.getKubectlPath(function(kubectlPath) {
            $('#kubectlPath').html(kubectlPath);
            $('#kubectlPathLoading').hide();
        })

        $('#projectIdLoading').show();
        init.getProjectId(function(projectId) {
            $('#projectId').val(projectId);
            $('#projectIdLoading').hide();

        });

        $('#clusterNameLoading').show();
        init.getClusterName(function(clusterName) {
            if (clusterName) {
                $('#clusterName').val(clusterName);
            }

            $('#clusterNameLoading').hide();
        });
    }


    initForm();

    var successHTML =
        `
                    <div class="text-success">
                     <i class="fas fa-check-circle"></i>
                    </div>
                    `;


    var runningHTML =
        `
                      <div class="spinner-border spinner-border-sm text-secondary">
                        <span class="sr-only">Loading...</span>
                      </div>
                      `;


    var removeHTML =
        `<i class="fas fa-times remove-icon text-dark"  title="double click remove" ></i>
                    `;



    // Start
    $('.startBtn').on('click', start);
    // Stop
    $('.stopBtn').on('click', stop)

    // Refresh
    $('.refreshBtn').on('click', function() {
        $('.folderList').children().remove();

        stop();

        globalData.folders = [];
        globalData.foldersRecord = {};
        globalData.running = false;

        globalData.totalRefresh();
        $('.dndArea').show();
        $('.footer').hide();
        $('#runlog').html('');
        btnToggle('init');
    });




    // Show projects
    globalData.showFiles = function(files) {


        var id = globalData.containerId.replace("Container", "");
        var container = $(`#${globalData.containerId}`);

        if (container.find('.startBtn').prop('disabled')) {
            // Already started, please stop before adding files.
            layer.msg('Already started, please stop before adding files.');
            return;
        }

        if (files.length > 0) {
            container.find(`.dndArea`).hide();
            container.find(`.footer`).show();
        } else {
            return;
        }
        for (let f of files) {
            var filepath = f.path;
            if (!globalData.foldersRecord[filepath]) {

                var filePathBase64 = common.strToBase64(filepath);

                container.find(`.folderList`).append(
                    `
                <tr path="${filePathBase64}">
                  <td class="fileRemove px-0" >${removeHTML}</td>
                  <td class="filePath">${filepath}</td>
                  <td class="fileStatus" ></td>
                </tr>
                `
                )
                globalData.foldersRecord[filepath] = true;
                globalData.folders.push(f);
            }
        }
        globalData.totalRefresh();
    }

    function btnToggle(init) {
        if (init || $('.startBtn').prop('disabled')) {
            $('.stopBtn').prop('disabled', true);
            $('.startBtn').prop('disabled', false);
        } else {
            $('.startBtn').prop('disabled', true);
            $('.stopBtn').prop('disabled', false);
        }
    }


    $('#clearConsole').on('click', function() {
        $('#runlog').html('');
    });

    function flushBufferLines() {
        var runlog = $('#runlog');
        // flush buffer
        var count = $('#bufferLines').val();

        if (runlog.children('div').length > count) {
            var rmcount = (runlog.children('div').length - count);
            //      		runlog.children('div:first').remove();
            runlog.children('div:lt(' + rmcount + ')').remove();
        }
    }

    function start() {

        if ($('#clusterName').val() == "") {
            layer.msg("Please set clusterName value.")
            return;
        }

        globalData.running = true;
        btnToggle();

        var runlog = $('#runlog');
        runlog.html('');

        // log
        /**
         * @param {Object} msg Message
         * @param {Object} type stuout, stderr, close
         */
        function logFn(msg, type) {
            msg = common.htmlEncode(msg).replace(/\n/g, "<br/>")
            let datetime= new Date().toLocaleString();
            
            // logger.warn(msg+", "+type);
            if (type == 'stdout') {
                runlog.append(`<div><span class="text-success">stdout:</span> [${datetime}] ${msg} </div>`);
            } else if (type == 'stderr') {
                runlog.append(`<div><span class="text-danger">stderr:</span> [${datetime}] ${msg} </div>`);
            } else if (type == 'cmd') {
                runlog.append(`<div class="alert alert-primary"><span class="text-primary">command:</span> [${datetime}] ${msg} </div>`);
            } else if (type == 'close') {
                runlog.append(`<div><span class="text-warning">close:</span> [${datetime}] ${msg} </div>`);
            } else {
                runlog.append(`<div>${msg} </div>`);
            }

            runlog[0].scrollTop = runlog[0].scrollHeight;
            flushBufferLines();
        }

        // StatusUpdate
        /**
         * @param {Object} msg Message
         * @param {Object} type success, failure
         * @param {Object} type success, failure
         */
        function statusFn(msg, type) {
            if (globalData.running) {
                let trs = $(`#${globalData.containerId}`).find(`.folderList tr`); // trs
                let fileTr = null;
                trs.each(function(i, tr) {
                    tr = $(tr);
                    if (tr.find(".fileRemove").html().trim() == "") {
                        fileTr = tr;
                        return false;
                    }
                })
                if (fileTr) {
                    if (type == "success") {
                        fileTr.find(".fileStatus").html(successHTML)
                    }else if(type == "cancel"){
                        fileTr.find(".fileStatus").html(
                            ``
                        )
                        fileTr.find(".fileMsg").html(``)
                    } else {
                        fileTr.find(".fileStatus").html(
                            `<div class="text-danger"><i class="fas fa-exclamation-circle mr-2"></i>${msg}</div>`
                        )
                        fileTr.find(".fileMsg").html(``)
                    }

                    fileTr.find(".fileRemove").html(removeHTML);
                }

                // executeProject("running");

            }
        }

        function nextFn() {
            let fileTr = null;
            let trs = $(`#${globalData.containerId}`).find(`.folderList tr`); // trs
            trs.each(function(i, tr) {
                tr = $(tr);
                if (tr.find(".fileStatus").html().trim() == "") {
                    fileTr = tr;
                    return false;
                }
            })

            if (!fileTr) {
                logger.info("All projects handle over!");
                stop();
                return false;
            }
            // show loading status
            fileTr.find(".fileRemove").html('');
            fileTr.find(".fileStatus").html(runningHTML);
            return fileTr.find(".filePath").html();
        }

        /**
         * @param {Object} runType start: start execute, queue execute
         */
        function executeProject() {

            // var projectPath = nextFn();
            // if (projectPath) {
            //     logFn(projectPath);
            //     logger.info("Project: " + projectPath);
                // Run Commands
                gkeExecutor.start({
                    projectId: $('#projectId').val(),
                    clusterName: $('#clusterName').val(),
                    gcloudPath: $('#gcloudPath').html(),
                    kubectlPath: $('#kubectlPath').html(),
                    path: ""
                }, logFn, statusFn, nextFn);
            // }
        }

        let autoCreateCluster = $('#autoCreate')[0].checked;
        
        if (autoCreateCluster) {
            logger.info('Auto Create Cluster');
            let configFormArr = $('#configForm').serializeArray()
            let configData = {};

            for (let formItem of configFormArr) {
                configData[formItem.name] = formItem.value;
            }
            configData.autoScaling = $('#autoScaling')[0].checked;
            gkeExecutor.createCluster(configData);
        }
        executeProject();
    }

    function stop() {
        gkeExecutor.stop();

        globalData.running = false;
        btnToggle();
        let trs = $(`#${globalData.containerId}`).find(`.folderList tr`); // trs
        let fileTr = null;
        trs.each(function(i, tr) {
            tr = $(tr);
            if (tr.find(".fileRemove").html().trim() == "") {
                fileTr = tr;
                fileTr.find(".fileStatus").html('')
                fileTr.find(".fileRemove").html(removeHTML);
                // return false;
            }
        })

        if (!fileTr) {
            console.log("All projects handle over!");
            return;
        }


    }

})
