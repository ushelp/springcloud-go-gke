const util = require('util');
const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');


const Et = require('easytemplatejs');
const Logger = require('../common/logger.js');
var logger = Logger.initLogger('GKE');

const runCommand = require('../common/run-command.js');


var createCluserCommands = {
    // gcloud beta container clusters create "test-cluster" --zone "asia-east1-c" --scopes "https://www.googleapis.com/auth/cloud-platform" -addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS  --istio-config auth=MTLS_PERMISSIVE
    'default': 'gcloud beta container clusters create "{=clusterName}" --scopes "https://www.googleapis.com/auth/cloud-platform" -addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS  --istio-config auth=MTLS_PERMISSIVE',
    // gcloud beta container clusters create "test-cluster" --zone "asia-east1-c" --scopes "https://www.googleapis.com/auth/cloud-platform" --num-nodes=2 --addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS  --istio-config auth=MTLS_PERMISSIVE  --machine-type=custom-2-3072 --disk-size=10G --disk-type=pd-standard
    'fixedNodes': 'gcloud beta container clusters create "{=clusterName}"--scopes "https://www.googleapis.com/auth/cloud-platform" --addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS  --istio-config auth=MTLS_PERMISSIVE --zone "asia-east1-c" --num-nodes={=numNodes} --machine-type=custom-{=CPU}-{=memory} --disk-size={=diskSize} --disk-type={=diskType}',
    // gcloud beta container clusters create "test-cluster" --zone "asia-east1-c" --scopes "https://www.googleapis.com/auth/cloud-platform"--min-nodes=1 --max-nodes=3 --enable-autoscaling --addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS  --istio-config auth=MTLS_PERMISSIVE  --machine-type=custom-2-2048 --disk-size=10G --disk-type=pd-standard
    'autoScaling': 'gcloud beta container clusters create "{=clusterName}" --scopes "https://www.googleapis.com/auth/cloud-platform" --addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS --istio-config auth=MTLS_PERMISSIVE --zone "asia-east1-c" --enable-autoscaling --min-nodes={=minNodes} --max-nodes={=maxNodes} --machine-type=custom-{=CPU}-{=memory} --disk-size={=diskSize} --disk-type={=diskType}'
}


function getCreateClusterCmd(configData) {
    /*
    DEFAULT
    */
    let command =
        'gcloud beta container clusters create {=clusterName} --scopes https://www.googleapis.com/auth/cloud-platform --addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS --istio-config auth=MTLS_PERMISSIVE';

    command += ' --disk-type {=diskType}';

    if (configData.CPU != -1) {
        command += ' --machine-type custom-{=CPU}-{=memory}'
        if (configData.memory == -1) {
            // default `e2-medium`: 2 CPUs, 4GB memory
            configData.memory = 4;
        }
        configData.memory=configData.memory*1024;
    } else if (configData.memory != -1) {
        command += ' --machine-type custom-{=CPU}-{=memory}'
        if (configData.CPU == -1) {
            // default `e2-medium`: 2 CPUs, 4GB memory
            configData.CPU = 2;
        }
        configData.memory=configData.memory*1024;
    }

    if (configData.diskSize) {
        configData.diskSize=configData.diskSize+'GB';
        command += ' --disk-size {=diskSize}';
    }

    if (configData.autoScaling) {
        command += ' --enable-autoscaling  --min-nodes {=minNodes} --max-nodes {=maxNodes}';
        if (!configData.minNodes) {
            configData.minNodes = 1;
        }
        if (!configData.maxNodes) {
            configData.maxNodes = 3;
        }
    } else {
        if (configData.numNodes) {
            command += ' --num-nodes {=numNodes}';
        }
    }

    if (configData.locationType == 'zone' && configData.zone != -1) {
        command += ' --zone {=zone}';
    } else if (configData.locationType == 'region' && configData.region != -1) {
        command += ' --region {=region}';
    }

    let cmd = Et.template(command, configData);
    logger.info("Create GKE Cluster CMD: "+cmd);
    // Run Command`
    return cmd;
}

module.exports = {
    getCreateClusterCmd: getCreateClusterCmd
}
