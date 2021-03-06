// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')

var mainWindow;
// const dev_mode = true;
const dev_mode = false;
if (!dev_mode) {
    Menu.setApplicationMenu(null)
}

app.allowRendererProcessReuse=false;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // width: 800,
    // height: 600,
    show:false,
    icon:'imgs/googlecloudplatform.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
      ,nodeIntegration: true
      ,enableRemoteModule:true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  if (dev_mode) {
      mainWindow.webContents.openDevTools()
  }
  
  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
  })
  
  mainWindow.maximize();
  mainWindow.show();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow) ;

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (BrowserWindow.getAllWindows().length === 0) createWindow()
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
