# Spring Cloud go GKE

Easily convert your spring projects and migrate to GKE.

## Prerequisite
1. Install the `Cloud SDK`
2. Settings
    ```JS
    gcloud components update
    gcloud auth login
    ```                        


## Install
```
npm install
```

## Development

```
npm start
```

## Electron Builder

```
npm run dist
```

## Electron Packager

```
npm run packager
```


## Installation Help

- Yarn
```
yarn config set "strict-ssl" false 
yarn add electron-builder --save-dev
------ OR
npm install --save-dev electron-builder
```

- Electron Builder Windows Enviroment
```
https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.4.0/winCodeSign-2.4.0.7z
https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.3.2/nsis-3.0.3.2.7z
https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-resources-3.3.0/nsis-resources-3.3.0.7z

C:\Users\XXX\AppData\Local\electron-builder\Cache\winCodeSign\winCodeSign-2.4.0
C:\Users\XXX\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.3.2
C:\Users\XXX\AppData\Local\electron-builder\Cache\nsis\nsis-resources-3.3.0
```