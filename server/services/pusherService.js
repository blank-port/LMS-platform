import Pusher from 'pusher';
import Setting from '../models/Setting.js';

let pusherInstance = null;

export const getPusherInstance = async () => {
    if (pusherInstance) return pusherInstance;

    try {
        // Priority 1: Environment Variables (Production Managed)
        const envConfig = {
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.PUSHER_CLUSTER || 'ap2',
            useTLS: true
        };

        if (envConfig.appId && envConfig.key && envConfig.secret) {
            console.log('[PUSHER] Logic: Initializing via Environment Variables.');
            pusherInstance = new Pusher(envConfig);
            return pusherInstance;
        }

        // Priority 2: Database Settings (Admin UI Managed)
        const settings = await Setting.find({ key: { $regex: /^pusher_/ } });
        const config = {};
        settings.forEach(s => config[s.key] = s.value);

        if (config.pusher_active && config.pusher_app_id && config.pusher_app_key && config.pusher_app_secret) {
            console.log('[PUSHER] Logic: Initializing via Database Settings.');
            pusherInstance = new Pusher({
                appId: config.pusher_app_id,
                key: config.pusher_app_key,
                secret: config.pusher_app_secret,
                cluster: config.pusher_cluster || 'ap2',
                useTLS: config.pusher_encrypted !== false,
            });
            return pusherInstance;
        }

        console.log('[PUSHER] Logic: Not fully configured or inactive.');
        return null;
    } catch (error) {
        console.error('[PUSHER] Initialization Error:', error.message);
        return null;
    }
};

export const broadcast = async (channel, event, data) => {
    const pusher = await getPusherInstance();
    if (pusher) {
        try {
            await pusher.trigger(channel, event, data);
        } catch (error) {
            console.error('[PUSHER] Broadcast Error:', error.message);
        }
    }
};

/**
 * Resets the pusher instance.
 * Call this when pusher-related settings are updated.
 */
export const resetPusherInstance = () => {
    pusherInstance = null;
    console.log('[PUSHER] Instance reset initiated.');
};
