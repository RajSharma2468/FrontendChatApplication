import * as signalR from '@microsoft/signalr';
import { SIGNALR_PRESENCE_URL, SIGNALR_NOTIFICATION_URL } from '../../utils/constants';
import { getToken } from '../../utils/tokenHelper';
import { store } from '../../store/store';
import { addOnlineUser, removeOnlineUser, setOnlineUsers } from '../../store/slices/presenceSlice';
import { addNotification, setUnreadCount } from '../../store/slices/notificationSlice';
import { addMessage, setTyping, updateMessageStatus } from '../../store/slices/messageSlice';

// ================================================================
// SIGNALR SERVICE - Manages WebSocket connections
// ================================================================
// Handles:
// - Connection to Presence Hub and Notification Hub
// - Real-time message sending/receiving
// - Typing indicators
// - Online/offline status
// - Room group management
// ================================================================

class SignalRService {
    constructor() {
        this.presenceConnection = null;
        this.notificationConnection = null;
    }

    // ================================================================
    // Helper: Check if presence connection is ready
    // ================================================================
    isPresenceConnected() {
        return this.presenceConnection && this.presenceConnection.state === signalR.HubConnectionState.Connected;
    }

    isNotificationConnected() {
        return this.notificationConnection && this.notificationConnection.state === signalR.HubConnectionState.Connected;
    }

    // ================================================================
    // Connect to Presence Hub (Online status, typing, messages)
    // FIXED: Uses WebSockets only, skips negotiation to avoid CORS
    // ================================================================
    async connectPresenceHub() {
        const token = getToken();
        if (!token) {
            console.log('No token found, skipping Presence Hub connection');
            return;
        }

        this.presenceConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${SIGNALR_PRESENCE_URL}?access_token=${token}`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Listen for user online events
        this.presenceConnection.on('UserOnline', (userId) => {
            console.log('User online:', userId);
            store.dispatch(addOnlineUser(userId));
        });

        // Listen for user offline events
        this.presenceConnection.on('UserOffline', (userId) => {
            console.log('User offline:', userId);
            store.dispatch(removeOnlineUser(userId));
        });

        // Listen for online users list
        this.presenceConnection.on('OnlineUsersList', (users) => {
            console.log('Online users list:', users);
            store.dispatch(setOnlineUsers(users));
        });

        // Listen for typing indicators
        this.presenceConnection.on('UserTyping', (data) => {
            store.dispatch(setTyping({ userId: data.senderId, isTyping: data.isTyping }));
        });

        // Listen for read receipts
        this.presenceConnection.on('MessageRead', (data) => {
            store.dispatch(updateMessageStatus({ messageId: data.messageId, isRead: true }));
        });

        // Listen for room messages (real-time)
        this.presenceConnection.on('ReceiveRoomMessage', (message) => {
            console.log('Received room message:', message);
            store.dispatch(addMessage(message));
        });

        // Listen for direct messages (real-time)
        this.presenceConnection.on('ReceiveMessage', (message) => {
            console.log('Received direct message:', message);
            store.dispatch(addMessage(message));
        });

        try {
            await this.presenceConnection.start();
            console.log(' Presence Hub connected successfully');
        } catch (err) {
            console.error(' Presence Hub connection failed:', err);
        }
    }

    // ================================================================
    // Connect to Notification Hub (Real-time notifications)
    // FIXED: Uses WebSockets only, skips negotiation to avoid CORS
    // ================================================================
    async connectNotificationHub() {
        const token = getToken();
        if (!token) {
            console.log('No token found, skipping Notification Hub connection');
            return;
        }

        this.notificationConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${SIGNALR_NOTIFICATION_URL}?access_token=${token}`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Listen for new notifications
        this.notificationConnection.on('NewNotification', (notification) => {
            console.log('New notification:', notification);
            store.dispatch(addNotification(notification));
        });

        // Listen for unread count updates
        this.notificationConnection.on('NotificationCount', (count) => {
            store.dispatch(setUnreadCount(count));
        });

        try {
            await this.notificationConnection.start();
            console.log(' Notification Hub connected successfully');
        } catch (err) {
            console.error(' Notification Hub connection failed:', err);
        }
    }

    // ================================================================
    // Send typing indicator to other users
    // ================================================================
    async sendTypingIndicator(receiverId, isTyping, conversationType = 'DIRECT', roomId = null) {
        if (this.isPresenceConnected()) {
            try {
                await this.presenceConnection.invoke('SendTypingIndicator', {
                    receiverId,
                    isTyping,
                    conversationType,
                    roomId
                });
            } catch (err) {
                console.warn('SendTypingIndicator failed:', err);
            }
        }
    }

    // ================================================================
    // Send room message via SignalR (real-time to all room members)
    // ================================================================
    async sendRoomMessage(roomId, content, senderName) {
        if (this.isPresenceConnected()) {
            try {
                await this.presenceConnection.invoke('SendRoomMessage', roomId, content, senderName);
                console.log(`Room message sent to room ${roomId}`);
            } catch (err) {
                console.warn('SendRoomMessage failed:', err);
            }
        } else {
            console.warn('Presence Hub not connected, message not sent via SignalR');
        }
    }

    // ================================================================
    // Send direct message via SignalR (real-time to specific user)
    // ================================================================
    async sendDirectMessage(receiverId, content, senderName) {
        if (this.isPresenceConnected()) {
            try {
                await this.presenceConnection.invoke('SendDirectMessage', receiverId, content, senderName);
                console.log(`Direct message sent to user ${receiverId}`);
            } catch (err) {
                console.warn('SendDirectMessage failed:', err);
            }
        } else {
            console.warn('Presence Hub not connected, message not sent via SignalR');
        }
    }

    // ================================================================
    // Join room group - Required to receive room messages
    // Call this when user selects/joins a room
    // ================================================================
    async joinRoomGroup(roomId) {
        if (this.isPresenceConnected()) {
            try {
                await this.presenceConnection.invoke('JoinRoomGroup', roomId);
                console.log(`Joined SignalR group for room ${roomId}`);
            } catch (err) {
                console.warn('JoinRoomGroup failed:', err);
            }
        } else {
            console.warn('Presence Hub not connected, cannot join room group');
        }
    }

    // ================================================================
    // Leave room group - Call when user leaves a room
    // ================================================================
    async leaveRoomGroup(roomId) {
        if (this.isPresenceConnected()) {
            try {
                await this.presenceConnection.invoke('LeaveRoomGroup', roomId);
                console.log(`Left SignalR group for room ${roomId}`);
            } catch (err) {
                console.warn('LeaveRoomGroup failed:', err);
            }
        }
    }

    // ================================================================
    // Send heartbeat to keep connection alive
    // ================================================================
    async sendHeartbeat() {
        if (this.isPresenceConnected()) {
            try {
                await this.presenceConnection.invoke('SendHeartbeat');
            } catch (err) {
                console.warn('SendHeartbeat failed:', err);
            }
        }
    }

    // ================================================================
    // Disconnect all connections (call on logout)
    // ================================================================
    disconnect() {
        if (this.presenceConnection) {
            this.presenceConnection.stop();
            this.presenceConnection = null;
        }
        if (this.notificationConnection) {
            this.notificationConnection.stop();
            this.notificationConnection = null;
        }
        console.log('SignalR connections disconnected');
    }
}

export default new SignalRService();