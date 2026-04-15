import { roomApi } from '../../utils/axiosConfig';


// ROOM SERVICE - All room-related API calls


// Create a new room
export const createRoom = async (roomData) => {
    const response = await roomApi.post('/api/room/create', roomData);
    return response.data;
};

// Get all public rooms
export const getPublicRooms = async () => {
    const response = await roomApi.get('/api/room/public');
    return response.data;
};

// Get rooms where current user is a member
export const getMyRooms = async () => {
    const response = await roomApi.get('/api/room/my-rooms');
    return response.data;
};

// Get room details by ID
export const getRoomById = async (roomId) => {
    const response = await roomApi.get(`/api/room/${roomId}`);
    return response.data;
};

// Join a room
export const joinRoom = async (roomId) => {
    const response = await roomApi.post(`/api/room/join/${roomId}`);
    return response.data;
};

// Leave a room
export const leaveRoom = async (roomId) => {
    const response = await roomApi.post(`/api/room/leave/${roomId}`);
    return response.data;
};

// Delete a room (admin only)
export const deleteRoom = async (roomId) => {
    const response = await roomApi.delete(`/api/room/${roomId}`);
    return response.data;
};

// Get room members
export const getRoomMembers = async (roomId) => {
    const response = await roomApi.get(`/api/room/${roomId}/members`);
    return response.data;
};

// Update member role (admin only)
export const updateMemberRole = async (roomId, userId, newRole) => {
    const response = await roomApi.put('/api/room/member-role', { roomId, userId, newRole });
    return response.data;
};

// Remove member from room (admin only)
export const removeMember = async (roomId, userId) => {
    const response = await roomApi.delete(`/api/room/${roomId}/member/${userId}`);
    return response.data;
};