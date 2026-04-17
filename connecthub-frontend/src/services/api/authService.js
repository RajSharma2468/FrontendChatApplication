import { authApi } from '../../utils/axiosConfig';

// Register new user
export const register = async (userData) => {
    const response = await authApi.post('/api/Auth/register', userData);  // Capital 'A'
    return response.data;
};

// Login user
export const login = async (credentials) => {
    const response = await authApi.post('/api/Auth/login', credentials);  // Capital 'A'
    return response.data;
};

// Logout user
export const logout = async () => {
    const response = await authApi.post('/api/Auth/logout');
    return response.data;
};

// Get user profile
export const getProfile = async () => {
    const response = await authApi.get('/api/User/profile');  // Capital 'U'
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
    const response = await authApi.get(`/api/User/search?q=${encodeURIComponent(keyword)}`);  // Capital 'U'
    return response.data;
};

// Get user by ID
export const getUserById = async (userId) => {
    const response = await authApi.get(`/api/Auth/${userId}`);  // Capital 'A'
    return response.data;
};

// ================================================================
// GOOGLE LOGIN - Redirect to backend Google OAuth
// ================================================================
export const googleLogin = () => {
    window.location.href = 'http://localhost:5046/api/Auth/google-login';  // Capital 'A'
};

// ================================================================
// GOOGLE CALLBACK - Handle Google OAuth callback
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