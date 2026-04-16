import { authApi } from '../../utils/axiosConfig';
import { AUTH_API_URL } from '../../utils/constants';  // ← ADD THIS

// Register new user
export const register = async (userData) => {
    const response = await authApi.post('/api/Auth/register', userData);
    return response.data;
};

// Login user
export const login = async (credentials) => {
    const response = await authApi.post('/api/Auth/login', credentials);
    return response.data;
};

// Logout user
export const logout = async () => {
    const response = await authApi.post('/api/Auth/logout');
    return response.data;
};

// Get user profile
export const getProfile = async () => {
    const response = await authApi.get('/api/User/profile');
    return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
    const response = await authApi.put('/api/User/profile', profileData);
    return response.data;
};

// Search users
export const searchUsers = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
        return { success: true, data: [] };
    }
    const response = await authApi.get(`/api/User/search?q=${encodeURIComponent(keyword)}`);
    return response.data;
};

// Get user by ID
export const getUserById = async (userId) => {
    const response = await authApi.get(`/api/Auth/${userId}`);
    return response.data;
};

// ================================================================
// GOOGLE LOGIN - USE ENVIRONMENT VARIABLE
// ================================================================
export const googleLogin = () => {
    window.location.href = `${AUTH_API_URL}/api/Auth/google-login`;
};

// ================================================================
// GOOGLE CALLBACK
// ================================================================
export const handleGoogleCallback = async (token, userId, displayName, username) => {
    localStorage.setItem('connecthub_token', token);
    localStorage.setItem('connecthub_user', JSON.stringify({
        id: parseInt(userId),
        displayName: decodeURIComponent(displayName),
        username: username,
        role: 'USER'
    }));
    
    return {
        success: true,
        user: {
            id: parseInt(userId),
            displayName: decodeURIComponent(displayName),
            username: username,
            role: 'USER'
        },
        token: token
    };
};