const electron = require('electron')
// Module to control application life.
const app = electron.app
const Menu = electron.Menu
const MenuItem = electron.MenuItem
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let setupWindow

// Enable this setting to avoid flicker during the creation of the window.
const prettyShow = true

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600, show: !prettyShow ,icon: 'icon.png'})
  setupWindow = new BrowserWindow({ width: 800, height: 600, show: !prettyShow ,icon:'icon.png'})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }))
  setupWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'setup_window/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    if (setupWindow != null){
        setupWindow.close();
    }
  })
  setupWindow.on('closed', () => {
    setupWindow = null
    if (mainWindow != null){
        mainWindow.close();
    }
  })

  mainWindow.setAutoHideMenuBar(true)

  // You can set the coordinates to be on a second screen and uncomment these
  // lines, so the app will automatically open there in fullscreen mode.
  // mainWindow.setBounds({ x: 2000, y: 500, width: 800, height: 600 })
  // mainWindow.setMenu(null)
  // mainWindow.setFullScreen(true)

  if (prettyShow) {
    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })
    setupWindow.once('ready-to-show', () => {
      setupWindow.show()
    })
  }
  const mainMenu= new Menu()
  mainMenu.append(new MenuItem({
	  label:"Adatbázis Frissítése(F5)",
	  click(){mainWindow.webContents.send('refreshdb')},
	  accelerator:"F5"
  }))
  mainMenu.append(new MenuItem({label:"Fullscreen on/off(F11)",role:"togglefullscreen"}))
  mainWindow.setMenu(mainMenu)
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
