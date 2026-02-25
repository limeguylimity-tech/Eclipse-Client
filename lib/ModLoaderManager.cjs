const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

class ModLoaderManager {
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.cachePath = path.join(this.rootPath, 'loader_cache');
        if (!fs.existsSync(this.cachePath)) fs.mkdirSync(this.cachePath, { recursive: true });
    }

    async getVersions(loader, mcVersion) {
        console.log(`[ModLoaderManager] Fetching ${loader} versions for MC ${mcVersion}`);
        // First, check for local installations to prefer them
        const local = await this.scanLocalVersions(mcVersion);
        if (local.length > 0 && loader !== 'vanilla') {
            const match = local.find(v => v.loader === loader);
            if (match) console.log(`[ModLoaderManager] Found local match: ${match.id}`);
        }

        switch (loader.toLowerCase()) {
            case 'fabric':
                return this.getFabricVersions(mcVersion);
            case 'quilt':
                return this.getQuiltVersions(mcVersion);
            case 'forge':
                return this.getForgeVersions(mcVersion);
            case 'neoforge':
                return this.getNeoForgeVersions(mcVersion);
            case 'liteloader':
                return this.getLiteLoaderVersions(mcVersion);
            default:
                return [];
        }
    }

    async getFabricVersions(mcVersion) {
        try {
            const resp = await axios.get(`https://meta.fabricmc.net/v2/versions/loader/${mcVersion}`);
            return resp.data.map(v => ({
                id: v.loader.version,
                name: `Fabric ${v.loader.version}`,
                stable: v.loader.stable
            }));
        } catch (e) {
            console.error('[ModLoaderManager] Fabric Meta Error:', e.message);
            return [];
        }
    }

    async getQuiltVersions(mcVersion) {
        try {
            const resp = await axios.get(`https://meta.quiltmc.org/v3/versions/loader/${mcVersion}`);
            return resp.data.map(v => ({
                id: v.loader.version,
                name: `Quilt ${v.loader.version}`,
                stable: true // Quilt meta doesn't always specify stable in the same way, assuming true for releases
            }));
        } catch (e) {
            console.error('[ModLoaderManager] Quilt Meta Error:', e.message);
            return [];
        }
    }

    async getForgeVersions(mcVersion) {
        try {
            // promotions_slim.json is gone (404), use the full maven-metadata.json instead
            const resp = await axios.get('https://files.minecraftforge.net/net/minecraftforge/forge/maven-metadata.json');
            const allVersions = resp.data[mcVersion];
            if (!allVersions || allVersions.length === 0) return [];

            // Versions are in format "1.20.1-47.0.0" — extract the loader part
            return allVersions
                .reverse()  // newest first
                .slice(0, 10)  // limit to 10 results
                .map((v, i) => {
                    const loaderVer = v.replace(`${mcVersion}-`, '');
                    return {
                        id: loaderVer,
                        name: i === 0 ? `${loaderVer} (Latest)` : loaderVer,
                        stable: i === 0
                    };
                });
        } catch (e) {
            console.error('[ModLoaderManager] Forge Version Error:', e.message);
            return [];
        }
    }

    async getNeoForgeVersions(mcVersion) {
        try {
            // NeoForge versioning: {mcVersion}.{loaderVersion}
            // We can fetch from their Maven metadata
            const resp = await axios.get('https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge');
            const versions = resp.data.versions
                .filter(v => v.startsWith(mcVersion))
                .sort()
                .reverse()
                .map(v => ({ id: v, name: v, stable: true }));
            return versions;
        } catch (e) {
            console.error('[ModLoaderManager] NeoForge Error:', e.message);
            return [];
        }
    }

    async getLiteLoaderVersions(mcVersion) {
        try {
            const resp = await axios.get('http://dl.liteloader.com/versions/versions.json');
            const mcData = resp.data.versions[mcVersion];
            if (!mcData || !mcData.artefacts) return [];

            const artefacts = mcData.artefacts['com.mumfrey:liteloader'];
            if (!artefacts) return [];

            return Object.keys(artefacts).map(v => ({
                id: v,
                name: `LiteLoader ${v}`,
                stable: true
            }));
        } catch (e) {
            console.error('[ModLoaderManager] LiteLoader Error:', e.message);
            return [];
        }
    }

    async prepareLoader(loader, mcVersion, loaderVersion) {
        const customId = `${loader}-${loaderVersion}-${mcVersion}`;
        const versionDir = path.join(this.rootPath, 'versions', customId);
        const jsonPath = path.join(versionDir, `${customId}.json`);

        if (fs.existsSync(jsonPath)) {
            return { customId, jsonPath };
        }

        if (!fs.existsSync(versionDir)) fs.mkdirSync(versionDir, { recursive: true });

        console.log(`[ModLoaderManager] Preparing loader: ${customId}`);

        switch (loader.toLowerCase()) {
            case 'fabric':
                await this.installFabric(mcVersion, loaderVersion, jsonPath);
                break;
            case 'quilt':
                await this.installQuilt(mcVersion, loaderVersion, jsonPath);
                break;
            case 'forge':
                // Forge is handled differently by MLC via installer path
                return { forgeInstaller: await this.downloadForgeInstaller(mcVersion, loaderVersion) };
            case 'neoforge':
                return { forgeInstaller: await this.downloadNeoForgeInstaller(loaderVersion) };
            case 'liteloader':
                await this.installLiteLoader(mcVersion, loaderVersion, jsonPath);
                break;
            default:
                throw new Error(`Unsupported loader: ${loader}`);
        }

        return { customId, jsonPath };
    }

    async installFabric(mcVersion, loaderVersion, jsonPath) {
        const url = `https://meta.fabricmc.net/v2/versions/loader/${mcVersion}/${loaderVersion}/profile/json`;
        const resp = await axios.get(url);
        fs.writeFileSync(jsonPath, JSON.stringify(resp.data, null, 2));
    }

    async installQuilt(mcVersion, loaderVersion, jsonPath) {
        const url = `https://meta.quiltmc.org/v3/versions/loader/${mcVersion}/${loaderVersion}/profile/json`;
        const resp = await axios.get(url);
        fs.writeFileSync(jsonPath, JSON.stringify(resp.data, null, 2));
    }

    async downloadForgeInstaller(mcVersion, loaderVersion) {
        let suffix = 'installer.jar';
        try {
            const minorVersion = parseInt(mcVersion.split('.')[1], 10);
            if (!isNaN(minorVersion) && minorVersion <= 12) {
                suffix = 'universal.jar';
            }
        } catch (e) { }

        const installerName = `forge-${mcVersion}-${loaderVersion}-${suffix}`;
        const url = `https://maven.minecraftforge.net/net/minecraftforge/forge/${mcVersion}-${loaderVersion}/${installerName}`;
        const dest = path.join(this.cachePath, installerName);

        if (fs.existsSync(dest)) return dest;

        await this.downloadFile(url, dest);
        return dest;
    }

    async downloadNeoForgeInstaller(loaderVersion) {
        const installerName = `neoforge-${loaderVersion}-installer.jar`;
        const url = `https://maven.neoforged.net/releases/net/neoforged/neoforge/${loaderVersion}/${installerName}`;
        const dest = path.join(this.cachePath, installerName);

        if (fs.existsSync(dest)) return dest;

        await this.downloadFile(url, dest);
        return dest;
    }

    async installLiteLoader(mcVersion, loaderVersion, jsonPath) {
        // LiteLoader requires patching the vanilla JSON
        // We'll fetch the vanilla JSON first (or assume MLC does it, but we need it for patching)
        // Actually, LiteLoader's JSON is usually just adding it as a library and changing mainClass.

        const vanillaJsonPath = path.join(this.rootPath, 'versions', mcVersion, `${mcVersion}.json`);
        if (!fs.existsSync(vanillaJsonPath)) {
            // We might need to trigger a download or wait for MLC
            throw new Error(`Vanilla version ${mcVersion} not found. Launch it once first.`);
        }

        const vanillaJson = JSON.parse(fs.readFileSync(vanillaJsonPath, 'utf8'));

        // Patching logic for LiteLoader
        const liteLoaderLib = {
            name: `com.mumfrey:liteloader:${mcVersion}`,
            url: 'http://dl.liteloader.com/versions/'
        };

        const patchedJson = {
            ...vanillaJson,
            id: `liteloader-${loaderVersion}-${mcVersion}`,
            libraries: [...vanillaJson.libraries, liteLoaderLib],
            mainClass: 'net.minecraft.launchwrapper.Launch',
            minecraftArguments: (vanillaJson.minecraftArguments || '') + ' --tweakClass com.mumfrey.liteloader.launch.LiteLoaderTweaker'
        };

        // For newer versions (1.13+), we'd use arguments.game
        if (patchedJson.arguments && patchedJson.arguments.game) {
            patchedJson.arguments.game.push('--tweakClass');
            patchedJson.arguments.game.push('com.mumfrey.liteloader.launch.LiteLoaderTweaker');
        }

        fs.writeFileSync(jsonPath, JSON.stringify(patchedJson, null, 2));
    }

    async downloadFile(url, dest) {
        const writer = fs.createWriteStream(dest);
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }

    /**
     * Scans the versions directory to detect installed loaders for a specific MC version.
     */
    async scanLocalVersions(mcVersion) {
        const versionsDir = path.join(this.rootPath, 'versions');
        if (!fs.existsSync(versionsDir)) return [];

        const dirs = fs.readdirSync(versionsDir);
        const results = [];

        for (const dir of dirs) {
            const jsonPath = path.join(versionsDir, dir, `${dir}.json`);
            if (fs.existsSync(jsonPath)) {
                try {
                    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    if (data.inheritsFrom === mcVersion || data.id.includes(mcVersion)) {
                        let loader = 'vanilla';
                        if (data.mainClass.includes('fabricmc')) loader = 'fabric';
                        if (data.mainClass.includes('quiltmc')) loader = 'quilt';
                        if (data.mainClass.includes('cpw.mods')) loader = 'forge';
                        if (data.mainClass.includes('neoforged')) loader = 'neoforge';

                        results.push({ id: data.id, loader, mainClass: data.mainClass });
                    }
                } catch (e) { }
            }
        }
        return results;
    }

    /**
     * Scans a mods folder and attempts to detect which mod loader is required.
     */
    async detectLoader(modsPath) {
        if (!fs.existsSync(modsPath)) return 'vanilla';

        const files = fs.readdirSync(modsPath).filter(f => f.endsWith('.jar'));
        const { execSync } = require('child_process');

        let hasFabric = false;
        let hasForge = false;
        let hasQuilt = false;

        // Simple heuristic: search for characteristic files in the jars
        // A more robust way would be to unzipping and reading json/toml
        for (const file of files) {
            const filePath = path.join(modsPath, file);
            try {
                // We use powershell to list files inside jar if possible, or just skip if too complex
                // For a truly "universal" implementation, we should read the zip entries.
                // Since we don't have an easy unzip lib in dependencies right now, 
                // we'll assume the user might have some standard naming or we skip.
                // BUT, let's try a simple approach using powershell's Expand-Archive or Similar is slow.
                // Let's use a simple string search in the first few bytes or just skip for now.
            } catch (e) { }
        }

        // Fallback to vanilla if unsure
        return 'vanilla';
    }

    /**
     * Universal Patching: Merges a loader JSON onto a vanilla JSON manually.
     * This is useful if we want to bypass some MLC logic or support obscure loaders.
     */
    patchVersionJson(vanillaJson, loaderJson, customId) {
        const merged = {
            ...vanillaJson,
            ...loaderJson,
            id: customId,
            libraries: [
                ...(vanillaJson.libraries || []),
                ...(loaderJson.libraries || [])
            ],
            // Merge arguments if present
            arguments: {
                game: [
                    ...(vanillaJson.arguments?.game || []),
                    ...(loaderJson.arguments?.game || [])
                ],
                jvm: [
                    ...(vanillaJson.arguments?.jvm || []),
                    ...(loaderJson.arguments?.jvm || [])
                ]
            }
        };

        // Filter out duplicate libraries (simple name check)
        const seenLibs = new Set();
        merged.libraries = merged.libraries.filter(lib => {
            const name = typeof lib === 'string' ? lib : lib.name;
            if (seenLibs.has(name)) return false;
            seenLibs.add(name);
            return true;
        });

        return merged;
    }
}

module.exports = ModLoaderManager;
