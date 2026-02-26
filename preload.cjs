const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // Game launching
    launchGame: (options) => ipcRenderer.invoke('launch-game', options),

    // Window controls
    controlWindow: (action) => ipcRenderer.send('window-control', action),

    // File/folder operations
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    autoLocateMc: () => ipcRenderer.invoke('auto-locate-mc'),
    openPath: (p) => ipcRenderer.invoke('open-path', p),
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    // Config persistence
    saveConfig: (data) => ipcRenderer.invoke('save-config', data),
    loadConfig: () => ipcRenderer.invoke('load-config'),

    // Mod management
    downloadMod: (params) => ipcRenderer.invoke('download-mod', params),
    getMods: (mcPath, profileName) => ipcRenderer.invoke('get-mods', mcPath, profileName),
    deleteMod: (modPath) => ipcRenderer.invoke('delete-mod', modPath),

    // Version data
    getMcVersions: () => ipcRenderer.invoke('get-mc-versions'),
    getLoaderVersions: (params) => ipcRenderer.invoke('get-loader-versions', params),

    // ── BUG 1 FIX: Microsoft Authentication ──
    microsoftLogin: () => ipcRenderer.invoke('microsoft-login'),
    microsoftRefresh: () => ipcRenderer.invoke('microsoft-refresh'),
    microsoftLogout: () => ipcRenderer.invoke('microsoft-logout'),
    getStoredUser: () => ipcRenderer.invoke('get-stored-user'),

    // ── BUG 3 FIX: In-launcher version installer ──
    installVersion: (params) => ipcRenderer.invoke('install-version', params),

    // Console log listener
    onMcLog: (callback) => ipcRenderer.on('mc-log', (event, data) => callback(data))
});
