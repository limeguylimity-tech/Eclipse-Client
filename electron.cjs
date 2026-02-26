const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const { Client, Authenticator } = require('minecraft-launcher-core');
const ModLoaderManager = require('./lib/ModLoaderManager.cjs');
const MicrosoftAuth = require('./lib/MicrosoftAuth.cjs');

const isDev = !app.isPackaged;
const configPath = path.join(app.getPath('userData'), 'voyager_config.json');
const authTokenPath = path.join(app.getPath('userData'), 'ms_auth_tokens.json');

/**
 * Returns the default .minecraft root path for the current OS.
 * On Linux: ~/.minecraft
 * On macOS: ~/Library/Application Support/minecraft
 * On Windows: %APPDATA%\.minecraft
 *
 * NOTE: Do NOT use app.getPath('appData') for this — on Linux it returns
 *       ~/.config which is WRONG for Minecraft.
 */
function getDefaultMcRoot() {
    const home = process.env.HOME || process.env.USERPROFILE;
    if (process.platform === 'win32') {
        return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), '.minecraft');
    } else if (process.platform === 'darwin') {
        return path.join(home, 'Library', 'Application Support', 'minecraft');
    } else {
        return path.join(home, '.minecraft');
    }
}

let win;
let msAuth; // Initialized after app.getPath is available

