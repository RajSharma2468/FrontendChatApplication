import { createSlice } from '@reduxjs/toolkit';
import { getUser, saveUser, removeToken, saveToken } from '../../utils/tokenHelper';

const initialState = {
    user: getUser(),
    token: localStorage.getItem('connecthub_token'),
    isAuthenticated: !!localStorage.getItem('connecthub_token'),
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            saveToken(action.payload.token);
            saveUser(action.payload.user);
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            removeToken();
        },
        clearError: (state) => {
            state.error = null;
        }
    }
});

// Export all actions
export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;

// Also export login as alias for loginStart (for compatibility)
export const login = loginStart;

export default authSlice.reducer;