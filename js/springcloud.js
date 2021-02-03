$(function() {
    const Logger = require('../js/common/logger.js');
    var logger = Logger.initLogger('SpringCloud')
    const common = require('../js/common/common.js');
    const init = require('../js/common/init.js')
    const springExecutor = require('../js/executor/springExecutor.js');

    const {
        dialog
    } = require('electron').remote;


    var configServerArtifactId = null;
    var configServerProjectPath = null;

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



    var serviceTypeHTML =
        `
     <input type="checkbox" class="form-check-input" name="serviceType">
        <label class="form-check-label">External service</label>
    `;



    function initForm() {
        $('#projectIdLoading').show();
        init.getProjectId(function(projectId) {
            $('#projectId').val(projectId);
            $('#projectIdLoading').hide();
        });
    }
    initForm();

    // Refresh
    $('.refreshBtn').on('click', function() {
        $('.folderList').children().remove();

        $('#runlog').html('');

        globalData.folders = [];
        globalData.foldersRecord = {};
        globalData.running = false;

        globalData.totalRefresh();
        $('.dndArea').show();
        $('.footer').hide();
        btnToggle('init');
    });

    $('.chooseFolder').on('click', function() {
        dialog.showOpenDialog({
            title: "Chosse your output folder: ",
            properties: ['openDirectory', 'createDirectory']
        }).then(result => {
            if (result.canceled) {} else {
                $('[name="output"]').val(result.filePaths[0]);
            }

        }).catch(err => {
            layer.msg(err)
        })
    });

    // Start
    var t;
    $('.startBtn').on('click', start);

    // Stop
    $('.stopBtn').on('click', stop);


    // Show projects
    globalData.showFiles = function(files) {
        var id = globalData.containerId.replace("Container", "");
        var container = $(`#${globalData.containerId}`);
        var replicas = $('#replicas').val();

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
                  <td class="fileReplicas">
                        <div class="input-group">
                          <div class="input-group-prepend">
                            <div class="input-group-text">Replicas</div>
                          </div>
                          <input type="number" min="1" name="replicas" class="form-control"  value="${replicas}" style="width:30px"/>
                        </div>
                  </td>
                  <td class="fileServiceType pt-3">${serviceTypeHTML}</td>
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


    function stop() {
        if (t) {
            clearTimeout(t);
        }
        globalData.running = false;
        btnToggle();
        let trs = $(`#${globalData.containerId}`).find(`.folderList tr`); // trs
        let fileTr = null;
        trs.each(function(i, tr) {
            tr = $(tr);
            if (tr.find(".fileRemove").html().trim() == "") {
                fileTr = tr;
                return false;
            }
        })

        if (!fileTr) {
            console.log("All projects handle over!");
            return;
        }

        fileTr.find(".fileStatus").html('')
        fileTr.find(".fileRemove").html(removeHTML);

    }

    function formValidate() {
        let res = true;
        if (!$('[name="output"]').val()) {
            layer.msg("Please choose output folder first.");
            // alert("Please choose output folder first.");
            $('[name="output"]')[0].focus();
            res = false;
        }

        return res;
    }

    function start() {

        let validate = formValidate();

        if (!validate) {
            return;
        }

        globalData.running = true;
        btnToggle();



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
                layer.msg("All projects convert finish.")
                stop();
                return false;
            }

            // show loading status
            fileTr.find(".fileRemove").html('');
            fileTr.find(".fileStatus").html(runningHTML);

            return {
                projectPath: fileTr.find(".filePath").html(),
                replicas: fileTr.find("[name='replicas']").val(),
                serviceType: fileTr.find("[name='serviceType']")[0].checked
            };
        }

        function executeProject() {
            var projectInfo = nextFn();
            if (projectInfo) {
                logger.info("Project: " + projectInfo);
                // Run Commands
                springExecutor.start({
                    projectId: $('#projectId').val(),
                    outputFolder: $('[name="output"]').val(),
                    configServer: configServerArtifactId,
                    configServerProjectPath: configServerProjectPath,
                    // Variable for each item
                    path: projectInfo.projectPath,
                    replicas: projectInfo.replicas,
                    serviceType: projectInfo.serviceType
                }, statusFn, nextFn);
            }
        }


        function getConfigServerProject() {
            configServerArtifactId = null;
            configServerPath = null;

            let filePathTds = $(`#${globalData.containerId}`).find(`.folderList tr .filePath`);
            let filePaths = [];
            filePathTds.each(function() {
                filePaths.push(this.innerHTML)
            })

            springExecutor.getConfigServer(filePaths).then((value) => {
                if (value) {
                    configServerArtifactId = value.appName;
                    configServerProjectPath = value.projectPath;
                    // Move configServer project to first
                    var allfilePathTd = $(`#${globalData.containerId}`).find(
                        '.folderList tr .filePath');
                    allfilePathTd.each(function() {
                        if (value.projectPath == this.innerHTML) {
                            var configServerTr = $(this).parent();
                            configServerTr.remove();
                            $(`#${globalData.containerId}`).find('.folderList').prepend(
                                configServerTr);
                        }
                    })
                }
                executeProject();
            }).catch((err) => {
                console.error(err);
            });
        }
        getConfigServerProject();
        //

    }

})
