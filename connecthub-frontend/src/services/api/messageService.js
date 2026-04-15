import { messagingApi } from '../../utils/axiosConfig';

// Send direct message
export const sendDirectMessage = async (receiverId, content) => {
    const response = await messagingApi.post('/api/message/send', { receiverId, content });
    return response.data;
};

// Send room message
export const sendRoomMessage = async (roomId, content) => {
    const response = await messagingApi.post('/api/message/room/send', { roomId, content });
    return response.data;
};

// Get direct messages between two users
export const getDirectMessages = async (userId, page = 1, pageSize = 20) => {
    const response = await messagingApi.get(`/api/message/direct/${userId}?page=${page}&pageSize=${pageSize}`);
    return response.data;
};

// Get messages in a room
export const getRoomMessages = async (roomId, page = 1, pageSize = 20) => {
    const response = await messagingApi.get(`/api/message/room/${roomId}?page=${page}&pageSize=${pageSize}`);
    return response.data;
};

// EDIT MESSAGE
export const editMessage = async (messageId, newContent) => {
    const response = await messagingApi.post('/api/message/edit', { messageId, newContent });
    return response.data;
};

// DELETE MESSAGE
export const deleteMessage = async (messageId, deleteType = 'FOR_ME') => {
    const response = await messagingApi.delete(`/api/message/delete?messageId=${messageId}&deleteType=${deleteType}`);
    return response.data;
};

// Search messages
export const searchMessages = async (keyword, roomId = null) => {
    const url = roomId ? `/api/message/search?q=${keyword}&roomId=${roomId}` : `/api/message/search?q=${keyword}`;
    const response = await messagingApi.get(url);
    return response.data;
};

// Get recent chats
export const getRecentChats = async () => {
    const response = await messagingApi.get('/api/message/recent-chats');
    return response.data;
};

// FILE UPLOAD (using mediaApi)
export const uploadFile = async (formData, messageId = null, roomId = null) => {
    let url = '/api/media/upload';
    const params = [];
    if (messageId) params.push(`messageId=${messageId}`);
    if (roomId) params.push(`roomId=${roomId}`);
    if (params.length) url += `?${params.join('&')}`;
    
    const { mediaApi } = await import('../../utils/axiosConfig');
    const response = await mediaApi.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};