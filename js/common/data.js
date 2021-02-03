const init = require('../js/common/init.js')

var globalData = {
    formData:{
        replicas:3
    },
    containerId:"" ,// springcloud, gke
    // config
    folders:[],
    foldersRecord:{},
    removeConfirm: false,
    running: false,
    totalRefresh:function() {
        $(`.total`).text($(`.folderList`).children().length);
    },
    gcp:{}
};

globalData.gcp.regionList=[
    'asia-east1',
    'asia-east2',
    'asia-northeast1',
    'asia-northeast2',
    'asia-northeast3',
    'asia-south1',
    'asia-southeast1',
    'asia-southeast2',
    'australia-southeast1',
    'europe-north1',
    'europe-west1',
    'europe-west2',
    'europe-west3',
    'europe-west4',
    'europe-west6',
    'northamerica-northeast1',
    'southamerica-east1',
    'us-central1',
    'us-east1',
    'us-east4',
    'us-west1',
    'us-west2',
    'us-west3',
    'us-west4'
];


globalData.gcp.zoneList=[
    'us-east1-b',
    'us-east1-c',
    'us-east1-d',
    'us-east4-c',
    'us-east4-b',
    'us-east4-a',
    'us-central1-c',
    'us-central1-a',
    'us-central1-f',
    'us-central1-b',
    'us-west1-b',
    'us-west1-c',
    'us-west1-a',
    'europe-west4-a',
    'europe-west4-b',
    'europe-west4-c',
    'europe-west1-b',
    'europe-west1-d',
    'europe-west1-c',
    'europe-west3-c',
    'europe-west3-a',
    'europe-west3-b',
    'europe-west2-c',
    'europe-west2-b',
    'europe-west2-a',
    'asia-east1-b',
    'asia-east1-a',
    'asia-east1-c',
    'asia-southeast1-b',
    'asia-southeast1-a',
    'asia-southeast1-c',
    'asia-northeast1-b',
    'asia-northeast1-c',
    'asia-northeast1-a',
    'asia-south1-c',
    'asia-south1-b',
    'asia-south1-a',
    'australia-southeast1-b',
    'australia-southeast1-c',
    'australia-southeast1-a',
    'southamerica-east1-b',
    'southamerica-east1-c',
    'southamerica-east1-a',
    'asia-east2-a',
    'asia-east2-b',
    'asia-east2-c',
    'asia-northeast2-a',
    'asia-northeast2-b',
    'asia-northeast2-c',
    'asia-northeast3-a',
    'asia-northeast3-b',
    'asia-northeast3-c',
    'asia-southeast2-a',
    'asia-southeast2-b',
    'asia-southeast2-c',
    'europe-north1-a',
    'europe-north1-b',
    'europe-north1-c',
    'europe-west6-a',
    'europe-west6-b',
    'europe-west6-c',
    'northamerica-northeast1-a',
    'northamerica-northeast1-b',
    'northamerica-northeast1-c',
    'us-west2-a',
    'us-west2-b',
    'us-west2-c',
    'us-west3-a',
    'us-west3-b',
    'us-west3-c',
    'us-west4-a',
    'us-west4-b',
    'us-west4-c'
];

;(function(){
    function initGlobalData(){
        // formdata
        for(var domId in globalData.formData){
            var formEle=document.querySelector("#"+domId);
            if(formEle){
                formEle.value=globalData.formData[domId];
            }
        }
    }
    
    initGlobalData();
})();