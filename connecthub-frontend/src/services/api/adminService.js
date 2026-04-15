import { authApi } from '../../utils/axiosConfig';

// User Management
export const getAdminUsers = async () => {
    const response = await authApi.get('/api/admin/users');
    return response.data;
};

export const suspendUser = async (userId, reason) => {
    const response = await authApi.put(`/api/admin/users/${userId}/suspend`, reason);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await authApi.delete(`/api/admin/users/${userId}`);
    return response.data;
};

// Room Management
export const getAdminRooms = async () => {
    const response = await authApi.get('/api/admin/rooms');
    return response.data;
};

export const deleteRoom = async (roomId) => {
    const response = await authApi.delete(`/api/admin/rooms/${roomId}`);
    return response.data;
};

// Message Management
export const getAdminMessages = async () => {
    const response = await authApi.get('/api/admin/messages');
    return response.data;
};

export const deleteMessage = async (messageId) => {
    const response = await authApi.delete(`/api/admin/messages/${messageId}`);
    return response.data;
};

// Analytics
export const getAdminAnalytics = async () => {
    const response = await authApi.get('/api/admin/analytics');
    return response.data;
};

// Audit Logs
export const getAdminAuditLogs = async (page = 1, pageSize = 50) => {
    const response = await authApi.get(`/api/admin/audit-logs?page=${page}&pageSize=${pageSize}`);
    return response.data;
};