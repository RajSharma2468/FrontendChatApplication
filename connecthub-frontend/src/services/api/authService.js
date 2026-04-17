import { authApi } from '../../utils/axiosConfig';
import { AUTH_API_URL } from '../../utils/constants';

// Register new user
export const register = async (userData) => {
    try {
        const response = await authApi.post('/api/Auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Registration API Error:', error.response?.status, error.response?.data);
        
        // Extract the actual error message from backend
        if (error.response?.data?.errors) {
            // Handle validation errors
            const errors = error.response.data.errors;
            const errorMessage = Object.values(errors).flat().join(', ');
            throw new Error(errorMessage);
        } else if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.response?.data?.title) {
            throw new Error(error.response.data.title);
        }
        throw error;
    }
};

// Login user
export const login = async (credentials) => {
    try {
        const response = await authApi.post('/api/Auth/login', credentials);
        return response.data;
    } catch (error) {
        console.error('Login API Error:', error.response?.status, error.response?.data);
        throw error;
    }
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