// --- Single Instance Lock ---
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });

    function createWindow() {
        win = new BrowserWindow({
            width: 1280,
            height: 720,
            frame: false,
            transparent: true,
            backgroundColor: '#00000000',
            webPreferences: {
                preload: path.join(__dirname, 'preload.cjs'),
                nodeIntegration: false,
                contextIsolation: true,
                webviewTag: true
            },
        });

        const distPath = path.join(__dirname, 'dist', 'index.html');
        if (fs.existsSync(distPath)) {
            win.loadFile(distPath);
        } else if (isDev) {
            win.loadURL('http://localhost:5173').catch(e => console.error('Failed to load URL:', e));
        } else {
            win.loadFile(distPath);
        }

        ipcMain.on('window-control', (event, action) => {
            if (!win) return;
            if (action === 'minimize') win.minimize();
            if (action === 'maximize') win.isMaximized() ? win.unmaximize() : win.maximize();
            if (action === 'toggle-fullscreen') win.setFullScreen(!win.isFullScreen());
            if (action === 'close') win.close();
        });

        // --- Config Persistence ---
        ipcMain.handle('save-config', async (event, data) => {
            fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
            return true;
        });

        ipcMain.handle('open-external', async (event, url) => {
            shell.openExternal(url);
            return true;
        });

        ipcMain.handle('load-config', async () => {
            if (fs.existsSync(configPath)) {
                return JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
            return null;
        });

        ipcMain.handle('select-folder', async () => {
            const result = await dialog.showOpenDialog(win, {
                properties: ['openDirectory'],
                title: 'SELECT MINECRAFT DIRECTORY (.minecraft)'
            });
            return result.filePaths[0];
        });

        ipcMain.handle('open-path', async (event, folderPath) => {
            if (fs.existsSync(folderPath)) {
                shell.openPath(folderPath);
                return true;
            }
            return false;
        });

        ipcMain.handle('auto-locate-mc', async () => {
            // Primary: use the same logic as getDefaultMcRoot()
            const primary = getDefaultMcRoot();
            if (fs.existsSync(primary)) return primary;

            // Fallback: check Flatpak/Snap paths on Linux
            if (process.platform === 'linux') {
                const home = process.env.HOME;
                const fallbacks = [
                    path.join(home, '.var', 'app', 'com.mojang.Minecraft', '.minecraft'),
                    path.join(home, 'snap', 'mc-installer', 'current', '.minecraft')
                ];
                for (const p of fallbacks) {
                    if (fs.existsSync(p)) return p;
                }
            }
            return null;
        });

        ipcMain.handle('get-mods', async (event, mcPath, profileName) => {
            const rootPath = mcPath || getDefaultMcRoot();
            if (!profileName) return [];
            const safeProfileName = profileName.replace(/[^a-z0-9]/gi, '_');
            const modsFolder = path.join(rootPath, 'instances', safeProfileName, 'mods');

            if (!fs.existsSync(modsFolder)) return [];
            return fs.readdirSync(modsFolder).filter(f => f.endsWith('.jar') || f.endsWith('.zip')).map(f => ({
                name: f,
                path: path.join(modsFolder, f),
                size: fs.statSync(path.join(modsFolder, f)).size
            }));
        });

        ipcMain.handle('delete-mod', async (event, modPath) => {
            if (fs.existsSync(modPath)) {
                fs.unlinkSync(modPath);
                return true;
            }
            return false;
        });

        // --- Version Manifest Engine ---
        ipcMain.handle('get-mc-versions', async () => {
            return new Promise((resolve, reject) => {
                https.get('https://piston-meta.mojang.com/mc/game/version_manifest_v2.json', (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => resolve(JSON.parse(data)));
                }).on('error', (err) => reject(err));
            });
        });

        // --- Modrinth Downloader ---
        ipcMain.handle('download-mod', async (event, { url, fileName, mcPath }) => {
            const modsFolder = path.join(mcPath, 'mods');
            if (!fs.existsSync(modsFolder)) fs.mkdirSync(modsFolder, { recursive: true });

            const filePath = path.join(modsFolder, fileName);
            const file = fs.createWriteStream(filePath);

            try {
                const response = await axios({ url, method: 'GET', responseType: 'stream' });
                response.data.pipe(file);

                return new Promise((resolve, reject) => {
                    file.on('finish', () => {
                        file.close();
                        resolve({ success: true, path: filePath });
                    });
                    file.on('error', (err) => {
                        fs.unlink(filePath, () => { });
                        reject(err);
                    });
                });
            } catch (err) {
                fs.unlink(filePath, () => { });
                throw err;
            }
        });
        ipcMain.handle('get-loader-versions', async (event, { loader, mcVersion }) => {
            const manager = new ModLoaderManager(getDefaultMcRoot());
            return await manager.getVersions(loader, mcVersion);
        });

        // ── BUG 1 FIX: Microsoft Authentication IPC Handlers ──

        // Interactive Microsoft login — opens a real MS login window
        ipcMain.handle('microsoft-login', async () => {
            try {
                if (!msAuth) msAuth = new MicrosoftAuth(authTokenPath);
                const authObj = await msAuth.login(win);
                return {
                    success: true,
                    username: authObj.name,
                    uuid: authObj.uuid,
                    xuid: authObj.meta?.xuid || ''
                };
            } catch (e) {
                console.error('[MS_AUTH] Login failed:', e.message);
                return { success: false, error: e.message };
            }
        });

        // Silent token refresh — try to restore session without user interaction
        ipcMain.handle('microsoft-refresh', async () => {
            try {
                if (!msAuth) msAuth = new MicrosoftAuth(authTokenPath);
                const authObj = await msAuth.tryRefresh();
                if (authObj) {
                    return {
                        success: true,
                        username: authObj.name,
                        uuid: authObj.uuid,
                        xuid: authObj.meta?.xuid || ''
                    };
                }
                return { success: false, error: 'NO_STORED_TOKENS' };
            } catch (e) {
                return { success: false, error: e.message };
            }
        });

        // Sign out — clear all stored tokens
        ipcMain.handle('microsoft-logout', async () => {
            if (!msAuth) msAuth = new MicrosoftAuth(authTokenPath);
            msAuth.clearTokens();
            return { success: true };
        });

        // Get stored user info (username, UUID) without full auth
        ipcMain.handle('get-stored-user', async () => {
            if (!msAuth) msAuth = new MicrosoftAuth(authTokenPath);
            const info = msAuth.getStoredUserInfo();
            if (info) return { success: true, ...info };
            return { success: false };
        });

        // ── BUG 3 FIX: In-Launcher Minecraft Version Installer ──
        ipcMain.handle('install-version', async (event, { mcVersion, loader, loaderVersion }) => {
            const root = getDefaultMcRoot();
            const manager = new ModLoaderManager(root);

            try {
                // Step 1: Let MCLC handle downloading vanilla Minecraft
                // (client jar, libraries, assets) — it does this automatically on launch.
                // We just need to make sure the version directory exists.
                const versionDir = path.join(root, 'versions', mcVersion);
                if (!fs.existsSync(versionDir)) fs.mkdirSync(versionDir, { recursive: true });

                // Step 2: If a mod loader was selected, install it
                if (loader && loader !== 'vanilla' && loaderVersion) {
                    console.log(`[INSTALL] Installing ${loader} ${loaderVersion} for MC ${mcVersion}...`);
                    const result = await manager.prepareLoader(loader, mcVersion, loaderVersion);
                    console.log('[INSTALL] Loader installed:', result);
                    return { success: true, ...result };
                }

                return { success: true, message: 'VANILLA_READY' };
            } catch (e) {
                console.error('[INSTALL] Failed:', e.message);
                return { success: false, error: e.message };
            }
        });
    }

    ipcMain.handle('launch-game', async (event, options) => {
        const { version, username, mcPath, memory, profileName, loader, loaderVersion } = options;
        const root = mcPath || getDefaultMcRoot();

        const manager = new ModLoaderManager(root);

        // ── FIX 5: Ensure mods folder exists ──
        // Create both the global mods folder and the instance-specific mods folder
        const safeProfileName = profileName.replace(/[^a-z0-9]/gi, '_');
        const instancePath = path.join(root, 'instances', safeProfileName);
        const modsPath = path.join(instancePath, 'mods');
        const globalModsPath = path.join(root, 'mods');

        if (!fs.existsSync(modsPath)) fs.mkdirSync(modsPath, { recursive: true });
        if (!fs.existsSync(globalModsPath)) fs.mkdirSync(globalModsPath, { recursive: true });

        console.log(`[LAUNCH] Profile: ${profileName}, MC: ${version}, Loader: ${loader || 'vanilla'}, LoaderVer: ${loaderVersion || 'none'}`);
        console.log(`[LAUNCH] Root: ${root}`);
        console.log(`[LAUNCH] Instance: ${instancePath}`);
        console.log(`[LAUNCH] Mods folder: ${modsPath}`);
        console.log(`[LAUNCH] Mods in folder: ${fs.existsSync(modsPath) ? fs.readdirSync(modsPath).join(', ') : 'FOLDER_NOT_FOUND'}`);

        try {
            const launcher = new Client();

            // ── BUG 1 FIX: Use real Microsoft auth instead of offline/UUID auth ──
            // Try Microsoft auth first (real bearer token for multiplayer/skins/Realms)
            // Fall back to offline auth if MS auth is not available
            let auth;
            if (!msAuth) msAuth = new MicrosoftAuth(authTokenPath);

            try {
                auth = await msAuth.getAuth(win);
                console.log(`[LAUNCH] Authenticated via Microsoft as: ${auth.name}`);
            } catch (msErr) {
                console.warn(`[LAUNCH] Microsoft auth failed, falling back to offline: ${msErr.message}`);
                auth = await Authenticator.getAuth(username);
            }

            // ── FIX 4: Detect vanilla vs modded automatically ──
            const isModded = loader && loader !== 'vanilla' && loaderVersion;

            // Base options — these are always the same regardless of loader
            const opts = {
                clientPackage: null,
                authorization: auth,
                root: root,
                version: {
                    number: version,
                    type: 'release'
                },
                memory: {
                    max: memory,
                    min: '1G'
                },
                overrides: {
                    gameDirectory: instancePath,
                    cwd: instancePath
                }
            };

            if (isModded) {
                console.log(`[LAUNCH] Modded launch detected: ${loader} ${loaderVersion}`);

                // Step 1: Use ModLoaderManager to prepare/install the loader
                // This downloads the version JSON or installer
                const result = await manager.prepareLoader(loader, version, loaderVersion);

                if (result.forgeInstaller) {
                    // ── Forge/NeoForge path ──
                    // These use an installer JAR that minecraft-launcher-core 
                    // handles natively via the opts.forge property.
                    // MLC will run the installer, which creates the correct
                    // version folder with the right mainClass and libraries.
                    console.log(`[LAUNCH] Using Forge installer: ${result.forgeInstaller}`);
                    opts.forge = result.forgeInstaller;

                } else if (result.customId && result.jsonPath) {
                    // ── Fabric/Quilt/LiteLoader path ──
                    // These have a version JSON we downloaded. We need to
                    // read it and tell MLC to use the custom version.

                    console.log(`[LAUNCH] Using custom version JSON: ${result.jsonPath}`);

                    // ── FIX 1: Read the mod loader's mainClass from its JSON ──
                    // DO NOT hardcode net.minecraft.client.main.Main.
                    // The mod loader JSON contains the correct mainClass:
                    //   Fabric  → net.fabricmc.loader.impl.launch.knot.KnotClient
                    //   Quilt   → org.quiltmc.loader.impl.launch.knot.KnotClient
                    //   LiteLoader → net.minecraft.launchwrapper.Launch
                    const loaderJson = JSON.parse(fs.readFileSync(result.jsonPath, 'utf8'));
                    const loaderMainClass = loaderJson.mainClass;

                    console.log(`[LAUNCH] Loader mainClass: ${loaderMainClass}`);

                    // Tell MLC about the custom version folder
                    opts.version.custom = result.customId;

                    // ── FIX 1 continued: Override the mainClass ──
                    opts.overrides = opts.overrides || {};
                    opts.overrides.mainClass = loaderMainClass;

                    // ── FIX 2: Merge mod loader libraries into the classpath ──
                    // The loader JSON has a libraries[] array with all the 
                    // extra JARs needed (e.g. fabric-loader, intermediary, asm).
                    // We read them and pass them as extra library paths.
                    if (loaderJson.libraries && loaderJson.libraries.length > 0) {
                        const extraLibPaths = [];

                        for (const lib of loaderJson.libraries) {
                            // Each library has a "name" like "net.fabricmc:fabric-loader:0.15.3"
                            // and optionally a "url" for the Maven repo.
                            // The actual JAR path is derived from the Maven coordinate.
                            if (lib.name) {
                                const libPath = mavenToPath(lib.name);
                                const fullPath = path.join(root, 'libraries', libPath);

                                // Check if the library exists locally
                                if (fs.existsSync(fullPath)) {
                                    extraLibPaths.push(fullPath);
                                    console.log(`[LAUNCH] Library found: ${libPath}`);
                                } else {
                                    // Try to download it if we have a URL
                                    const url = lib.url ? `${lib.url}${libPath}` : null;
                                    if (url) {
                                        console.log(`[LAUNCH] Downloading library: ${libPath}`);
                                        try {
                                            const libDir = path.dirname(fullPath);
                                            if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });
                                            await manager.downloadFile(url, fullPath);
                                            extraLibPaths.push(fullPath);
                                        } catch (dlErr) {
                                            console.warn(`[LAUNCH] Failed to download library ${lib.name}: ${dlErr.message}`);
                                        }
                                    } else {
                                        console.warn(`[LAUNCH] Library not found and no URL: ${lib.name}`);
                                    }
                                }
                            }
                        }

                        // Pass extra libraries to MLC via the classpath override
                        if (extraLibPaths.length > 0) {
                            opts.overrides.libraryRoot = path.join(root, 'libraries');
                            // Add to custom args for classpath
                            opts.customLaunchArgs = opts.customLaunchArgs || [];
                        }
                    }

                    // ── FIX 3: Pass mod loader JVM arguments ──
                    // Some loaders (especially Forge/NeoForge) need specific JVM args
                    // like --add-modules, --add-opens, -Dfml.*, etc.
                    // Read them from the version JSON's arguments.jvm array.
                    if (loaderJson.arguments && loaderJson.arguments.jvm) {
                        const extraJvmArgs = [];

                        for (const arg of loaderJson.arguments.jvm) {
                            // Arguments can be strings or objects with rules
                            if (typeof arg === 'string') {
                                extraJvmArgs.push(arg);
                            } else if (arg.value) {
                                // Object-form arguments have { rules: [...], value: "..." }
                                // For simplicity, we include all values
                                if (Array.isArray(arg.value)) {
                                    extraJvmArgs.push(...arg.value);
                                } else {
                                    extraJvmArgs.push(arg.value);
                                }
                            }
                        }

                        if (extraJvmArgs.length > 0) {
                            opts.customArgs = extraJvmArgs;
                            console.log(`[LAUNCH] Extra JVM args: ${extraJvmArgs.join(' ')}`);
                        }
                    }
                }

            } else {
                // ── Vanilla launch ──
                // No loader selected, launch plain vanilla Minecraft.
                // minecraft-launcher-core handles this natively with
                // the correct mainClass (net.minecraft.client.main.Main)
                console.log(`[LAUNCH] Vanilla launch for MC ${version}`);
            }

            console.log(`[LAUNCH] Ignition sequence started for: ${profileName} (${version})`);
            launcher.launch(opts);

            // ── Console output capture (Bug 2 fix) ──
            launcher.on('debug', (e) => {
                if (win) win.webContents.send('mc-log', { type: 'debug', message: e });
            });
            launcher.on('data', (e) => {
                // Color-code based on log level detected in the output
                let type = 'info';
                if (e.includes('[ERROR]') || e.includes('Exception') || e.includes('FAILED')) type = 'error';
                else if (e.includes('[WARN]')) type = 'warn';
                else if (e.includes('[FATAL]') || e.includes('crash')) type = 'fatal';
                if (win) win.webContents.send('mc-log', { type, message: e.trim() });
            });
            launcher.on('progress', (e) => {
                if (win) win.webContents.send('mc-log', { type: 'debug', message: `[STAGING] ${e.type}: ${e.task}/${e.total}` });
            });
            launcher.on('close', (code) => {
                const type = code === 0 ? 'info' : 'fatal';
                if (win) win.webContents.send('mc-log', { type, message: `IGNITION_HALTED_CODE_${code}` });

                // If crash, try to read the crash report
                if (code !== 0) {
                    const crashDir = path.join(instancePath, 'crash-reports');
                    if (fs.existsSync(crashDir)) {
                        const reports = fs.readdirSync(crashDir).sort().reverse();
                        if (reports.length > 0) {
                            const latestCrash = fs.readFileSync(path.join(crashDir, reports[0]), 'utf8');
                            if (win) win.webContents.send('mc-log', {
                                type: 'fatal',
                                message: `--- CRASH REPORT ---\n${latestCrash.substring(0, 2000)}`
                            });
                        }
                    }
                }
            });

            return { success: true, message: 'IGNITION_INITIALIZED' };
        } catch (e) {
            console.error(`[LAUNCH_CRASH] ${e.message}`);
            console.error(e.stack);
            return { success: false, error: 'IGNITION_CRASH', message: e.message };
        }
    });

    /**
     * Converts a Maven coordinate (e.g. "net.fabricmc:fabric-loader:0.15.3")
     * into a relative file path (e.g. "net/fabricmc/fabric-loader/0.15.3/fabric-loader-0.15.3.jar")
     * This is how all Minecraft libraries are stored on disk.
     */
    function mavenToPath(mavenCoord) {
        const parts = mavenCoord.split(':');
        const groupPath = parts[0].replace(/\./g, '/');
        const artifactId = parts[1];
        const version = parts[2];
        // Handle classifier if present (e.g. "net.fabricmc:intermediary:1.20.1:v2")
        const classifier = parts[3] ? `-${parts[3]}` : '';
        return `${groupPath}/${artifactId}/${version}/${artifactId}-${version}${classifier}.jar`;
    }


    app.whenReady().then(createWindow);

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    });
}
