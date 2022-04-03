/* eslint-disable no-unused-vars */
// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { startNode } = require("./libp2p");
const os = require("os");
const fs = require("fs");
const appDir = path.resolve(os.homedir(), ".DeCloud");
const hidefile = require("hidefile");

const createAppDirectory = () => {
  if (!fs.existsSync(appDir)) {
    fs.mkdir(appDir, (err) => {
      if (err) {
        throw err;
      }
      hidefile.hideSync(appDir);
      fs.mkdir(path.join(appDir, "files"));
    });
  }
};

createAppDirectory();

// Create the native browser window.
function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.maximize();

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? new URL(`file:${path.join(__dirname, "index.html")}`).toString()
    : "http://localhost:3000";

  mainWindow.loadURL(appURL);

  startNode(mainWindow);

  // Automatically open Chrome's DevTools in development mode.
  // if (!app.isPackaged) {
  //   mainWindow.webContents.openDevTools();
  // }
}

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
// function setupLocalFilesNormalizerProxy() {
//   protocol.registerHttpProtocol(
//     "file",
//     (request, callback) => {
//       const url = request.url.substr(8);
//       callback({ path: path.normalize(`${__dirname}/${url}`) });
//     },
//     (error) => {
//       if (error) console.error("Failed to register protocol");
//     }
//   );
// }

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  createWindow();
  // setupLocalFilesNormalizerProxy();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
// const allowedNavigationDestinations = "https://my-app.com";
// app.on("web-contents-created", (event, contents) => {
//   contents.on("will-navigate", (event, navigationURL) => {
//     const parsedURL = new URL(navigationURL);
//     if (!allowedNavigationDestinations.includes(parsedURL.origin)) {
//       event.preventDefault();
//     }
//   });
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
