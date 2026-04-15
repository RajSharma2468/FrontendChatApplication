import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import messageReducer from './slices/messageSlice';
import roomReducer from './slices/roomSlice';
import presenceReducer from './slices/presenceSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        messages: messageReducer,
        rooms: roomReducer,
        presence: presenceReducer,
        notifications: notificationReducer
    }
});

// Also export as default for compatibility
export default store;