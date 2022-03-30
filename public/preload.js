const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ["filepath", "logging"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  listen: (channel, handler) => {
    let validChannels = ["file-sent-successfully"];
    if (validChannels.includes(channel)) {
      // In case useEffect call listen multiple times
      ipcRenderer.removeAllListeners(channel);

      ipcRenderer.addListener(channel, handler);
    }
  },
});
