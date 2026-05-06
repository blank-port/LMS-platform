import Setting from '../models/Setting.js';

let cache = null;
let cacheTimestamp = 0;
const TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches all settings and caches them.
 * @returns {Promise<Object>} Object with key-value pairs of settings
 */
export const getSettings = async () => {
    if (cache && (Date.now() - cacheTimestamp < TTL)) {
        return cache;
    }

    const settings = await Setting.find();
    cache = Object.fromEntries(settings.map(s => [s.key, s.value]));
    cacheTimestamp = Date.now();
    return cache;
};

/**
 * Gets a specific setting by key.
 * @param {string} key - The setting key
 * @param {*} fallback - Fallback value if setting not found
 * @returns {Promise<*>} The setting value or fallback
 */
export const getSetting = async (key, fallback = null) => {
    const settings = await getSettings();
    return settings[key] ?? fallback;
};

/**
 * Manually invalidates the settings cache.
 * Call this when a setting is updated.
 */
export const invalidateSettingsCache = () => {
    cache = null;
    cacheTimestamp = 0;
};
