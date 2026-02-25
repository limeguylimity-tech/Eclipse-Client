import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
    Rocket, Box, Settings, Play, LogIn,
    Home, Compass, ShoppingCart, ShoppingBag, Newspaper,
    Users, ChevronRight, Monitor, Cpu,
    Shield, Download, Search, Mail, Lock, User as UserIcon,
    Plus, Trash2, FolderSearch, Star, Zap, Globe, Github,
    Volume2, VolumeX, Sparkles, X, Minus, CheckCircle, Clock,
    MessageCircle, ExternalLink, HardDrive, Gamepad, Award, Image as ImageIcon,
    SkipForward, SkipBack, Maximize, Square, HelpCircle, ArrowRight, Folder, AlertTriangle, PlusCircle, Filter, Eye, Activity,
    Terminal, Calendar, Heart, ShieldAlert, ZapOff, Clipboard, Eraser
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// --- Configuration & Data ---

const THEMES = [
    { id: 'eclipse', name: 'Eclipse Prime', color1: '#3b82f6', color2: '#8b5cf6', glow: 'rgba(59, 130, 246, 0.4)' },
    { id: 'nebula', name: 'Deep Nebula', color1: '#ec4899', color2: '#3b82f6', glow: 'rgba(236, 72, 153, 0.4)' },
    { id: 'emerald', name: 'Emerald Orbit', color1: '#10b981', color2: '#3b82f6', glow: 'rgba(16, 185, 129, 0.4)' },
    { id: 'void', name: 'Void Protocol', color1: 'transparent', color2: 'transparent', glow: 'transparent' }
];

const TRACKS = [
    { id: 'custom1', name: 'pretty ho3', artist: 'ilyTOMMY', url: 'C:\\Users\\deboe\\Downloads\\♡ilyTOMMY♡ - pretty ho3 (1 Hour Long) - Halow.mp3' },
    { id: 'lofi1', name: 'Lofi Hip Hop', artist: 'Eclipse Relax', url: './audio/Lofi Hip Hop.mp3' },
    { id: 'lofi2', name: 'Lofi Hip Hop (2)', artist: 'Eclipse Relax', url: './audio/Lofi Hip Hop (2).mp3' },
    { id: 'ballin', name: 'Ballin', artist: 'Roddy Ricch', url: './audio/ballin.mp3' },
    { id: 'party', name: 'My Life is a Party', artist: 'ItaloBrothers', url: './audio/party.mp3' },
    { id: 'ambient', name: 'Deep Drift', artist: 'Eclipse Core', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' }
];

const RANKS = [
    { id: 'eclipse', name: 'ECLIPSE', color: '#3b82f6', price: '$9.99', perks: ['Priority Access', 'Neon Tag', 'Custom Capes'] },
    { id: 'nebula', name: 'NEBULA', color: '#8b5cf6', price: '$19.99', perks: ['Hyper Glow', 'Exclusive Mods', 'Private Server'] },
    { id: 'voyager', name: 'VOYAGER', color: '#10b981', price: '$29.99', perks: ['Lifetime V11+', 'All Themes', 'Alpha Testing'] }
];

const SEASONS = [
    { id: 'default', name: 'Standard Cosmos', color1: null, color2: null, glow: null, bg: null }
];

const BACKGROUNDS = [
    { id: 'rainy-landscape', name: 'Rainy Landscape', url: './backgrounds/minecraft-rainy-landscape.960x540.mp4' },
    { id: 'rainy-evening', name: 'Rainy Evening', url: './backgrounds/rainy-evening-minecraft.960x540.mp4' },
    { id: 'holiday-hearth', name: 'Holiday Hearth', url: 'C:\\Users\\deboe\\Downloads\\minecraft-holiday-hearth.960x540.mp4' },
    { id: 'shop-live', name: 'Premium Vault', url: 'https://cdn.pixabay.com/video/2016/11/03/6191-189689408_tiny.mp4' },
    { id: 'nebula', name: 'Standard Nebula', url: null }
];

const EVENTS = [
    { id: 1, title: 'SUMMER_SOLSTICE_2026', date: 'JUN 21', desc: 'Special celestial event with limited time rewards.', color: '#f59e0b' },
    { id: 2, title: 'NEBULA_RECON_VII', date: 'JUL 15', desc: 'Community mission to explore new modded galaxies.', color: '#8b5cf6' },
    { id: 3, title: 'ECLIPSE_CHAMPIONSHIP', date: 'AUG 02', desc: 'Highest FPS competition. Prizes for the most stable setup.', color: '#3b82f6' }
];

// --- Dynamic Intel Generator ---
const getRealDate = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
};

const NEWS_FEED = [
    { id: 1, title: 'VOYAGER V12_DASHBOARD_LIVE', date: getRealDate(0), content: 'Hyper-Horizon protocols active. Immersion levels at 100%. Command Feed synchronized with real-time solar cycles.', color: 'var(--accent-blue)' },
    { id: 2, title: 'STABILITY_PATCH_11.1', date: getRealDate(1), content: 'Ignition decoupling successful. Profile naming matrix stabilized. Volume persistence verified across all sectors.', color: 'var(--accent-purple)' },
    { id: 3, title: 'NEBULA_ENGINE_OPTIMIZED', date: getRealDate(3), content: 'Sub-4ms latency achieved during Minecraft ignition. Multi-instance threading optimized for high-velocity deployments.', color: 'var(--accent-green)' }
];

// --- Persistent Components ---

const BackgroundEngine = memo(({ themeId, activeBgId, activeTab }) => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];

    // Shop Tab Override
    let bgIdToUse = activeBgId;
    if (activeTab === 'shop') bgIdToUse = 'shop-live';

    const bg = BACKGROUNDS.find(b => b.id === bgIdToUse);

    return (
        <div className="bg-engine">
            {bg && bg.url ? (
                <video
                    autoPlay
                    muted
                    loop
                    key={bg.url}
                    style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2, opacity: activeTab === 'shop' ? 0.3 : 0.6 }}
                    src={bg.url}
                />
            ) : (
                <div className="stars-drift"></div>
            )}
            <motion.div
                key={themeId + activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 2 }}
                className="nebula-cloud"
                style={{
                    background: `radial-gradient(circle at 20% 30%, ${theme.color1}44 0%, transparent 60%), radial-gradient(circle at 80% 70%, ${theme.color2}44 0%, transparent 60%)`
                }}
            />
        </div>
    );
});

