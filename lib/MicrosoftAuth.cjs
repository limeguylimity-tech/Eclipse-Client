/**
 * MicrosoftAuth.cjs - Full Microsoft OAuth2 Authentication for Minecraft
 * 
 * Flow: Microsoft OAuth2 -> Xbox Live Token -> XSTS Token -> Minecraft Bearer Token
 * Uses the `msmc` library which handles the entire chain.
 * 
 * Stores tokens in a secure local JSON file for silent refresh on next launch.
 */

const { Auth } = require('msmc');
const fs = require('fs');
const path = require('path');

class MicrosoftAuth {
    constructor(tokenStorePath) {
        this.tokenStorePath = tokenStorePath;
        this.cachedAuth = null;
    }

    loadStoredTokens() {
        try {
            if (fs.existsSync(this.tokenStorePath)) {
                return JSON.parse(fs.readFileSync(this.tokenStorePath, 'utf8'));
            }
        } catch (e) {
            console.warn('[MicrosoftAuth] Failed to load stored tokens:', e.message);
        }
        return null;
    }

    saveTokens(data) {
        try {
            const dir = path.dirname(this.tokenStorePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.tokenStorePath, JSON.stringify(data, null, 2));
        } catch (e) {
            console.warn('[MicrosoftAuth] Failed to save tokens:', e.message);
        }
    }

    clearTokens() {
        try {
            if (fs.existsSync(this.tokenStorePath)) {
                fs.unlinkSync(this.tokenStorePath);
            }
            this.cachedAuth = null;
        } catch (e) {
            console.warn('[MicrosoftAuth] Failed to clear tokens:', e.message);
        }
    }

    async tryRefresh() {
        const stored = this.loadStoredTokens();
        if (!stored || !stored.refreshToken) {
            console.log('[MicrosoftAuth] No stored tokens found, need fresh login.');
            return null;
        }

        try {
            console.log('[MicrosoftAuth] Attempting silent token refresh...');
            const authManager = new Auth('select_account');
            const xboxManager = await authManager.refresh(stored.refreshToken);
            const token = await xboxManager.getMinecraft();

            if (!token.profile || !token.profile.id) {
                console.warn('[MicrosoftAuth] Refresh succeeded but no Minecraft profile found.');
                return null;
            }

            const authObj = token.mclc();

            this.saveTokens({
                refreshToken: xboxManager.save(),
                username: token.profile.name,
                uuid: token.profile.id,
                xuid: token.xuid || ''
            });

            this.cachedAuth = authObj;
            console.log('[MicrosoftAuth] Silent refresh successful for: ' + token.profile.name);
            return authObj;
        } catch (e) {
            console.warn('[MicrosoftAuth] Silent refresh failed:', e.message);
            return null;
        }
    }

    async login(parentWindow) {
        console.log('[MicrosoftAuth] Starting interactive Microsoft login...');
        const authManager = new Auth('select_account');

        const xboxManager = await authManager.launch('electron', {
            parent: parentWindow,
            title: 'ECLIPSE CLIENT - Microsoft Login',
            width: 500,
            height: 650
        });

        const token = await xboxManager.getMinecraft();

        if (!token.profile || !token.profile.id) {
            throw new Error('NO_MINECRAFT_LICENSE: This Microsoft account does not own Minecraft Java Edition.');
        }

        const authObj = token.mclc();

        this.saveTokens({
            refreshToken: xboxManager.save(),
            username: token.profile.name,
            uuid: token.profile.id,
            xuid: token.xuid || ''
        });

        this.cachedAuth = authObj;
        console.log('[MicrosoftAuth] Login successful for: ' + token.profile.name + ' (' + token.profile.id + ')');
        return authObj;
    }

    async getAuth(parentWindow) {
        if (this.cachedAuth) return this.cachedAuth;
        const refreshed = await this.tryRefresh();
        if (refreshed) return refreshed;
        return await this.login(parentWindow);
    }

    getStoredUserInfo() {
        const stored = this.loadStoredTokens();
        if (stored && stored.username && stored.uuid) {
            return {
                username: stored.username,
                uuid: stored.uuid,
                xuid: stored.xuid || ''
            };
        }
        return null;
    }

    isLoggedIn() {
        return this.loadStoredTokens() !== null;
    }
}

module.exports = MicrosoftAuth;
