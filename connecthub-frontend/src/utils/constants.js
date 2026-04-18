const GATEWAY = process.env.REACT_APP_API_BASE_URL || 'https://connecthub-gateway-g4gpfvdrgucrcgh4.centralus-01.azurewebsites.net';

// API endpoints - Sab Gateway se jayenge
export const API_URL = GATEWAY;
export const AUTH_API_URL = GATEWAY;
export const MESSAGING_API_URL = GATEWAY;
export const ROOM_API_URL = GATEWAY;
export const MEDIA_API_URL = GATEWAY;

// SignalR endpoints - Direct service URLs
export const SIGNALR_PRESENCE_URL = process.env.REACT_APP_SIGNALR_PRESENCE_URL || 'https://connecthub-presence-gtbsejaud4hcetc2.centralus-01.azurewebsites.net/presenceHub';
export const SIGNALR_NOTIFICATION_URL = process.env.REACT_APP_SIGNALR_NOTIFICATION_URL || 'https://connecthub-notification-g8h8f3gcdhfyc6e4.centralus-01.azurewebsites.net/notificationHub';

// Local storage keys
export const TOKEN_KEY = 'connecthub_token';
export const USER_KEY = 'connecthub_user';

// Message types
export const MESSAGE_TYPES = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    FILE: 'FILE',
    AUDIO: 'AUDIO'
};

// Notification types
export const NOTIFICATION_TYPES = {
    MESSAGE: 'MESSAGE',
    MENTION: 'MENTION',
    ROOM_JOIN: 'ROOM_JOIN',
    ROLE_CHANGE: 'ROLE_CHANGE',
    PLATFORM: 'PLATFORM'
};

// Room types
export const ROOM_TYPES = {
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE'
};

// User roles
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    MODERATOR: 'MODERATOR'
};