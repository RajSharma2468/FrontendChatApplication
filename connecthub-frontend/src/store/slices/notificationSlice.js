import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notifications: [],
    unreadCount: 0
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount++;
            }
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        markAsRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount--;
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => n.isRead = true);
            state.unreadCount = 0;
        }
    }
});

export const { setNotifications, addNotification, setUnreadCount, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;