import { notificationApi } from '../../utils/axiosConfig';

// Get my notifications
export const getNotifications = async (page = 1, pageSize = 20) => {
    const response = await notificationApi.get(`/api/notification?page=${page}&pageSize=${pageSize}`);
    return response.data;
};

// Get unread count
export const getUnreadCount = async () => {
    const response = await notificationApi.get('/api/notification/unread/count');
    return response.data;
};

// Mark as read
export const markAsRead = async (notificationId) => {
    const response = await notificationApi.put(`/api/notification/read/${notificationId}`);
    return response.data;
};

// Mark all as read
export const markAllAsRead = async () => {
    const response = await notificationApi.put('/api/notification/read-all');
    return response.data;
};

// Delete notification
export const deleteNotification = async (notificationId) => {
    const response = await notificationApi.delete(`/api/notification/${notificationId}`);
    return response.data;
};