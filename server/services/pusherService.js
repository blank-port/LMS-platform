import Pusher from 'pusher';
import Setting from '../models/Setting.js';

let pusherInstance = null;

export const getPusherInstance = async () => {
    if (pusherInstance) return pusherInstance;

    try {
        const settings = await Setting.find({ key: { $regex: /^pusher_/ } });
        const config = {};
        settings.forEach(s => config[s.key] = s.value);

        if (!config.pusher_active || !config.pusher_app_id || !config.pusher_app_key || !config.pusher_app_secret) {
            console.log('[PUSHER] Logic: Not fully configured or inactive.');
            return null;
        }

        pusherInstance = new Pusher({
            appId: config.pusher_app_id,
            key: config.pusher_app_key,
            secret: config.pusher_app_secret,
            cluster: config.pusher_cluster || 'ap2',
            useTLS: config.pusher_encrypted !== false,
        });

        return pusherInstance;
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
