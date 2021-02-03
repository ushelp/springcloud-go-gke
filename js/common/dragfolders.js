(function() {
    const fs = require('fs-extra');
    const common = require('../js/common/common.js');
    
    
    // Drag folders
    function dragCall() {
        return false;
    }
    var containerHolders = document.querySelectorAll(".mycontainer");
    containerHolders.forEach(function(containerHolder) {
        containerHolder.ondragover = containerHolder.ondragover = containerHolder.ondragend = dragCall;
        var containerId = containerHolder.id;
        globalData.containerId = containerHolder.id;
    
        containerHolder.ondrop = (e) => {
            e.preventDefault()
            
            var files=e.dataTransfer.files;
            var folders=[];
             // Project directory check
            for (let f of files) {
                var filepath = f.path;
                // Project directory check
                if (fs.statSync(filepath).isDirectory()) {
                    folders.push(f);
                }
           }
            
            globalData.showFiles(folders);
            globalData.totalRefresh();
            return false;
        }
    
    });
    

    

    $('.mycontainer').on('dblclick', '.remove-icon', function() {
        if (globalData.removeConfirm) {
            if (!confirm('remove project?')) {
                return false;
            }
        }
    
        var c = $(this).parent().parent(); // tr
        var filepath = c.find(".filePath").text();
        if (globalData.foldersRecord[filepath]) {
            delete globalData.foldersRecord[filepath];
        }
        common.removeAllItemFromArr(globalData.folders, "", function(f){
            return f.path==filepath;
        })
        
        c.remove();
        if ($('.folderList').children().length == 0) {
            $('.dndArea').show();
            $('.footer').hide();
        }
        globalData.totalRefresh();
    })
    
    
    

})()
