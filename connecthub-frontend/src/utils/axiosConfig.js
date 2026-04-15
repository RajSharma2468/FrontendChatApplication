import axios from 'axios';
import { getToken, removeToken } from './tokenHelper';
import { AUTH_API_URL, MESSAGING_API_URL, ROOM_API_URL, MEDIA_API_URL } from './constants';

// ================================================================
// Create separate instances for each service
// ================================================================

// Auth Service (Login, Register, Profile, Google Auth)
export const authApi = axios.create({
    baseURL: AUTH_API_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

// Messaging Service (Chats, Messages, Recent Chats)
export const messagingApi = axios.create({
    baseURL: MESSAGING_API_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

// Room Service (Rooms, Groups)
export const roomApi = axios.create({
    baseURL: ROOM_API_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

// Media Service (File Uploads)
export const mediaApi = axios.create({
    baseURL: MEDIA_API_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

// Notification Service (Same as Messaging)
export const notificationApi = axios.create({
    baseURL: MESSAGING_API_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

// ================================================================
// Add token interceptor to all instances
// ================================================================
const addTokenInterceptor = (apiInstance) => {
    apiInstance.interceptors.request.use(
        (config) => {
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    apiInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                removeToken();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

// Apply interceptors to all instances
addTokenInterceptor(authApi);
addTokenInterceptor(messagingApi);
addTokenInterceptor(roomApi);
addTokenInterceptor(mediaApi);
addTokenInterceptor(notificationApi);

// Default export for backward compatibility (Auth API)
export default authApi;