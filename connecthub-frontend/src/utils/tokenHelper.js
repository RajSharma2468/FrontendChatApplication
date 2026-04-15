import { TOKEN_KEY, USER_KEY } from './constants';

// Save token to localStorage
export const saveToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

// Get token from localStorage
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

// Remove token from localStorage
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// Save user data
export const saveUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get user data
export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

// Check if user is logged in
export const isAuthenticated = () => {
    return !!getToken();
};