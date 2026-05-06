import { AccessToken } from 'livekit-server-sdk';
import Setting from '../models/Setting.js';

const LIVEKIT_SETTING_KEYS = ['livekit_url', 'livekit_api_key', 'livekit_api_secret'];

const getLiveKitStoredSettings = async () => {
    const rows = await Setting.find({ key: { $in: LIVEKIT_SETTING_KEYS } });
    const settings = {
        livekit_url: '',
        livekit_api_key: '',
        livekit_api_secret: ''
    };

    rows.forEach((row) => {
        settings[row.key] = row.value || '';
    });

    return settings;
};

export const getLiveKitConfig = async () => {
    let url = process.env.LIVEKIT_URL || '';
    let apiKey = process.env.LIVEKIT_API_KEY || '';
    let apiSecret = process.env.LIVEKIT_API_SECRET || '';

    try {
        const stored = await getLiveKitStoredSettings();

        if (stored.livekit_url) url = stored.livekit_url;
        if (stored.livekit_api_key) apiKey = stored.livekit_api_key;
        if (stored.livekit_api_secret) apiSecret = stored.livekit_api_secret;
    } catch (e) {
        console.error("Error fetching LiveKit settings:", e);
    }

    return { url, apiKey, apiSecret };
};

export const getLiveKitAdminSnapshot = async () => {
    const stored = await getLiveKitStoredSettings();
    const effective = await getLiveKitConfig();

    const hasStoredUrl = Boolean(stored.livekit_url);
    const hasStoredApiKey = Boolean(stored.livekit_api_key);
    const hasStoredSecret = Boolean(stored.livekit_api_secret);
    const hasEnvUrl = Boolean(process.env.LIVEKIT_URL);
    const hasEnvApiKey = Boolean(process.env.LIVEKIT_API_KEY);
    const hasEnvSecret = Boolean(process.env.LIVEKIT_API_SECRET);

    const readiness = {
        hasUrl: Boolean(effective.url),
        hasApiKey: Boolean(effective.apiKey),
        hasSecret: Boolean(effective.apiSecret),
        configured: Boolean(effective.url && effective.apiKey && effective.apiSecret),
        source:
            hasStoredUrl || hasStoredApiKey || hasStoredSecret
                ? (hasEnvUrl || hasEnvApiKey || hasEnvSecret ? 'mixed' : 'database')
                : (hasEnvUrl || hasEnvApiKey || hasEnvSecret ? 'environment' : 'missing')
    };

    return {
        settings: {
            livekit_url: stored.livekit_url || '',
            livekit_api_key: stored.livekit_api_key || '',
            livekit_api_secret: hasStoredSecret ? '__configured__' : ''
        },
        secretConfigured: hasStoredSecret,
        readiness
    };
};

export const isLiveKitConfigured = async () => {
    const { url, apiKey, apiSecret } = await getLiveKitConfig();
    return Boolean(url && apiKey && apiSecret);
};

export const getLiveKitPublicConfig = async () => {
    const { url } = await getLiveKitConfig();
    const configured = await isLiveKitConfigured();
    return {
        url,
        configured
    };
};

export const createLiveKitToken = async ({ identity, name, roomName, role }) => {
    const { apiKey, apiSecret } = await getLiveKitConfig();
    if (!apiKey || !apiSecret) {
        throw new Error('LiveKit credentials are not configured');
    }

    const token = new AccessToken(apiKey, apiSecret, {
        identity,
        name,
        ttl: '2h'
    });

    const isEducator = role === 'instructor' || role === 'admin';

    token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
        canUpdateOwnMetadata: true,
        canPublishSources: isEducator ? ['camera', 'microphone', 'screen_share', 'screen_share_audio'] : ['camera', 'microphone']
    });

    return token.toJwt();
};
