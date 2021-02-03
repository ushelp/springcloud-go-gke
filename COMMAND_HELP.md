# Command Help

- [Prerequisite](#prerequisite)
- [Init Project](#init-project)
- [GKE deployment](#gke-deployment)
  * [1. Create a GKE cluster with Istio enabled](#1-create-a-gke-cluster-with-istio-enabled)
    + [Parameters](#parameters)
  * [2. Get cluster credentials](#2-get-cluster-credentials)
  * [3. Build a application](#3-build-a-application)
  * [4. Deploy an application](#4-deploy-an-application)
  * [5. Create a service](#5-create-a-service)
  * [6. Clear](#6-clear)
  * [Others](#others)

## Prerequisite
1. Install the `Cloud SDK`
2. Settings
    ```JS
    gcloud components update
    gcloud auth login
    ```                        

## Init Project 
```JS
gcloud config set project [YOUR_PROJECT_ID]
gcloud config get-value project
```

## GKE deployment

### 1. Create a GKE cluster with Istio enabled

```JS
gcloud beta container clusters 
create "[CLUSTER_NAME]" 
--scopes "https://www.googleapis.com/auth/cloud-platform" 
--addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS  
--istio-config auth=MTLS_PERMISSIVE  
--num-nodes=3 | --enable-autoscaling --min-nodes=1 --max-nodes=3 
--machine-type=custom-2-2048 
--disk-size=10G 
--disk-type=pd-standard
```

**Parameters**

```JS
YOUR_CLUSTER_NAME
--num-nodes=3 | --max-nodes=1, --minimum-nodes=3
--machine-type=custom-2-2048    // custom-CPU-MEMORY. CPU(2-32),  Memory(1-16G) must be a multiple of 256MB
--disk-size=10G                 // 100G
--disk-type=pd-standard         // pd-standard, pd-ssd
--region=REGION 
--zone=ZONE
```

- Default

    ```JS
    gcloud beta container clusters create "test-cluster" --scopes "https://www.googleapis.com/auth/cloud-platform" --addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS  --istio-config auth=MTLS_PERMISSIVE
    ```

- FixedNumNodes

    ```JS
    gcloud beta container clusters create "test-cluster" --scopes "https://www.googleapis.com/auth/cloud-platform" --num-nodes=2 --addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS  --istio-config auth=MTLS_PERMISSIVE  --machine-type=custom-2-3072 --disk-size=10G --disk-type=pd-standard  
    ```

- AutoScaling

    ```JS
    gcloud beta container clusters create "test-cluster" --scopes "https://www.googleapis.com/auth/cloud-platform" --min-nodes=1 --max-nodes=3 --enable-autoscaling --addons HorizontalPodAutoscaling,HttpLoadBalancing,Istio,NodeLocalDNS  --istio-config auth=MTLS_PERMISSIVE  --machine-type=custom-2-2048 --disk-size=10G --disk-type=pd-standard  
    ```





### 2. Get cluster credentials

```JS
// gcloud container clusters get-credentials [YOUR_CLUSTER_NAME]
gcloud container clusters get-credentials test-cluster
```

### 3. Build a application

```JS
// gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/[IMAGE_NAME]:[IMAGE_VERSION]
gcloud builds submit --tag gcr.io/test-project-id-100/gcp-provider:0.0.1-SNAPSHOT
gcloud builds submit --tag gcr.io/test-project-id-100/gcp-consumer-resttemplate:0.0.1-SNAPSHOT
gcloud builds submit --tag gcr.io/test-project-id-100/gcp-consumer-feign:0.0.1-SNAPSHOT
```


### 4. Deploy an application

```JS
kubectl apply -f deployment/recreate/deployment.yaml
```

- Rollout status

    ```JS
    // kubectl rollout status deploy [YOUR_APP]
    kubectl rollout status deploy gcp-provider
    kubectl rollout status deploy gcp-consumer-resttemplate
    kubectl rollout status deploy gcp-consumer-feign
    ```

### 5. Create a service

```JS
// type: LoadBalancer | ClusterIP
kubectl apply -f deployment/recreate/service.yaml
```

- Get IP

    ```JS
    //  kubectl get svc/[YOUR_SERVICE] -w
    kubectl get svc/gcp-provider -w
    kubectl get svc/gcp-consumer-resttemplate -w
    kubectl get svc/gcp-consumer-feign -w
    ```


### 6. Clear

- Delete deployments and services

    ```JS
    kubectl delete -f deployment/recreate/ --ignore-not-found
    ```

- Delete GKE cluster

    ```JS
    //gcloud container clusters delete [CLUSTER] --zone [ZONE] –async
    gcloud container clusters delete “test-cluster” --zone "asia-east1-c" --async
    ```

- Delete the image in Container Registry:
    
    ```JS
    // gcloud container images delete gcr.io/[PROJECT_ID]/[IMAGE]
    gcloud container images delete gcr.io/project-id/helloworld-gke
    ```

    ```JS
    gcloud container images list-tags gcr.io/[PROJECT]/app \
        --format 'value(digest)' | \
        xargs -I {} gcloud container images delete \
        --force-delete-tags --quiet \
        gcr.io/${PROJECT}/app@sha256:{}
    ```

- Delete downloaded code, artifacts, and other dependencies:



### Others

- Get

    ```
    gcloud container clusters list --format json(name)
    kubectl get pods
    kubectl get deployments
    kubectl get services
    ```

- DNS Test

    ```JS
    kubectl get svc -n kube-system kube-dns
    kubectl exec -it gcp-consumer-feign-dddf89599-cv2vf -- ping gcp-provider
    kubectl exec -it gcp-consumer-feign-dddf89599-cv2vf -- wget -q -O - http://gcp-provider/users
    kubectl exec -it gcp-consumer-resttemplate-68bd6dc9bd-6lvwx  -- cat /etc/resolv.conf
    kubectl get pods -n kube-system -o wide | grep node-local-dns
    kubectl exec -i -t gcp-consumer-resttemplate-68bd6dc9bd-6lvwx   -- nslookup kubernetes.default
    ```


- Information

    ```JS
    gcloud compute machine-types list
    ```


- References

    - Check that the Stackdriver Monitoring API is enabled.

        ```
        https://console.cloud.google.com/apis/library/monitoring.googleapis.com/
        ```
    
    - Check that the Stackdriver Logging API is enabled.

        ```
        https://console.cloud.google.com/apis/library/logging.googleapis.com/?q=logging
        ```
    
    - Enable the Stackdriver Trace API

        ```
        https://console.cloud.google.com/apis/api/cloudtrace.googleapis.com/overview
        ```

