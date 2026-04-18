import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaDownload } from 'react-icons/fa';
import { editMessage, deleteMessage } from '../../services/api/messageService';
import { setMessages, updateMessageStatus } from '../../store/slices/messageSlice';
import { toast } from 'react-toastify';
import signalRService from '../../services/signalr/signalrService';

const MessageList = () => {
    const { messages, currentChat } = useSelector((state) => state.messages);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [showDeleteOptions, setShowDeleteOptions] = useState(null);
    const [deletingMessageId, setDeletingMessageId] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const messagesEndRef = useRef(null);
    const [hasMarkedRead, setHasMarkedRead] = useState(false);

    // Filter messages based on current chat
    const filteredMessages = messages.filter(msg => {
        if (!currentChat) return false;
        if (currentChat.type === 'user') {
            return (msg.senderId === currentChat.id || msg.receiverId === currentChat.id);
        } else if (currentChat.type === 'room') {
            return msg.roomId === currentChat.id;
        }
        return false;
    });

    useEffect(() => {
        scrollToBottom();
    }, [filteredMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // ================================================================
    // AUTO-MARK MESSAGES AS READ - ONLY FOR REAL MESSAGES (SKIP TEMP)
    // ================================================================
    useEffect(() => {
        const markUnreadMessagesAsRead = async () => {
            // Only real messages with numeric ID (skip temp-xxx)
            const unreadMessages = filteredMessages.filter(m => 
                !m.isRead && 
                m.senderId !== user?.id &&
                typeof m.id === 'number' &&
                m.id > 0
            );
            
            if (unreadMessages.length === 0) return;
            
            for (const message of unreadMessages) {
                try {
                    const token = localStorage.getItem('connecthub_token');
                    await fetch(`https://connecthub-gateway-g4gpfvdrgucrcgh4.centralus-01.azurewebsites.net/api/message/read/${message.id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    dispatch(updateMessageStatus({ messageId: message.id, isRead: true }));
                    
                    if (signalRService.isPresenceConnected()) {
                        await signalRService.presenceConnection?.invoke('MarkMessageAsRead', message.id, message.senderId);
                    }
                } catch (error) {
                    console.error('Failed to mark message as read:', error);
                }
            }
        };
        
        if (filteredMessages.length > 0 && !hasMarkedRead) {
            markUnreadMessagesAsRead();
            setHasMarkedRead(true);
        }
        
        const timeout = setTimeout(() => setHasMarkedRead(false), 1000);
        return () => clearTimeout(timeout);
    }, [filteredMessages, user?.id, dispatch, hasMarkedRead]);

    // Extract file ID from URL
    const extractFileId = (url) => {
        if (!url) return null;
        const match = url.match(/\/api\/media\/download\/(\d+)/);
        if (match) return match[1];
        const guidMatch = url.match(/\/uploads\/([a-f0-9-]+)/i);
        if (guidMatch) return guidMatch[1];
        return null;
    };

    // Render message content
    const renderContent = (message) => {
        const content = message.content;
        const isSentByCurrentUser = message.senderId === user?.id;
        
        const isFileMessage = content && (
            content.includes('/api/media/download/') ||
            content.includes('/uploads/') ||
            content.match(/\.(pdf|doc|docx|xls|xlsx|zip|jpg|jpeg|png|gif|webp)/i)
        );
        
        if (isFileMessage) {
            let fileId = extractFileId(content);
            let fileName = '';
            
            if (content.includes('/api/media/download/')) {
                fileName = content.split('/').pop() || 'Download File';
            } else if (content.includes('/uploads/')) {
                fileName = content.split('/').pop() || 'Download File';
            } else {
                fileName = content.replace(/^[📧📎📁📄]\s*/, '').trim();
            }
            
            if (fileId) {
                const token = localStorage.getItem('connecthub_token');
                const apiUrl = `https://connecthub-gateway-g4gpfvdrgucrcgh4.centralus-01.azurewebsites.net/api/media/download/${fileId}?access_token=${token}`;
                const isImage = content.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                
                if (isImage) {
                    return (
                        <div>
                            <img 
                                src={apiUrl} 
                                alt={fileName}
                                style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', cursor: 'pointer' }} 
                                onClick={() => window.open(apiUrl, '_blank')}
                                onError={(e) => { 
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<a href="${apiUrl}" target="_blank" style="color: ${isSentByCurrentUser ? '#fff' : '#0d6efd'}">📎 ${fileName}</a>`;
                                }}
                            />
                        </div>
                    );
                } else {
                    return (
                        <a 
                            href={apiUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                                color: isSentByCurrentUser ? '#ffffff' : '#0d6efd',
                                textDecoration: 'underline',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px 8px',
                                backgroundColor: isSentByCurrentUser ? 'rgba(255,255,255,0.1)' : 'rgba(13,110,253,0.1)',
                                borderRadius: '6px'
                            }}
                        >
                            <FaDownload size={12} /> 📎 {fileName}
                        </a>
                    );
                }
            } else {
                return (
                    <div style={{ fontSize: '13px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                        📎 {fileName || content}
                    </div>
                );
            }
        }
        
        if (message.isDeleted && !isSentByCurrentUser) {
            return <div className="text-muted fst-italic" style={{ fontSize: '11px' }}>This message was deleted</div>;
        }
        
        return <div style={{ fontSize: '13px', lineHeight: '1.4', wordBreak: 'break-word' }}>{message.content}</div>;
    };

    const handleEdit = async (messageId, currentContent) => {
        if (!editContent.trim() || editContent === currentContent) {
            setEditingId(null);
            setEditContent('');
            return;
        }
        
        setEditingMessageId(messageId);
        try {
            const response = await editMessage(messageId, editContent.trim());
            
            if (response.success) {
                const updatedMessages = messages.map(msg => 
                    msg.id === messageId 
                        ? { ...msg, content: editContent.trim(), isEdited: true, editedAt: new Date().toISOString() }
                        : msg
                );
                dispatch(setMessages(updatedMessages));
                toast.success('Message edited successfully');
                setEditingId(null);
                setEditContent('');
            } else {
                toast.error(response.message || 'Failed to edit message');
            }
        } catch (error) {
            console.error('Edit error:', error);
            toast.error(error.response?.data?.message || 'Failed to edit message');
        } finally {
            setEditingMessageId(null);
        }
    };

    const handleDelete = async (messageId, deleteType) => {
        setDeletingMessageId(messageId);
        try {
            const response = await deleteMessage(messageId, deleteType);
            
            if (response.success) {
                let updatedMessages;
                
                if (deleteType === 'FOR_ME') {
                    updatedMessages = messages.filter(msg => msg.id !== messageId);
                    toast.success('Message deleted for you');
                } else {
                    updatedMessages = messages.map(msg => 
                        msg.id === messageId 
                            ? { ...msg, isDeleted: true, content: '[Message deleted]' }
                            : msg
                    );
                    toast.success('Message deleted for everyone');
                }
                
                dispatch(setMessages(updatedMessages));
                setShowDeleteOptions(null);
            } else {
                toast.error(response.message || 'Failed to delete message');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete message');
        } finally {
            setDeletingMessageId(null);
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const isSentByMe = (message) => {
        return message.senderId === user?.id;
    };

    const canDeleteForEveryone = (message) => {
        return isSentByMe(message) || user?.role === 'ADMIN';
    };

    // Generate unique key for each message
    const getMessageKey = (message) => {
        if (typeof message.id === 'number' && message.id > 0) {
            return message.id;
        }
        return `temp-${message.sentAt}-${message.senderId}-${Date.now()}`;
    };

    return (
        <div className="message-list">
            {filteredMessages.map((message) => (
                <div
                    key={getMessageKey(message)}
                    className={`message ${isSentByMe(message) ? 'sent' : 'received'}`}
                    style={{ position: 'relative', marginBottom: '12px' }}
                >
                    <div className="message-bubble" style={{ position: 'relative', padding: '8px 12px' }}>
                        {!isSentByMe(message) && (
                            <div className="message-sender" style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '3px', color: '#6c757d' }}>
                                {message.senderName || `User ${message.senderId}`}
                            </div>
                        )}
                        
                        {editingId === message.id ? (
                            <div className="d-flex gap-1">
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    autoFocus
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                />
                                <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleEdit(message.id, message.content)}
                                    disabled={editingMessageId === message.id}
                                    style={{ padding: '2px 5px' }}
                                >
                                    {editingMessageId === message.id ? '...' : <FaCheck size={8} />}
                                </button>
                                <button 
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                        setEditingId(null);
                                        setEditContent('');
                                    }}
                                    style={{ padding: '2px 5px' }}
                                >
                                    <FaTimes size={8} />
                                </button>
                            </div>
                        ) : (
                            <>
                                {renderContent(message)}
                                
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '5px',
                                    gap: '8px'
                                }}>
                                    <div className="message-time" style={{ 
                                        fontSize: '9px', 
                                        opacity: 0.7, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '4px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span>{formatTime(message.sentAt)}</span>
                                        
                                        {isSentByMe(message) && !message.isDeleted && (
                                            <span style={{ 
                                                color: message.isRead ? '#34b7f1' : '#9e9e9e',
                                                fontWeight: 'bold',
                                                fontSize: '10px'
                                            }}>
                                                {message.isRead ? '✓✓' : '✓'}
                                            </span>
                                        )}
                                        
                                        {message.isEdited && (
                                            <span style={{ 
                                                fontSize: '9px', 
                                                fontStyle: 'italic',
                                                color: isSentByMe(message) ? '#ffffff' : '#6c757d'
                                            }}>
                                                (edited)
                                            </span>
                                        )}
                                    </div>
                                    
                                    {isSentByMe(message) && !message.isDeleted && editingId !== message.id && (
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '8px',
                                            alignItems: 'center'
                                        }}>
                                            <FaEdit 
                                                size={10} 
                                                onClick={() => {
                                                    setEditingId(message.id);
                                                    setEditContent(message.content);
                                                }}
                                                style={{ 
                                                    cursor: 'pointer', 
                                                    color: isSentByMe(message) ? '#ffffff' : '#0d6efd',
                                                    opacity: 0.7
                                                }}
                                                title="Edit message"
                                            />
                                            
                                            <div style={{ position: 'relative' }}>
                                                <FaTrash 
                                                    size={10} 
                                                    onClick={() => setShowDeleteOptions(showDeleteOptions === message.id ? null : message.id)}
                                                    style={{ 
                                                        cursor: 'pointer', 
                                                        color: isSentByMe(message) ? '#ffffff' : '#dc3545',
                                                        opacity: 0.7
                                                    }}
                                                    title="Delete message"
                                                />
                                                
                                                {showDeleteOptions === message.id && (
                                                    <div className="delete-options-dropdown" style={{
                                                        position: 'absolute',
                                                        bottom: '20px',
                                                        right: '0',
                                                        backgroundColor: 'white',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '6px',
                                                        padding: '4px 0',
                                                        zIndex: 1000,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                        minWidth: '100px'
                                                    }}>
                                                        <div 
                                                            className="delete-option delete-for-me"
                                                            onClick={() => handleDelete(message.id, 'FOR_ME')}
                                                            style={{ padding: '6px 12px', cursor: 'pointer', fontSize: '10px' }}
                                                        >
                                                            {deletingMessageId === message.id ? '...' : 'Delete for me'}
                                                        </div>
                                                        {canDeleteForEveryone(message) && (
                                                            <div 
                                                                className="delete-option delete-for-everyone"
                                                                onClick={() => handleDelete(message.id, 'FOR_EVERYONE')}
                                                                style={{ padding: '6px 12px', cursor: 'pointer', fontSize: '10px', color: '#dc3545' }}
                                                            >
                                                                {deletingMessageId === message.id ? '...' : 'Delete for everyone'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
