import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaPaperPlane, FaImage, FaPaperclip } from 'react-icons/fa';
import { sendDirectMessage, sendRoomMessage, uploadFile } from '../../services/api/messageService';
import signalRService from '../../services/signalr/signalrService';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

// ================================================================
// MESSAGE INPUT COMPONENT - Handles sending messages and files
// ================================================================

const MessageInput = () => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const { currentChat } = useSelector((state) => state.messages);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleTyping = () => {
        if (!signalRService.isPresenceConnected()) return;
        
        if (currentChat?.type === 'user') {
            signalRService.sendTypingIndicator(currentChat.id, true, 'DIRECT');
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
                signalRService.sendTypingIndicator(currentChat.id, false, 'DIRECT');
            }, 1000);
        } else if (currentChat?.type === 'room') {
            signalRService.sendTypingIndicator(currentChat.id, true, 'ROOM', currentChat.id);
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
                signalRService.sendTypingIndicator(currentChat.id, false, 'ROOM', currentChat.id);
            }, 1000);
        }
    };

    const handleFileUpload = async (file, type) => {
        if (!file) return;
        
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File too large. Max 10MB');
            return;
        }
        
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await uploadFile(formData, currentChat?.id, currentChat?.type === 'room' ? currentChat?.id : null);
            
            if (response.success) {
                const fileId = response.data.fileId;
                const fileName = response.data.fileName || file.name;
                const downloadUrl = `/api/media/download/${fileId}`;
                const senderName = user?.displayName || user?.username || `User_${user?.id}`;
                
                if (currentChat?.type === 'user') {
                    // Use ONLY SignalR (it will handle real-time and database)
                    await signalRService.sendDirectMessage(currentChat.id, downloadUrl, senderName);
                } else if (currentChat?.type === 'room') {
                    await signalRService.sendRoomMessage(currentChat.id, downloadUrl, senderName);
                }
                toast.success('File uploaded and sent');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleImageClick = () => {
        imageInputRef.current.click();
    };

    const handleFileClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file, 'image');
        }
        e.target.value = '';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file, 'file');
        }
        e.target.value = '';
    };

    // ================================================================
    // SEND MESSAGE - ONLY ONCE (SignalR only)
    // ================================================================
    const handleSend = async () => {
        if (!message.trim()) return;
        if (!currentChat) {
            toast.error('No chat selected');
            return;
        }

        setSending(true);
        try {
            const senderName = user?.displayName || user?.username || `User_${user?.id}`;
            
            if (currentChat.type === 'user') {
                // ONLY SignalR - removes duplicate message issue
                await signalRService.sendDirectMessage(currentChat.id, message, senderName);
                setMessage('');
            } else if (currentChat.type === 'room') {
                // ONLY SignalR - removes duplicate message issue
                await signalRService.sendRoomMessage(currentChat.id, message, senderName);
                setMessage('');
            }
        } catch (error) {
            console.error('Send error:', error);
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="input-area">
            <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
            />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            
            <button 
                className="btn btn-outline-secondary" 
                onClick={handleImageClick} 
                title="Upload image" 
                disabled={!currentChat || uploading}
            >
                <FaImage />
            </button>
            <button 
                className="btn btn-outline-secondary" 
                onClick={handleFileClick} 
                title="Upload file" 
                disabled={!currentChat || uploading}
            >
                <FaPaperclip />
            </button>
            
            <input
                type="text"
                className="form-control"
                placeholder={currentChat ? `Message ${currentChat.name}...` : 'Select a chat to start messaging'}
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                }}
                onKeyPress={handleKeyPress}
                disabled={!currentChat || uploading}
            />
            
            <button 
                className="btn btn-primary"
                onClick={handleSend}
                disabled={!message.trim() || sending || !currentChat || uploading}
            >
                {uploading ? <span className="spinner-border spinner-border-sm"></span> : <FaPaperPlane />}
            </button>
        </div>
    );
};

export default MessageInput;