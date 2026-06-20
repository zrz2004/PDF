const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggleMaximize'),
  close: () => ipcRenderer.invoke('window:close'),
  pickFiles: (extensions) => ipcRenderer.invoke('dialog:pickFiles', extensions),
  pickDirectory: () => ipcRenderer.invoke('dialog:pickDirectory'),
  pickExecutable: (engineId) => ipcRenderer.invoke('dialog:pickExecutable', engineId),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  startConversion: (request) => ipcRenderer.invoke('conversion:start', request),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  detectEngines: () => ipcRenderer.invoke('engines:detect'),
  testEngine: (engineId) => ipcRenderer.invoke('engines:test', engineId),
  openPath: (path) => ipcRenderer.invoke('shell:openPath', path),
  appPaths: () => ipcRenderer.invoke('app:paths'),
  readImageAsDataUrl: (filePath) => ipcRenderer.invoke('preview:readImage', filePath),
  renderPdfPage: (filePath, pageNumber) => ipcRenderer.invoke('preview:renderPdfPage', filePath, pageNumber),
  getPdfInfo: (filePath) => ipcRenderer.invoke('preview:pdfInfo', filePath),
  platform: process.platform,
})
