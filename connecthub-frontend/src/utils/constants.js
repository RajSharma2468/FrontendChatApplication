// API endpoints
export const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5046';

// Auth endpoints (explicit)
export const AUTH_API_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:5046';
export const MESSAGING_API_URL = process.env.REACT_APP_MESSAGING_URL || 'http://localhost:5289';
export const ROOM_API_URL = process.env.REACT_APP_ROOM_URL || 'http://localhost:5283';
export const MEDIA_API_URL = process.env.REACT_APP_MEDIA_URL || 'http://localhost:5047';

// SignalR endpoints
export const SIGNALR_PRESENCE_URL = process.env.REACT_APP_SIGNALR_PRESENCE_URL || 'http://localhost:5289/presenceHub';
export const SIGNALR_NOTIFICATION_URL = process.env.REACT_APP_SIGNALR_NOTIFICATION_URL || 'http://localhost:5289/notificationHub';

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