const ModExplorer = ({ mcPath, activeProfile, onDownload }) => {
    const [mods, setMods] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(null);
    const [selectedMod, setSelectedMod] = useState(null);
    const [modVersions, setModVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [downloadStatus, setDownloadStatus] = useState(null);

    const [provider, setProvider] = useState('modrinth');
    const providerRef = useRef(provider);
    const searchTimer = useRef(null);

    useEffect(() => { providerRef.current = provider; }, [provider]);

    const doSearch = useCallback(async (q = '') => {
        setLoading(true);
        try {
            const encoded = encodeURIComponent(q);
            const headers = { 'User-Agent': 'EclipseClient/1.0.0 (https://github.com/eclipse-client)' };
            const res = await axios.get(`https://api.modrinth.com/v2/search?query=${encoded}&limit=40`, { headers });
            if (providerRef.current === 'curseforge') {
                setMods((res.data.hits || []).map(h => ({ ...h, provider: 'curseforge' })));
            } else {
                setMods(res.data.hits || []);
            }
        } catch (e) {
            console.error('[ModExplorer] Search error:', e.message);
        }
        setLoading(false);
    }, []);

    const debouncedSearch = useCallback((q) => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => doSearch(q), 300);
    }, [doSearch]);

    useEffect(() => { doSearch(query); }, [provider]);

    const handleSelectMod = async (mod) => {
        setSelectedMod(mod);
        setLoadingVersions(true);
        setModVersions([]);
        setSelectedVersion(null);
        try {
            const headers = { 'User-Agent': 'EclipseClient/1.0.0 (https://github.com/eclipse-client)' };
            const res = await axios.get(`https://api.modrinth.com/v2/project/${mod.project_id}/version`, { headers });
            setModVersions(res.data);
            if (res.data.length > 0) {
                const match = res.data.find(v => {
                    const versionMatch = v.game_versions.includes(activeProfile?.version);
                    const loader = activeProfile?.loader || 'vanilla';

                    if (loader !== 'vanilla') {
                        const loaderMatch = v.loaders && v.loaders.includes(loader === 'neoforge' ? 'neoforge' : loader);
                        return versionMatch && loaderMatch;
                    }
                    return versionMatch;
                });

                setSelectedVersion(match || res.data.find(v => v.game_versions.includes(activeProfile?.version)) || res.data[0]);
            }
        } catch (e) {
            console.error("Failed to fetch mod versions", e);
        }
        setLoadingVersions(false);
    };

    const handleDownload = async () => {
        if (!activeProfile || !selectedVersion) {
            setDownloadStatus({ type: 'error', msg: 'Please ensure a Profile is selected and a Mod Version is picked!' });
            setTimeout(() => setDownloadStatus(null), 4000);
            return;
        }
        setDownloading(selectedMod.project_id);
        try {
            const primaryFile = selectedVersion.files.find(f => f.primary) || selectedVersion.files[0];

            const rootPath = mcPath || await window.electron.autoLocateMc();
            if (!rootPath) {
                setDownloadStatus({ type: 'error', msg: 'Could not find your .minecraft folder. Please set it in Config.' });
                setTimeout(() => setDownloadStatus(null), 4000);
                setDownloading(null);
                return;
            }
            const safeProfileName = activeProfile.name.replace(/[^a-z0-9]/gi, '_');
            const targetPath = `${rootPath}/instances/${safeProfileName}`;

            await window.electron.downloadMod({
                url: primaryFile.url,
                fileName: primaryFile.filename,
                mcPath: targetPath
            });
            if (onDownload) onDownload();
            setDownloadStatus({ type: 'success', msg: `Deployed ${selectedMod.title} (${selectedVersion.version_number}) to ${activeProfile.name}` });
            setTimeout(() => setDownloadStatus(null), 4000);
        } catch (e) {
            setDownloadStatus({ type: 'error', msg: 'Deployment failure: ' + e.message });
            setTimeout(() => setDownloadStatus(null), 4000);
        }
        setDownloading(null);
    };

    return (
        <div className="tab-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-header)', letterSpacing: '2px' }}>MOD REGISTRY</h1>
                    <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '15px' }}>
                        <button
                            className={`pill-button ${provider === 'modrinth' ? 'primary' : 'secondary'}`}
                            style={{ height: '35px', padding: '0 20px', fontSize: '0.65rem' }}
                            onClick={() => setProvider('modrinth')}
                        >MODRINTH</button>
                        <button
                            className={`pill-button ${provider === 'curseforge' ? 'primary' : 'secondary'}`}
                            style={{ height: '35px', padding: '0 20px', fontSize: '0.65rem' }}
                            onClick={() => setProvider('curseforge')}
                        >CURSEFORGE</button>
                    </div>
                </div>
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0.8rem 1.5rem', width: '350px' }}>
                    <Search size={18} color="var(--accent-blue)" />
                    <input
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                        type="text"
                        placeholder={`Search modules...`}
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); debouncedSearch(e.target.value); }}
                    />
                </div>
            </div>

            {downloadStatus && (
                <div style={{
                    padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem',
                    background: downloadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 77, 77, 0.15)',
                    border: `1px solid ${downloadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 77, 77, 0.3)'}`,
                    color: downloadStatus.type === 'success' ? '#10b981' : '#ff4d4d',
                    fontSize: '0.85rem', fontWeight: 700
                }}>
                    {downloadStatus.type === 'success' ? '✓ ' : '✗ '}{downloadStatus.msg}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '10rem' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                        <Rocket size={48} color="var(--accent-blue)" style={{ filter: 'drop-shadow(0 0 15px var(--accent-blue))' }} />
                    </motion.div>
                    <p style={{ color: 'var(--accent-blue)', fontWeight: 800, letterSpacing: '4px', marginTop: '2rem', fontSize: '0.8rem' }}>SCANNING SECTORS...</p>
                </div>
            ) : (
                <div className="mod-list">
                    {mods.map(mod => (
                        <div key={mod.project_id} className="glass-panel clickable" onClick={() => handleSelectMod(mod)} style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <img src={mod.icon_url} style={{ width: '64px', height: '64px', borderRadius: '15px' }} />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', fontWeight: 700 }}>{mod.title}</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>BY {mod.author.toUpperCase()}</p>
                                </div>
                                <ChevronRight size={20} color="rgba(255,255,255,0.2)" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedMod && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" style={{ zIndex: 1000 }}>
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-panel"
                            style={{ width: '640px', textAlign: 'left', padding: '3.5rem' }}
                        >
                            <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '2.5rem', alignItems: 'flex-start' }}>
                                <img src={selectedMod.icon_url} style={{ width: '110px', height: '110px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} />
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '0.8rem', fontFamily: 'var(--font-header)' }}>{selectedMod.title}</h2>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {selectedMod.categories?.slice(0, 3).map(c => (
                                            <div key={c} style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', fontSize: '0.65rem', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>{c.toUpperCase()}</div>
                                        ))}
                                    </div>
                                </div>
                                <button type="button" onClick={() => setSelectedMod(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '0.5rem' }}><X size={24} /></button>
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: '1.7', maxHeight: '180px', overflowY: 'auto', paddingRight: '1rem' }}>{selectedMod.description}</p>
                            </div>

                            <div className="glass-panel" style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-blue)', letterSpacing: '2px' }}>VERSION SELECT</span>
                                    {loadingVersions && <Activity size={16} className="spin" color="var(--accent-blue)" />}
                                </div>

                                <div className="glass-panel" style={{ padding: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                                    <select
                                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.8rem 1rem', outline: 'none', cursor: 'pointer', appearance: 'none', fontSize: '0.9rem' }}
                                        value={selectedVersion?.id || ''}
                                        onChange={(e) => setSelectedVersion(modVersions.find(v => v.id === e.target.value))}
                                    >
                                        <option value="" disabled>Select a module version...</option>
                                        {modVersions.map(v => (
                                            <option key={v.id} value={v.id} style={{ background: '#111' }}>
                                                {v.version_number} [{v.game_versions.slice(0, 2).join(', ')}] {v.loaders?.length ? v.loaders.map(l => l.toUpperCase()).join('/') : ''} ({v.version_type.toUpperCase()})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {activeProfile?.loader === 'vanilla' && (
                                    <div style={{ background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <AlertTriangle size={18} color="#ff4d4d" />
                                        <span style={{ fontSize: '0.75rem', color: '#ff4d4d', fontWeight: 700 }}>STATION USING VANILLA CORE. MODULES WILL NOT LOAD.</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button
                                        className="pill-button primary"
                                        style={{ flex: 1, height: '55px', fontSize: '1rem' }}
                                        disabled={downloading === selectedMod.project_id || !selectedVersion}
                                        onClick={handleDownload}
                                    >
                                        {downloading === selectedMod.project_id ? (
                                            <Activity size={20} className="spin" />
                                        ) : (
                                            <>
                                                <Download size={20} style={{ marginRight: '10px' }} />
                                                DEPLOY TO {activeProfile?.name.toUpperCase()}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="pill-button secondary"
                                        style={{ flex: 0.3, height: '55px' }}
                                        onClick={() => setSelectedMod(null)}
                                    >
                                        CLOSE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LogTerminal = ({ logs }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getLogColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'warn': return '#f59e0b';
            case 'error': return '#ef4444';
            case 'fatal': return '#b91c1c';
            case 'debug': return '#8b5cf6';
            default: return '#3b82f6';
        }
    };

    return (
        <div className="tab-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-header)', letterSpacing: '2px' }}>COMMAND_FEED</h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="pill-button secondary" style={{ height: '40px', padding: '0 20px', fontSize: '0.7rem' }} onClick={() => {
                        const text = logs.map(l => `[${l.timestamp}] [${l.type?.toUpperCase()}] ${l.message}`).join('\n');
                        navigator.clipboard.writeText(text);
                    }}>
                        <Clipboard size={14} /> COPY_LOG
                    </button>
                    <button className="pill-button secondary" style={{ height: '40px', padding: '0 20px', fontSize: '0.7rem', color: '#ef4444' }}>
                        <Eraser size={14} /> CLEAR
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="glass-panel"
                style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.6)',
                    padding: '2rem',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }}
            >
                {logs.map((log, i) => (
                    <div key={i} style={{ display: 'flex', gap: '15px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.2)', minWidth: '85px' }}>[{log.timestamp}]</span>
                        <span style={{ color: getLogColor(log.type), fontWeight: 800, minWidth: '60px' }}>[{log.type?.toUpperCase() || 'INFO'}]</span>
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>{log.message}</span>
                    </div>
                ))}
                {logs.length === 0 && <div style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '5rem' }}>AWAITING_ORBITAL_UPLINK...</div>}
            </div>
        </div>
    );
};

// --- Voyager Core ---

function App() {
    const [isReady, setIsReady] = useState(false);
    const [isBooting, setIsBooting] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [launchError, setLaunchError] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [activeTheme, setTheme] = useState('eclipse');
    const [activeSeason, setActiveSeason] = useState('default');
    const [challenges, setChallenges] = useState([
        { id: 'launch', title: 'Speed of Light', desc: 'Launch Minecraft 5 times.', reward: 100, progress: 0, total: 5, claimed: false },
        { id: 'download', title: 'Mod Explorer', desc: 'Download 3 mods from the Registry.', reward: 150, progress: 0, total: 3, claimed: false },
        { id: 'create_instance', title: 'System Architect', desc: 'Create a custom instance.', reward: 200, progress: 0, total: 1, claimed: false }
    ]);
    const [trackIdx, setTrackIdx] = useState(0);
    const [user, setUser] = useState('');
    const [eclipseCoins, setEclipseCoins] = useState(500);
    const [shopSubTab, setShopSubTab] = useState('coins'); // Default to coins to ensure it's seen
    const [activeBg, setActiveBg] = useState('nebula');
    const [mcPath, setMcPath] = useState('');
    const [ram, setRam] = useState(4096);
    const [fpsLimit, setFpsLimit] = useState(240);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [showPathPrompt, setShowPathPrompt] = useState(false);
    const [showCreateProfile, setShowCreateProfile] = useState(false);
    const [showRankPreview, setShowRankPreview] = useState(null);
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileVer, setNewProfileVer] = useState('1.21.1');
    const [newProfileLoader, setNewProfileLoader] = useState('vanilla');
    const [versions, setVersions] = useState([]);
    const [vQuery, setVQuery] = useState('');
    const [showSnapshots, setShowSnapshots] = useState(false);
    const [showInstanceSettings, setShowInstanceSettings] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);
    const [isDiscordLinking, setIsDiscordLinking] = useState(false);
    const [checkoutItem, setCheckoutItem] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isDiscordRPC, setIsDiscordRPC] = useState(true);
    const [isPerformanceMode, setIsPerformanceMode] = useState(false);
    const [autoConnect, setAutoConnect] = useState(false);
    const [isMsAuth, setIsMsAuth] = useState(false);  // BUG 1: Track if using real MS auth
    const [userUuid, setUserUuid] = useState('');       // BUG 1: Store real UUID
    const [msAuthLoading, setMsAuthLoading] = useState(false);
    const [logs, setLogs] = useState([
        { type: 'system', message: 'ECLIPSE_OS_V16.2_READY', timestamp: new Date().toLocaleTimeString() },
        { type: 'system', message: 'VOYAGER_SYNCC_ESTABLISHED', timestamp: new Date().toLocaleTimeString() }
    ]);
    const [localMods, setLocalMods] = useState([]);
    const [loaderVersions, setLoaderVersions] = useState([]);
    const [newProfileLoaderVer, setNewProfileLoaderVer] = useState('');
    const [serverRunning, setServerRunning] = useState(false);
    const [serverConsole, setServerConsole] = useState([]);
    const [serverVersion, setServerVersion] = useState('1.21.1');
    const [serverProperties, setServerProperties] = useState({
        'server-port': '25565',
        'gamemode': 'survival',
        'difficulty': 'normal',
        'max-players': '10',
        'motd': 'Eclipse Server',
        'online-mode': 'true'
    });
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [latestVersion, setLatestVersion] = useState('');
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const [profiles, setProfiles] = useState([
        { name: 'Voyager Stable', version: '1.21.1', active: true },
        { name: 'Void Protocol', version: '1.8.9', active: false }
    ]);

    const audioRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const config = await window.electron.loadConfig();

            try {
                const vData = await window.electron.getMcVersions();
                setVersions(vData.versions);
            } catch (e) {
                console.error("Failed to fetch versions manifest", e);
            }

            if (config) {
                setUser(config.user || '');
                setMcPath(config.mcPath || '');
                setRam(config.ram || 4096);
                setTheme(config.theme || 'eclipse');
                if (config.activeSeason) setActiveSeason(config.activeSeason);
                if (config.challenges) setChallenges(config.challenges);
                setVolume(config.volume !== undefined ? config.volume : 0.5);
                setFpsLimit(config.fpsLimit || 240);
                if (config.profiles) setProfiles(config.profiles);
                if (config.eclipseCoins !== undefined) setEclipseCoins(config.eclipseCoins);
                if (config.activeBg) setActiveBg(config.activeBg);
                if (config.trackIdx !== undefined) setTrackIdx(config.trackIdx);
                if (config.isDiscordRPC !== undefined) setIsDiscordRPC(config.isDiscordRPC);
                if (config.isPerformanceMode !== undefined) setIsPerformanceMode(config.isPerformanceMode);
                if (config.autoConnect !== undefined) setAutoConnect(config.autoConnect);
                if (config.isMuted !== undefined) setIsMuted(config.isMuted);
                if (config.showSnapshots !== undefined) setShowSnapshots(config.showSnapshots);
            }

            // ── BUG 1 FIX: Try to restore Microsoft auth session silently ──
            try {
                const msResult = await window.electron.microsoftRefresh();
                if (msResult.success) {
                    setUser(msResult.username);
                    setUserUuid(msResult.uuid);
                    setIsMsAuth(true);
                    setIsLoggedIn(true);
                    console.log('[AUTH] Microsoft session restored:', msResult.username);
                } else if (config?.user) {
                    // Fall back to stored offline username
                    setIsLoggedIn(true);
                }
            } catch (e) {
                console.warn('[AUTH] MS refresh failed, checking offline:', e);
                if (config?.user) setIsLoggedIn(true);
            }

            window.electron.onMcLog((data) => {
                setLogs(prev => {
                    const newLogs = [...prev, { ...data, timestamp: new Date().toLocaleTimeString() }];
                    return newLogs.slice(-1000);
                });
            });

            if (window.electron.onServerLog) {
                window.electron.onServerLog((line) => {
                    setServerConsole(prev => [...prev, line].slice(-500));
                });
            }

            try {
                const currentVersion = '1.0.0';
                const res = await axios.get('https://raw.githubusercontent.com/eclipse-client/launcher/main/version.json', { timeout: 5000 }).catch(() => null);
                if (res?.data?.latest && res.data.latest !== currentVersion) {
                    setLatestVersion(res.data.latest);
                    setUpdateAvailable(true);
                    setShowUpdateModal(true);
                }
            } catch (e) { console.log('[UPDATE] Version check skipped'); }

            setIsReady(true);
        };
        init();
    }, []);

    const fetchLoaderVersions = async (loader, mcVersion) => {
        if (!loader || loader === 'vanilla' || !mcVersion) {
            setLoaderVersions([]);
            return;
        }
        try {
            const vs = await window.electron.getLoaderVersions({ loader, mcVersion });
            setLoaderVersions(vs);
            return vs[0]?.id;
        } catch (e) {
            console.error("Failed to fetch loader versions", e);
            setLoaderVersions([]);
        }
    };

    useEffect(() => {
        if (showCreateProfile) {
            fetchLoaderVersions(newProfileLoader, newProfileVer).then(ver => setNewProfileLoaderVer(ver || ''));
        }
    }, [newProfileLoader, newProfileVer, showCreateProfile]);

    useEffect(() => {
        if (showInstanceSettings && editingProfile) {
            fetchLoaderVersions(editingProfile.loader, editingProfile.version).then(ver => {
                if (!editingProfile.loaderVersion) {
                    setEditingProfile(prev => ({ ...prev, loaderVersion: ver }));
                }
            });
        }
    }, [editingProfile?.loader, editingProfile?.version, showInstanceSettings]);

    useEffect(() => {
        if (isLoggedIn) {
            window.electron.saveConfig({
                user, mcPath, ram, theme: activeTheme, profiles, volume, fpsLimit, eclipseCoins, activeBg, activeSeason, challenges,
                isDiscordRPC, isPerformanceMode, autoConnect, trackIdx, isMuted, showSnapshots
            });
        }
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [user, mcPath, ram, activeTheme, profiles, isLoggedIn, volume, fpsLimit, isMuted, activeBg, activeSeason, eclipseCoins, challenges, isDiscordRPC, isPerformanceMode, autoConnect, trackIdx, showSnapshots]);

    const handleLaunch = async () => {
        setLaunchError(null);
        const activeProf = profiles.find(p => p.active);
        setIsLaunching(true);

        const launchTimeout = setTimeout(() => {
            if (isLaunching) setIsLaunching(false);
        }, 15000); // Fail-safe fallback

        try {
            const res = await window.electron.launchGame({
                version: activeProf?.version || '1.21.1',
                username: user || 'Pilot',
                mcPath: mcPath,
                memory: `${Math.floor(ram)}M`,
                profileName: activeProf?.name || 'Default',
                loader: activeProf?.loader || 'vanilla',
                loaderVersion: activeProf?.loaderVersion
            });

            clearTimeout(launchTimeout);

            if (!res.success) {
                setIsLaunching(false);
                if (res.error === 'NO_PATH') {
                    setShowPathPrompt(true);
                } else {
                    setLaunchError(res.message || "IGNITION_FAILED");
                }
                return;
            }

            // Keep ignition screen for a few seconds for feedback
            setTimeout(() => setIsLaunching(false), 5000);

            setChallenges(prev => prev.map(c => c.id === 'launch' && c.progress < c.total ? { ...c, progress: c.progress + 1 } : c));
        } catch (err) {
            clearTimeout(launchTimeout);
            setIsLaunching(false);
            setLaunchError("TETHER_SYNC_CRITICAL: " + err.message);
        }
    };

    // ── BUG 1 FIX: Real Microsoft OAuth2 login handler ──
    const handleMicrosoftLogin = async () => {
        setMsAuthLoading(true);
        try {
            const result = await window.electron.microsoftLogin();
            if (result.success) {
                setUser(result.username);
                setUserUuid(result.uuid);
                setIsMsAuth(true);
                setIsLoggedIn(true);
            } else {
                setLaunchError('MICROSOFT_AUTH_FAILED: ' + (result.error || 'Unknown error'));
            }
        } catch (e) {
            setLaunchError('MICROSOFT_AUTH_ERROR: ' + e.message);
        } finally {
            setMsAuthLoading(false);
        }
    };

    // ── BUG 1 FIX: Sign out handler (clears MS tokens) ──
    const handleSignOut = async () => {
        if (isMsAuth) {
            await window.electron.microsoftLogout();
        }
        setUser('');
        setUserUuid('');
        setIsMsAuth(false);
        setIsLoggedIn(false);
        window.electron.saveConfig({});
    };

    const createProfile = () => {
        if (!newProfileName) return;

        // Sanitize name for filesystem and UI consistency
        const sanitizedName = newProfileName.trim().replace(/[^a-zA-Z0-9 ]/g, '');
        if (!sanitizedName) return;

        const newProfiles = [
            ...profiles.map(p => ({ ...p, active: false })),
            { name: sanitizedName, version: newProfileVer, loader: newProfileLoader, loaderVersion: newProfileLoaderVer, active: true }
        ];

        setProfiles(newProfiles);
        setNewProfileName('');
        setNewProfileLoader('vanilla');
        setVQuery('');
        setShowCreateProfile(false);
        setActiveTab('home'); // Jump to home to show the new profile
        setChallenges(prev => prev.map(c => c.id === 'create_instance' && c.progress < c.total ? { ...c, progress: c.progress + 1 } : c));
    };

    const openMods = async (profile) => {
        const p = mcPath || await window.electron.autoLocateMc();
        if (p) {
            const safeProfileName = profile.name.replace(/[^a-z0-9]/gi, '_');
            const folder = `${p}/instances/${safeProfileName}/mods`;
            const success = await window.electron.openPath(folder);
            if (!success) alert("Mods folder for this instance hasn't been created yet. Launch once or create it manually at: " + folder);
        } else {
            setShowPathPrompt(true);
        }
    };

    const openInstanceSettings = (profile) => {
        setEditingProfile({ ...profile, originalName: profile.name });
        setLocalMods([]); // Reset mods view for new profile
        setShowInstanceSettings(true);
    };

    const saveInstanceSettings = () => {
        const updatedProfiles = profiles.map(p => p.name === editingProfile.originalName ? { ...editingProfile } : p);
        // Ensure originalName is removed from final state
        const cleanedProfiles = updatedProfiles.map(({ originalName, ...rest }) => rest);
        setProfiles(cleanedProfiles);
        setShowInstanceSettings(false);
        setEditingProfile(null);
    };

    const filteredVersions = versions.filter(v => {
        if (!showSnapshots && v.type !== 'release') return false;
        return v.id.includes(vQuery);
    });

    const activeProf = profiles.find(p => p.active);
    const currentTrack = TRACKS[trackIdx];

    return (
        <div className="app-container">
            <audio ref={audioRef} src={currentTrack.url} autoPlay loop />
            <BackgroundEngine themeId={activeTheme} activeBgId={activeBg} activeTab={activeTab} />

            <header className="title-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'var(--accent-blue)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-blue)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-header)', letterSpacing: '2px' }}>ECLIPSE CLIENT</span>
                </div>
                <div className="window-controls">
                    <button type="button" className="icon-btn-title" onClick={() => window.electron.controlWindow('toggle-fullscreen')}><Maximize size={16} /></button>
                    <button type="button" className="icon-btn-title" onClick={() => window.electron.controlWindow('minimize')}><Minus size={16} /></button>
                    <button type="button" className="icon-btn-title" style={{ color: '#ff4d4d' }} onClick={() => window.electron.controlWindow('close')}><X size={16} /></button>
                </div>
            </header>

            {isLoggedIn && (
                <nav className="nav-top">
                    {[
                        { id: 'home', icon: Home, title: 'Dashboard' },
                        { id: 'news', icon: Newspaper, title: 'News' },
                        { id: 'search', icon: Search, title: 'Modules' },
                        { id: 'shop', icon: ShoppingBag, title: 'Market' },
                        { id: 'profiles', icon: Box, title: 'Stations' },
                        { id: 'servers', icon: HardDrive, title: 'Servers' },
                        { id: 'logs', icon: Terminal, title: 'Console' },
                        { id: 'events', icon: Calendar, title: 'Events' },
                        { id: 'wallpapers', icon: Monitor, title: 'Visuals' },
                        { id: 'settings', icon: Settings, title: 'Config' }
                    ].map(item => (
                        <button
                            key={item.id}
                            className={`nav-pill ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon size={18} />
                            {item.title.toUpperCase()}
                        </button>
                    ))}
                </nav>
            )}

            <AnimatePresence>
                {isBooting && (
                    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="boot-container" style={{ zIndex: 99999, position: 'fixed', inset: 0, background: '#05070a' }}>
                        <div className="vortex-portal" style={{ position: 'relative' }}>
                            <motion.div
                                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                style={{
                                    width: '300px', height: '300px', border: '2px solid rgba(59, 130, 246, 0.4)',
                                    borderRadius: '50%', borderTopColor: 'var(--accent-blue)',
                                    boxShadow: '0 0 50px rgba(59, 130, 246, 0.2)'
                                }}
                            />
                            <motion.div
                                animate={{ rotate: -360, scale: [1.1, 1, 1.1] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                                style={{
                                    width: '240px', height: '240px', border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '50%', borderBottomColor: 'var(--accent-purple)',
                                    position: 'absolute', top: '30px', left: '30px',
                                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.1)'
                                }}
                            />
                            <Rocket size={80} color="var(--accent-blue)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 0 30px var(--accent-blue))' }} />
                        </div>
                        <div className="boot-progress-container" style={{ marginTop: '5rem', textAlign: 'center' }}>
                            <h2 className="h2-glow" style={{ fontSize: '3.5rem', fontFamily: 'var(--font-header)', letterSpacing: '15px', marginBottom: '1rem', color: 'white' }}>ECLIPSE</h2>
                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '3rem' }}>
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ color: 'var(--accent-blue)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '3px' }}>NEBULA_IGNITION_ACTIVE</motion.div>
                                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontWeight: 900 }}>V16.2.ARC</div>
                            </div>
                            <div className="boot-progress-bar" style={{ width: '450px', height: '2px', background: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 4.5, ease: "easeInOut" }}
                                    onAnimationComplete={() => setIsBooting(false)}
                                    className="boot-progress-fill"
                                    style={{ height: '100%', background: 'linear-gradient(90deg, transparent, var(--accent-blue), transparent)', boxShadow: '0 0 15px var(--accent-blue)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '450px', marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.6rem', fontWeight: 800 }}>
                                <span>CORES_ONLINE</span>
                                <span>100%_STABLE</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {isLaunching && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" style={{ background: 'rgba(5,5,5,0.95)' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="core-drive" style={{ width: '200px', height: '200px' }}>
                                <div className="drive-ring outer" style={{ animationDuration: '0.5s' }} />
                                <div className="drive-ring inner" style={{ animationDuration: '1s' }} />
                                <Rocket size={80} color="var(--neon-blue)" style={{ filter: 'drop-shadow(0 0 20px var(--neon-blue))' }} />
                            </div>
                            <h1 style={{ color: 'var(--neon-blue)', marginTop: '4rem', fontFamily: 'var(--font-main)', letterSpacing: '10px', fontSize: '3rem' }}>IGNITION_ACTIVE</h1>
                            <div className="tech-label" style={{ justifyContent: 'center', marginTop: '2rem' }}>ESTABLISHING_ORBITAL_PLANE // SYNCING_CORES</div>
                            <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-tech)', fontSize: '0.6rem', marginTop: '4rem', opacity: 0.5 }}>PLEASE_STAND_BY_FOR_PHYSICAL_UPLINK</p>
                        </div>
                    </motion.div>
                )}

                {showRankPreview && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
                        <div className="hud-panel" style={{ width: '500px', padding: '3rem', borderTop: `2px solid ${showRankPreview.color}` }}>
                            <div className="tech-label">MODULE_ANALYSIS // {showRankPreview.name.toUpperCase()}</div>
                            <div style={{ margin: '2rem 0' }}>
                                {showRankPreview.perks.map(p => (
                                    <div key={p} style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '1rem', fontFamily: 'var(--font-tech)', fontSize: '0.8rem' }}>
                                        <div style={{ width: '5px', height: '5px', background: showRankPreview.color }} />
                                        {p.toUpperCase()}
                                    </div>
                                ))}
                            </div>
                            <div className="hud-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                <div className="tech-label" style={{ justifyContent: 'center', color: '#ff4d4d' }}>COMMERCE_SUSPENDED</div>
                                <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem' }}>DIRECT_ACQUISITION_DISABLED_DUE_TO_VOID_MAINTENANCE</p>
                            </div>
                            <button className="module-btn" style={{ width: '100%', marginTop: '2rem', "--rank-color": showRankPreview.color }} onClick={() => setShowRankPreview(null)}>ACKNOWLEDGE_DATA</button>
                        </div>
                    </motion.div>
                )}

                {launchError && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="hud-panel" style={{ width: '500px', padding: '3rem', borderLeft: '4px solid #ff4d4d' }}>
                            <div className="tech-label" style={{ color: '#ff4d4d' }}>SYSTEM_CRITICAL // IGNITION_FAILURE</div>
                            <div style={{ margin: '2rem 0', fontFamily: 'var(--font-tech)', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                DATA_STREAM_INTERRUPTED: {launchError}
                            </div>
                            <button className="module-btn" style={{ width: '100%', "--rank-color": '#ff4d4d' }} onClick={() => setLaunchError(null)}>CLOSE_BUFFER</button>
                        </motion.div>
                    </div>
                )}

                {showCreateProfile && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ width: '550px', padding: '3.5rem' }}>
                            <Box size={64} color="var(--accent-blue)" style={{ marginBottom: '2.5rem', filter: 'drop-shadow(0 0 15px var(--accent-blue))' }} />
                            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-header)', letterSpacing: '2px', marginBottom: '3rem' }}>CREATE STATION</h2>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '1rem', letterSpacing: '2px' }}>STATION NAME</label>
                                <div className="glass-panel" style={{ padding: '0.8rem 1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <input
                                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.5rem 0', outline: 'none' }}
                                        placeholder="Enter name..."
                                        value={newProfileName}
                                        onChange={(e) => setNewProfileName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '2px' }}>VERSION_CORE</label>
                                    <button className={`pill-button ${showSnapshots ? 'primary' : 'secondary'}`} style={{ fontSize: '0.6rem', padding: '0.4rem 1rem' }} onClick={() => setShowSnapshots(!showSnapshots)}>
                                        SNAPSHOTS: {showSnapshots ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                <div className="glass-panel" style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                                    {filteredVersions.slice(0, 50).map(v => (
                                        <div
                                            key={v.id}
                                            onClick={() => setNewProfileVer(v.id)}
                                            style={{
                                                padding: '12px 20px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                background: newProfileVer === v.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                cursor: 'pointer',
                                                borderRadius: '10px',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            <span style={{ color: newProfileVer === v.id ? 'var(--accent-blue)' : 'white', fontWeight: 600 }}>{v.id}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{v.type.toUpperCase()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '3.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 2fr)', gap: '10px' }}>
                                    {['vanilla', 'fabric', 'forge', 'quilt', 'neoforge', 'liteloader'].map(l => (
                                        <button
                                            key={l}
                                            className={`pill-button ${newProfileLoader === l ? 'primary' : 'secondary'}`}
                                            style={{ fontSize: '0.65rem' }}
                                            onClick={() => setNewProfileLoader(l)}
                                        >
                                            {l.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {newProfileLoader !== 'vanilla' && loaderVersions.length > 0 && (
                                <div style={{ marginBottom: '2.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '1rem', letterSpacing: '2px' }}>LOADER_VERSION</label>
                                    <div className="glass-panel" style={{ padding: '0.5rem' }}>
                                        <select
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.8rem', outline: 'none', cursor: 'pointer' }}
                                            value={newProfileLoaderVer}
                                            onChange={(e) => setNewProfileLoaderVer(e.target.value)}
                                        >
                                            {loaderVersions.map(v => (
                                                <option key={v.id} value={v.id} style={{ background: '#111' }}>{v.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button className="pill-button primary" style={{ flex: 1 }} onClick={createProfile}>INITIALIZE</button>
                                <button className="pill-button secondary" style={{ flex: 1 }} onClick={() => setShowCreateProfile(false)}>CANCEL</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showInstanceSettings && editingProfile && (
                    <div className="modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ width: '650px', padding: '3.5rem' }}>
                            <Settings size={64} color="var(--accent-blue)" style={{ marginBottom: '2.5rem', filter: 'drop-shadow(0 0 15px var(--accent-blue))' }} />
                            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-header)', letterSpacing: '2px', marginBottom: '3rem' }}>STATION CONFIG</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '1rem', letterSpacing: '2px' }}>DISPLAY NAME</label>
                                    <div className="glass-panel" style={{ padding: '0.8rem 1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <input
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                                            type="text"
                                            value={editingProfile.name}
                                            onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', letterSpacing: '2px' }}>CORE VERSION: {editingProfile.version}</label>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '12px', marginBottom: '0.5rem' }}>
                                            <Search size={16} color="var(--text-dim)" />
                                            <input
                                                style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                                type="text"
                                                placeholder="Switch version..."
                                                value={vQuery}
                                                onChange={(e) => setVQuery(e.target.value)}
                                            />
                                        </div>
                                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            {filteredVersions.slice(0, 30).map(v => (
                                                <div
                                                    key={v.id}
                                                    onClick={() => setEditingProfile({ ...editingProfile, version: v.id })}
                                                    style={{
                                                        padding: '10px 15px',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        background: editingProfile.version === v.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                        cursor: 'pointer',
                                                        borderRadius: '8px',
                                                        marginBottom: '2px'
                                                    }}
                                                >
                                                    <span style={{ color: editingProfile.version === v.id ? 'var(--accent-blue)' : 'white', fontWeight: 600 }}>{v.id}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '1rem', letterSpacing: '2px' }}>LOADER ENGINE</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        {['vanilla', 'fabric', 'forge', 'quilt', 'neoforge', 'liteloader'].map(l => (
                                            <button
                                                key={l}
                                                className={`pill-button ${editingProfile.loader === l ? 'primary' : 'secondary'}`}
                                                style={{ background: editingProfile.loader === l ? 'var(--accent-purple)' : undefined, fontSize: '0.65rem' }}
                                                onClick={() => {
                                                    setEditingProfile({ ...editingProfile, loader: l, loaderVersion: '' });
                                                }}
                                            >
                                                {l.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {editingProfile.loader !== 'vanilla' && loaderVersions.length > 0 && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '1rem', letterSpacing: '2px' }}>LOADER VERSION</label>
                                        <div className="glass-panel" style={{ padding: '0.5rem' }}>
                                            <select
                                                style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.8rem', outline: 'none', cursor: 'pointer' }}
                                                value={editingProfile.loaderVersion || ''}
                                                onChange={(e) => setEditingProfile({ ...editingProfile, loaderVersion: e.target.value })}
                                            >
                                                <option value="" disabled>Select version...</option>
                                                {loaderVersions.map(v => (
                                                    <option key={v.id} value={v.id} style={{ background: '#111' }}>{v.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '2px' }}>MODULE SCANNER</label>
                                        <button className="pill-button secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }} onClick={async () => {
                                            const root = mcPath || await window.electron.autoLocateMc();
                                            const mods = await window.electron.getMods(root, editingProfile.name);
                                            setLocalMods(mods);
                                        }}>SCAN FOLDER</button>
                                    </div>

                                    {localMods && (
                                        <div className="glass-panel" style={{ maxHeight: '150px', overflowY: 'auto', padding: '0.5rem' }}>
                                            {localMods.length === 0 ? (
                                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>No modules detected.</div>
                                            ) : localMods.map(m => (
                                                <div key={m.path} style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', marginBottom: '2px', background: 'rgba(255,255,255,0.02)' }}>
                                                    <span style={{ fontSize: '0.85rem' }}>{m.name} <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>({(m.size / 1024 / 1024).toFixed(2)}MB)</span></span>
                                                    <button className="pill-button secondary" style={{ padding: '0.4rem', minWidth: 'auto', color: '#ff4d4d' }} onClick={async () => {
                                                        const success = await window.electron.deleteMod(m.path);
                                                        if (success) setLocalMods(localMods.filter(mod => mod.path !== m.path));
                                                    }}><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                                    <button className="pill-button primary" style={{ flex: 1 }} onClick={saveInstanceSettings}>SAVE CHANGES</button>
                                    <button className="pill-button secondary" style={{ flex: 1 }} onClick={() => setShowInstanceSettings(false)}>CANCEL</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {
                isReady && !isLoggedIn && (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '4rem', width: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ position: 'relative', marginBottom: '3rem' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', border: '2px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {user ? (
                                        <img src={`https://mc-heads.net/avatar/${user}/100`} style={{ width: '80px', height: '80px', imageRendering: 'pixelated' }} alt="Skin" />
                                    ) : (
                                        <UserIcon size={64} color="var(--accent-blue)" />
                                    )}
                                </div>
                                <div style={{ position: 'absolute', bottom: -5, right: -5, padding: '5px', background: 'var(--bg-deep)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <Rocket size={20} color="var(--accent-blue)" />
                                </div>
                            </div>

                            <h1 className="h1-glow" style={{ fontSize: '3rem', marginBottom: '1rem' }}>ECLIPSE_AUTH</h1>
                            <p style={{ color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '3rem', maxWidth: '400px' }}>
                                ENCRYPTED NEURAL LINK REQUIRED FOR STATION ACCESS. PLEASE PROVIDE PILOT IDENTIFIER.
                            </p>

                            <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} style={{ width: '100%' }}>
                                <div className="glass-panel" style={{ marginBottom: '1.5rem', width: '100%', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <UserIcon size={20} color="var(--accent-blue)" />
                                    <input
                                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '1rem' }}
                                        type="text"
                                        placeholder="MINECRAFT USERNAME..."
                                        value={user}
                                        onChange={(e) => setUser(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="pill-button primary" style={{ width: '100%', marginBottom: '1.5rem' }}>INITIALIZE PILOT SESSION</button>
                            </form>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', margin: '1rem 0', opacity: 0.3 }}>
                                <div style={{ flex: 1, height: '1px', background: 'white' }} />
                                <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>OR</span>
                                <div style={{ flex: 1, height: '1px', background: 'white' }} />
                            </div>

                            <button
                                type="button"
                                className="pill-button"
                                disabled={msAuthLoading}
                                style={{ width: '100%', background: '#0067b8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '1rem', opacity: msAuthLoading ? 0.5 : 1 }}
                                onClick={handleMicrosoftLogin}
                            >
                                <Lock size={20} /> {msAuthLoading ? 'AUTHENTICATING...' : 'SIGN IN WITH MICROSOFT'}
                            </button>
                        </motion.div>
                    </div>
                )
            }

            {isReady && isLoggedIn && (
                <main className="main-viewport">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{ height: '100%' }}
                        >
                            {activeTab === 'home' && (
                                <div className="dashboard-grid">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ width: '70px', height: '70px', borderRadius: '15px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                                <img src={`https://mc-heads.net/avatar/${user}/64`} style={{ width: '48px', height: '48px', imageRendering: 'pixelated' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div className="stat-header">Pilot Active</div>
                                                <div className="stat-value" style={{ fontSize: '1.4rem' }}>{user.toUpperCase() || 'ANONYMOUS'}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontSize: '0.7rem', fontWeight: 800, marginTop: '5px' }}>
                                                    <div style={{ width: '6px', height: '6px', background: 'var(--accent-blue)', borderRadius: '50%', boxShadow: '0 0 5px var(--accent-blue)' }} />
                                                    LINK_STABLE
                                                </div>
                                            </div>
                                        </div>

                                        <div className="glass-panel stat-card">
                                            <div className="stat-header">Eclipse Credits</div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                                <div className="stat-value">{eclipseCoins.toLocaleString()}</div>
                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700 }}>ECL</span>
                                            </div>
                                            <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                                                <div className="progress-fill" style={{ width: '65%' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="center-column">
                                        <div className="launch-container glass-panel">
                                            <Rocket size={64} color="var(--accent-blue)" style={{ filter: 'drop-shadow(0 0 15px var(--accent-blue))' }} />
                                            <div style={{ textAlign: 'center' }}>
                                                <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-header)', letterSpacing: '4px', marginBottom: '0.5rem' }}>ECLIPSE PRIME</h2>
                                                <div className="instance-pill">ACTIVE: {activeProf?.name || 'STABLE'}</div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="pill-button primary launch-btn"
                                                onClick={handleLaunch}
                                            >
                                                <Play size={24} fill="currentColor" />
                                                LAUNCH GAME
                                            </motion.button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div className="glass-panel stat-card">
                                            <div className="stat-header">Performance Profile</div>
                                            <div className="data-node">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                                    <span>Memory</span>
                                                    <span>{ram}MB</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div className="progress-fill" style={{ width: `${(ram / 16384) * 100}%` }} />
                                                </div>
                                            </div>
                                            <div className="data-node" style={{ marginTop: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                                    <span>Frame Limit</span>
                                                    <span>{fpsLimit} FPS</span>
                                                </div>
                                                <div className="progress-bar">
                                                    <div className="progress-fill" style={{ width: `${(fpsLimit / 480) * 100}%`, background: 'var(--accent-purple)' }} />
                                                </div>
                                            </div>
                                        </div>

                                        <button className="pill-button secondary" onClick={() => setActiveTab('settings')}>
                                            <Settings size={20} />
                                            OPEN SETTINGS
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'news' && (
                                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                                    <h1 style={{ marginBottom: '3rem', fontFamily: 'var(--font-header)', fontSize: '2.5rem', letterSpacing: '2px' }}>LATEST_UPDATES</h1>
                                    <div style={{ display: 'grid', gap: '2rem' }}>
                                        {NEWS_FEED.map(news => (
                                            <div key={news.id} className="glass-panel" style={{ padding: '2.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                    <span style={{ color: news.color, fontWeight: 800, letterSpacing: '2px', fontSize: '0.8rem' }}>{news.date}</span>
                                                    <div className="instance-pill" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'transparent' }}>VER_{news.id}.0</div>
                                                </div>
                                                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-header)' }}>{news.title}</h2>
                                                <p style={{ color: 'var(--text-dim)', lineHeight: '1.8' }}>{news.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'shop' && (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                                        <h1 style={{ fontFamily: 'var(--font-header)', fontSize: '2.5rem', letterSpacing: '2px' }}>MARKETPLACE</h1>
                                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '16px' }}>
                                            <button
                                                className={`pill-button ${shopSubTab === 'ranks' ? 'primary' : ''}`}
                                                style={{ padding: '0.6rem 2rem', fontSize: '0.8rem', boxShadow: shopSubTab === 'ranks' ? undefined : 'none', background: shopSubTab === 'ranks' ? undefined : 'transparent' }}
                                                onClick={() => setShopSubTab('ranks')}
                                            >MODULES</button>
                                            <button
                                                className={`pill-button ${shopSubTab === 'coins' ? 'primary' : ''}`}
                                                style={{ padding: '0.6rem 2rem', fontSize: '0.8rem', boxShadow: shopSubTab === 'coins' ? undefined : 'none', background: shopSubTab === 'coins' ? undefined : 'transparent' }}
                                                onClick={() => setShopSubTab('coins')}
                                            >CREDITS</button>
                                        </div>
                                    </div>

                                    <div className="grid-layout">
                                        {shopSubTab === 'ranks' ? (
                                            RANKS.map(rank => (
                                                <div key={rank.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', borderTop: `4px solid ${rank.color}` }}>
                                                    <div>
                                                        <Shield size={40} color={rank.color} style={{ marginBottom: '1rem' }} />
                                                        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-header)' }}>{rank.name}</h2>
                                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Permanent System Access</p>
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        {rank.perks.map(perk => (
                                                            <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                                                                <CheckCircle size={16} color={rank.color} />
                                                                {perk}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{rank.price}</div>
                                                        <button className="pill-button primary" style={{ padding: '0.8rem 1.5rem', background: rank.color }} onClick={() => setShowRankPreview(rank)}>PREVIEW</button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            [
                                                { title: 'STARDUST_BUNDLE', coins: 1000, price: '$5.00', color: 'var(--accent-blue)', url: 'https://paypal.me/eclipseclient/5' },
                                                { title: 'SUPERNOVA_PACK', coins: 3000, price: '$12.00', color: 'var(--accent-purple)', url: 'https://paypal.me/eclipseclient/12' },
                                                { title: 'GALACTIC_TREASURE', coins: 7500, price: '$25.00', color: 'var(--accent-pink)', url: 'https://paypal.me/eclipseclient/25' }
                                            ].map(pack => (
                                                <div key={pack.title} className="glass-panel" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                                    <Sparkles size={48} color={pack.color} style={{ margin: '0 auto' }} />
                                                    <div>
                                                        <h2 style={{ fontSize: '1.5rem' }}>{pack.coins.toLocaleString()} ECL</h2>
                                                        <p style={{ color: 'var(--text-dim)' }}>{pack.title}</p>
                                                    </div>
                                                    <button className="pill-button primary" style={{ width: '100%', background: pack.color }} onClick={() => setCheckoutItem({ ...pack, type: 'coins', value: pack.coins })}>
                                                        BUY FOR {pack.price}
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'events' && (
                                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                    <h1 style={{ marginBottom: '3rem', fontFamily: 'var(--font-header)', fontSize: '2.5rem' }}>UPCOMING_EVENTS</h1>
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {EVENTS.map(event => (
                                            <div key={event.id} className="glass-panel" style={{ display: 'flex', gap: '3rem', alignItems: 'center', padding: '2.5rem' }}>
                                                <div style={{ textAlign: 'center', minWidth: '100px', borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '2rem' }}>
                                                    <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 700 }}>{event.date.split(' ')[0]}</div>
                                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-header)' }}>{event.date.split(' ')[1]}</div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h2 style={{ fontSize: '1.8rem', color: event.color, letterSpacing: '1px' }}>{event.title}</h2>
                                                    <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem', fontSize: '1.1rem' }}>{event.desc}</p>
                                                </div>
                                                <button className="pill-button secondary" style={{ borderColor: event.color, color: event.color }}>JOIN SECTOR</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'servers' && (
                                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                    <h1 style={{ marginBottom: '3rem', fontFamily: 'var(--font-header)', fontSize: '2.5rem' }}>SERVER_HOSTING</h1>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                        <div className="glass-panel" style={{ padding: '2rem' }}>
                                            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Gamepad size={18} color="var(--accent-blue)" />
                                                Server Version
                                            </h2>
                                            <div className="glass-panel" style={{ padding: '0.5rem' }}>
                                                <select
                                                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', padding: '0.8rem', outline: 'none', cursor: 'pointer' }}
                                                    value={serverVersion}
                                                    onChange={(e) => setServerVersion(e.target.value)}
                                                >
                                                    {versions.filter(v => v.type === 'release').slice(0, 20).map(v => (
                                                        <option key={v.id} value={v.id} style={{ background: '#111' }}>{v.id}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '1rem' }}>Server runs locally on your computer. While the launcher is open and the server is running, other players can connect to your IP.</p>
                                        </div>

                                        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '60px', height: '60px', borderRadius: '50%',
                                                background: serverRunning ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 77, 77, 0.1)',
                                                border: `2px solid ${serverRunning ? '#10b981' : 'rgba(255,77,77,0.3)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    background: serverRunning ? '#10b981' : '#ff4d4d',
                                                    boxShadow: serverRunning ? '0 0 15px #10b981' : 'none'
                                                }} />
                                            </div>
                                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: serverRunning ? '#10b981' : 'var(--text-dim)' }}>
                                                {serverRunning ? 'ONLINE' : 'OFFLINE'}
                                            </span>
                                            <button
                                                className={`pill-button ${serverRunning ? 'secondary' : 'primary'}`}
                                                style={{
                                                    width: '100%',
                                                    background: serverRunning ? undefined : 'linear-gradient(135deg, #10b981, #3b82f6)',
                                                    color: serverRunning ? '#ff4d4d' : undefined,
                                                    borderColor: serverRunning ? 'rgba(255,77,77,0.3)' : undefined
                                                }}
                                                onClick={async () => {
                                                    if (serverRunning) {
                                                        await window.electron.stopServer();
                                                        setServerRunning(false);
                                                        setServerConsole(prev => [...prev, '> Server stopped.']);
                                                    } else {
                                                        setServerConsole(['> Starting server...']);
                                                        const res = await window.electron.startServer({ version: serverVersion, mcPath: mcPath || '', properties: serverProperties });
                                                        if (res.success) {
                                                            setServerRunning(true);
                                                            setServerConsole(prev => [...prev, '> Server started on port ' + (serverProperties['server-port'] || '25565')]);
                                                        } else {
                                                            setServerConsole(prev => [...prev, '> ERROR: ' + res.error]);
                                                        }
                                                    }
                                                }}
                                            >
                                                {serverRunning ? 'SHUTDOWN' : 'IGNITE SERVER'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Settings size={18} color="var(--accent-purple)" />
                                            Server Properties
                                        </h2>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            {Object.entries(serverProperties).map(([key, val]) => (
                                                <div key={key}>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.5rem', letterSpacing: '1px' }}>{key.toUpperCase().replace(/-/g, '_')}</label>
                                                    {key === 'gamemode' ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            {['survival', 'creative', 'adventure', 'spectator'].map(m => (
                                                                <button
                                                                    key={m}
                                                                    className={`pill-button ${val === m ? 'primary' : 'secondary'}`}
                                                                    style={{ fontSize: '0.65rem', padding: '0.4rem 0.8rem', flex: 1 }}
                                                                    onClick={() => setServerProperties(p => ({ ...p, [key]: m }))}
                                                                >{m.toUpperCase()}</button>
                                                            ))}
                                                        </div>
                                                    ) : key === 'difficulty' ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            {['peaceful', 'easy', 'normal', 'hard'].map(d => (
                                                                <button
                                                                    key={d}
                                                                    className={`pill-button ${val === d ? 'primary' : 'secondary'}`}
                                                                    style={{ fontSize: '0.65rem', padding: '0.4rem 0.8rem', flex: 1 }}
                                                                    onClick={() => setServerProperties(p => ({ ...p, [key]: d }))}
                                                                >{d.toUpperCase()}</button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <input
                                                            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '0.6rem 1rem', borderRadius: '10px', outline: 'none' }}
                                                            value={val}
                                                            onChange={(e) => setServerProperties(p => ({ ...p, [key]: e.target.value }))}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                        <h2 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Terminal size={16} color="var(--accent-green)" />
                                            Server Console
                                        </h2>
                                        <div style={{
                                            background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '1rem',
                                            maxHeight: '250px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', color: '#10b981'
                                        }}>
                                            {serverConsole.length === 0 ? (
                                                <span style={{ color: 'var(--text-dim)' }}>// Server output will appear here</span>
                                            ) : serverConsole.map((line, i) => (
                                                <div key={i}>{line}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'wallpapers' && (
                                <div>
                                    <h1 style={{ marginBottom: '3rem', fontFamily: 'var(--font-header)', fontSize: '2.5rem' }}>VISUAL_ASSETS</h1>
                                    <div className="grid-layout">
                                        {BACKGROUNDS.map(bg => (
                                            <div
                                                key={bg.id}
                                                className={`glass-panel ${activeBg === bg.id ? 'active' : ''}`}
                                                style={{ textAlign: 'center', cursor: 'pointer', borderColor: activeBg === bg.id ? 'var(--accent-blue)' : undefined }}
                                                onClick={() => setActiveBg(bg.id)}
                                            >
                                                <div style={{ width: '100%', aspectRatio: '16/9', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {bg.url && bg.url.endsWith('.mp4') ? (
                                                        <video src={bg.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <ImageIcon size={48} color="rgba(255,255,255,0.1)" />
                                                    )}
                                                </div>
                                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{bg.name.toUpperCase()}</h3>
                                                <button className={`pill-button ${activeBg === bg.id ? 'primary' : 'secondary'}`} style={{ width: '100%' }}>
                                                    {activeBg === bg.id ? 'ACTIVE' : 'APPLY'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'profiles' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                                        <h1 style={{ fontFamily: 'var(--font-header)', fontSize: '2.5rem' }}>STATIONS</h1>
                                        <button className="pill-button primary" onClick={() => setShowCreateProfile(true)}>
                                            <Plus size={20} />
                                            NEW STATION
                                        </button>
                                    </div>
                                    <div className="grid-layout">
                                        {profiles.map(p => (
                                            <div key={p.name} className={`glass-panel profile-card ${p.active ? 'active' : ''}`}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Box size={48} color={p.active ? 'var(--accent-blue)' : 'var(--text-dim)'} />
                                                    <div className="instance-pill">{p.version}</div>
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{p.name.toUpperCase()}</h3>
                                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>ENGINE: {p.loader?.toUpperCase() || 'VANILLA'}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                                    <button
                                                        className={`pill-button ${p.active ? 'primary' : 'secondary'}`}
                                                        style={{ flex: 1 }}
                                                        onClick={() => setProfiles(profiles.map(pr => ({ ...pr, active: pr.name === p.name })))}
                                                    >
                                                        {p.active ? 'CONNECTED' : 'CONNECT'}
                                                    </button>
                                                    <button className="pill-button secondary" style={{ padding: '0 1rem' }} onClick={() => openInstanceSettings(p)}><Settings size={18} /></button>
                                                    <button className="pill-button secondary" style={{ padding: '0 1rem', color: '#ff4d4d' }} onClick={() => setProfiles(profiles.filter(pr => pr.name !== p.name))}><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                    <h1 style={{ marginBottom: '4rem', fontFamily: 'var(--font-header)', fontSize: '2.5rem' }}>CONFIGURATION</h1>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                        <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                            <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Volume2 size={20} color="var(--accent-pink)" />
                                                Neural Audio Output
                                            </h2>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                                {TRACKS.map((t, idx) => (
                                                    <button
                                                        key={t.id}
                                                        className={`pill-button ${trackIdx === idx ? 'primary' : 'secondary'}`}
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            justifyContent: 'flex-start',
                                                            background: trackIdx === idx ? 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))' : undefined,
                                                            borderColor: trackIdx === idx ? 'transparent' : undefined
                                                        }}
                                                        onClick={() => setTrackIdx(idx)}
                                                    >
                                                        <Sparkles size={14} />
                                                        <div style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {t.name.toUpperCase()}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                            <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Monitor size={20} color="var(--accent-blue)" />
                                                Visual Interface Theme
                                            </h2>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                                {THEMES.map(t => (
                                                    <button
                                                        key={t.id}
                                                        className={`pill-button ${activeTheme === t.id ? 'primary' : 'secondary'}`}
                                                        style={{ background: activeTheme === t.id ? t.color1 : undefined }}
                                                        onClick={() => setTheme(t.id)}
                                                    >
                                                        {t.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                                <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Cpu size={20} color="var(--accent-blue)" />
                                                    Memory Allocation
                                                </h2>
                                                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>{ram} MB</div>
                                                <input type="range" min="1024" max="16384" step="1024" value={ram} onChange={(e) => setRam(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-blue)' }} />
                                            </div>

                                            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                                <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Zap size={20} color="var(--accent-purple)" />
                                                    Refresh Rate
                                                </h2>
                                                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>{fpsLimit} FPS</div>
                                                <input type="range" min="30" max="480" step="30" value={fpsLimit} onChange={(e) => setFpsLimit(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-purple)' }} />
                                            </div>
                                        </div>

                                        <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                            <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Shield size={20} color="var(--accent-blue)" />
                                                System Overrides
                                            </h2>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700 }}>Performance Ignition</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Optimize system resources for maximum stability.</div>
                                                    </div>
                                                    <button
                                                        className={`pill-button ${isPerformanceMode ? 'primary' : 'secondary'}`}
                                                        style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem' }}
                                                        onClick={() => setIsPerformanceMode(!isPerformanceMode)}
                                                    >
                                                        {isPerformanceMode ? 'ENABLED' : 'DISABLED'}
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700 }}>Discord Neural Link</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Broadcast mission status to the Discord network.</div>
                                                    </div>
                                                    <button
                                                        className={`pill-button ${isDiscordRPC ? 'primary' : 'secondary'}`}
                                                        style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem' }}
                                                        onClick={() => setIsDiscordRPC(!isDiscordRPC)}
                                                    >
                                                        {isDiscordRPC ? 'ENABLED' : 'DISABLED'}
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700 }}>Auto-Connect Protocol</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Automatically initialize session on startup.</div>
                                                    </div>
                                                    <button
                                                        className={`pill-button ${autoConnect ? 'primary' : 'secondary'}`}
                                                        style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem' }}
                                                        onClick={() => setAutoConnect(!autoConnect)}
                                                    >
                                                        {autoConnect ? 'ENABLED' : 'DISABLED'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="glass-panel" style={{ padding: '2.5rem' }}>
                                            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Folder size={20} color="var(--accent-green)" />
                                                Station Storage Path
                                            </h2>
                                            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <code style={{ flex: 1, color: 'var(--text-dim)', alignSelf: 'center' }}>{mcPath || "DEFAULT_CORE_SECTOR"}</code>
                                                <button className="pill-button secondary" style={{ padding: '0.6rem 1.5rem' }} onClick={async () => { const p = await window.electron.selectFolder(); if (p) setMcPath(p); }}>CHANGE</button>
                                            </div>
                                        </div>

                                        <button
                                            className="pill-button secondary"
                                            style={{ width: 'fit-content', color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.2)' }}
                                            onClick={handleSignOut}
                                        >
                                            {isMsAuth ? 'SIGN OUT (MICROSOFT)' : 'DEAUTHORIZE PILOT'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'search' && (
                                <div style={{ height: '100%' }}>
                                    <ModExplorer
                                        mcPath={mcPath}
                                        activeProfile={activeProf}
                                        onDownload={() => {
                                            setLogs(prev => [
                                                ...prev,
                                                { type: 'system', message: `MODULE_DEPLOYED_SUCCESSFULLY`, timestamp: new Date().toLocaleTimeString() }
                                            ]);
                                        }}
                                    />
                                </div>
                            )}

                            {activeTab === 'logs' && (
                                <LogTerminal logs={logs} />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {checkoutItem && (
                        <div className="modal-overlay" style={{ zIndex: 30000, background: 'rgba(0,0,0,0.85)' }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="glass-panel"
                                style={{ width: '500px', padding: '3rem', textAlign: 'center', borderColor: 'var(--accent-blue)', boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)' }}
                            >
                                {isProcessingPayment ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} style={{ marginBottom: '2rem' }}>
                                            <Shield size={64} color="var(--accent-blue)" style={{ filter: 'drop-shadow(0 0 20px #3b82f6)' }} />
                                        </motion.div>
                                        <h2 className="h2-glow" style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-blue)' }}>AUTHORIZING_FUNDS</h2>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', letterSpacing: '2px' }}>ESTABLISHING_SECURE_TUNNEL_TO_BANKING_CORE...</p>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <ShoppingCart size={48} color="var(--accent-pink)" style={{ filter: 'drop-shadow(0 0 15px #ec4899)', marginBottom: '1.5rem' }} />
                                        <h2 className="h2-glow" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>CONFIRM_TRANSACTION</h2>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '3rem' }}>UPLINK_AWAITING_APPROVAL</p>

                                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px', padding: '2rem', marginBottom: '3rem', textAlign: 'left' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <span style={{ color: 'var(--text-dim)' }}>ITEM_ORBIT_ID</span>
                                                <span style={{ fontWeight: 950, color: 'white' }}>{checkoutItem.title}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <span style={{ color: 'var(--text-dim)' }}>COMMERCE_PROTOCOL</span>
                                                <span style={{ fontWeight: 950, color: 'var(--accent-blue)' }}>PAYPAL_BRIDGE_V2</span>
                                            </div>
                                            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: 'white', fontSize: '1.2rem', fontWeight: 950 }}>TOTAL_DUE</span>
                                                <span style={{ color: 'var(--accent-green)', fontSize: '2rem', fontWeight: 950, textShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>{checkoutItem.price}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <button
                                                type="button"
                                                className="pill-button drag-none"
                                                style={{ background: 'var(--accent-blue)', color: 'white' }}
                                                onClick={() => {
                                                    setIsProcessingPayment(true);
                                                    setTimeout(() => {
                                                        if (checkoutItem.type === 'coins') {
                                                            setEclipseCoins(prev => prev + checkoutItem.value);
                                                        }
                                                        window.electron.openExternal(checkoutItem.url);
                                                        setCheckoutItem(null);
                                                        setIsProcessingPayment(false);
                                                    }, 2500);
                                                }}
                                            >
                                                AUTHORIZE
                                            </button>
                                            <button
                                                type="button"
                                                className="pill-button drag-none"
                                                style={{ background: 'rgba(232, 17, 35, 0.1)', color: '#e81123', border: '1px solid rgba(232,17,35,0.2)' }}
                                                onClick={() => setCheckoutItem(null)}
                                            >
                                                ABORT
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>
                    )}

                    {isDiscordLinking && (
                        <div className="modal-overlay" style={{ zIndex: 20000, background: 'rgba(0,0,0,0.95)' }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-panel"
                                style={{ padding: '4rem', textAlign: 'center', maxWidth: '500px' }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    style={{ marginBottom: '2rem' }}
                                >
                                    <MessageCircle size={64} color="var(--accent-blue)" style={{ filter: 'drop-shadow(0 0 20px #3b82f6)' }} />
                                </motion.div>
                                <h1 className="h1-glow" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>ESTABLISHING_UPLINK</h1>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', letterSpacing: '2px' }}>CONNECTING_TO_DISCORD_SECTOR_7...</p>
                                <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.05)', marginTop: '2rem', borderRadius: '1px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 3 }}
                                        style={{ height: '100%', background: 'var(--accent-blue)' }}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {showRankPreview && (
                        <div className="modal-overlay" style={{ zIndex: 20000 }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-panel"
                                style={{ padding: '4rem', textAlign: 'left', maxWidth: '600px', borderColor: showRankPreview.color }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <Shield size={48} color={showRankPreview.color} />
                                        <h1 className="h1-glow" style={{ fontSize: '2.5rem', margin: 0 }}>{showRankPreview.name}_PROTO</h1>
                                    </div>
                                    <button type="button" onClick={() => setShowRankPreview(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={32} /></button>
                                </div>

                                <div style={{ marginBottom: '3rem' }}>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                                        High-intensity cosmetic enhancement protocols for elite pilots. The {showRankPreview.name} license provides permanent access to core system overrides and visual synchronization modules.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        {showRankPreview.perks.map(p => (
                                            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 600 }}>
                                                <CheckCircle size={18} color={showRankPreview.color} />
                                                {p.toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '2rem', textAlign: 'center' }}>
                                    <AlertTriangle size={32} color="#fbbf24" style={{ marginBottom: '1rem' }} />
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>COMMERCE_SUSPENDED</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>DIRECT_ACQUISITION_PROTOCOL_IS_CURRENTLY_OFFLINE_FOR_MAINTENANCE.</p>
                                    <button
                                        type="button"
                                        className="pill-button"
                                        style={{ width: '100%', marginTop: '2rem', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                        onClick={() => setShowRankPreview(null)}
                                    >
                                        ACKNOWLEDGE_PREVIEW
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </main>
            )
            }
            {showUpdateModal && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-panel"
                        style={{ width: '450px', padding: '3rem', textAlign: 'center' }}
                    >
                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', border: '2px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Download size={30} color="var(--accent-blue)" />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-header)', marginBottom: '1rem' }}>UPDATE AVAILABLE</h2>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>You are running an older version of Eclipse Client.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                            <div style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.2)', padding: '0.6rem 1.2rem', borderRadius: '10px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>CURRENT</span><br />
                                <span style={{ fontWeight: 800, color: '#ff4d4d' }}>v1.0.0</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}><ArrowRight size={20} color="var(--text-dim)" /></div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.6rem 1.2rem', borderRadius: '10px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>LATEST</span><br />
                                <span style={{ fontWeight: 800, color: '#10b981' }}>v{latestVersion}</span>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '2rem' }}>Please update to get the latest features and bug fixes.</p>
                        <button
                            className="pill-button primary"
                            style={{ width: '100%', height: '50px', fontSize: '1rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', marginBottom: '1rem' }}
                            onClick={() => window.electron.openExternal('https://github.com/eclipse-client/launcher/releases/latest')}
                        >
                            <Download size={18} style={{ marginRight: '10px' }} />
                            UPDATE LAUNCHER
                        </button>
                        <button
                            className="pill-button secondary"
                            style={{ width: '100%', height: '40px', fontSize: '0.8rem' }}
                            onClick={() => setShowUpdateModal(false)}
                        >
                            REMIND ME LATER
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default App;
