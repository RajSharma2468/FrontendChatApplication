import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    messages: [],
    recentChats: [],
    currentChat: null,
    loading: false,
    typingUsers: []
};

const messageSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        
        setRecentChats: (state, action) => {
            state.recentChats = action.payload;
        },
        
        addOrUpdateRecentChat: (state, action) => {
            const newChat = action.payload;
            const existingIndex = state.recentChats.findIndex(chat => 
                (chat.senderId === newChat.senderId && chat.receiverId === newChat.receiverId) ||
                (chat.senderId === newChat.receiverId && chat.receiverId === newChat.senderId)
            );
            
            if (existingIndex !== -1) {
                state.recentChats[existingIndex] = { ...state.recentChats[existingIndex], ...newChat };
                const [updatedChat] = state.recentChats.splice(existingIndex, 1);
                state.recentChats.unshift(updatedChat);
            } else {
                state.recentChats.unshift(newChat);
            }
        },
        
        // ================================================================
        // ADD MESSAGE
        // Only sets fallback senderName if not already provided by backend
        // ================================================================
        addMessage: (state, action) => {
            const newMessage = action.payload;
            
            // Generate numeric ID for temp messages
            if (!newMessage.id || newMessage.id === 0 || typeof newMessage.id === 'string') {
                newMessage.id = Date.now();
            }
            
            // Check for duplicate by ID only
            const isDuplicate = state.messages.some(msg => msg.id === newMessage.id);
            if (isDuplicate) {
                console.log('Duplicate prevented:', newMessage.id);
                return;
            }
            
            // Only set fallback if senderName is completely missing
            // Do NOT override if backend already sent a real name
            if (!newMessage.senderName || newMessage.senderName.startsWith('User_')) {
                if (newMessage.senderId) {
                    newMessage.senderName = newMessage.senderName || `User ${newMessage.senderId}`;
                }
            }
            
            state.messages.push(newMessage);
        },
        
        setCurrentChat: (state, action) => {
            state.currentChat = action.payload;
        },
        
        updateMessageStatus: (state, action) => {
            const { messageId, isRead } = action.payload;
            const message = state.messages.find(m => m.id === messageId);
            if (message) {
                message.isRead = isRead;
            }
            const recentChat = state.recentChats.find(c => 
                c.id === messageId || c.lastMessageId === messageId
            );
            if (recentChat) {
                recentChat.isRead = isRead;
            }
        },
        
        setTyping: (state, action) => {
            const { userId, isTyping } = action.payload;
            if (isTyping) {
                if (!state.typingUsers.includes(userId)) {
                    state.typingUsers.push(userId);
                }
            } else {
                state.typingUsers = state.typingUsers.filter(id => id !== userId);
            }
        },
        
        clearMessages: (state) => {
            state.messages = [];
        },
        
        updateMessage: (state, action) => {
            const { messageId, updatedData } = action.payload;
            const index = state.messages.findIndex(m => m.id === messageId);
            if (index !== -1) {
                state.messages[index] = { ...state.messages[index], ...updatedData };
            }
        },
        
        removeMessage: (state, action) => {
            const messageId = action.payload;
            state.messages = state.messages.filter(m => m.id !== messageId);
        }
    }
});

export const { 
    setMessages, 
    setRecentChats,
    addOrUpdateRecentChat,
    addMessage, 
    setCurrentChat, 
    updateMessageStatus, 
    setTyping, 
    clearMessages,
    updateMessage,
    removeMessage
} = messageSlice.actions;

export default messageSlice.reducer;