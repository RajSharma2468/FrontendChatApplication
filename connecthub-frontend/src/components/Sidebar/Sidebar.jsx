import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaComments, FaUsers, FaSignOutAlt, FaPlus, FaCrown, FaSearch, FaTimes } from 'react-icons/fa';
import { logout } from '../../store/slices/authSlice';
import { setCurrentChat, clearMessages, setMessages, setRecentChats } from '../../store/slices/messageSlice';
import { getDirectMessages, getRoomMessages, getRecentChats } from '../../services/api/messageService';
import { searchUsers } from '../../services/api/authService';
import signalRService from '../../services/signalr/signalrService';
import { toast } from 'react-toastify';
import CreateRoomModal from './CreateRoomModal';
import RoomList from './RoomList';

// ================================================================
// SIDEBAR COMPONENT - Main navigation sidebar for the app
// ================================================================
// Features:
// - User profile display
// - Search users functionality
// - Recent chats list
// - Rooms list (My Rooms & Public Rooms)
// - Create Room button
// - Logout button
// - Admin panel access
// ================================================================

const Sidebar = () => {
    // State for active tab (chats or rooms)
    const [activeTab, setActiveTab] = useState('chats');
    // State for create room modal
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    // State for loading indicator
    const [loading, setLoading] = useState(false);
    // State for search term input
    const [searchTerm, setSearchTerm] = useState('');
    // State for search results from API
    const [searchResults, setSearchResults] = useState([]);
    // State for search loading indicator
    const [isSearching, setIsSearching] = useState(false);
    
    // Redux selectors
    const { user } = useSelector((state) => state.auth);
    const { recentChats } = useSelector((state) => state.messages);
    
    // Redux dispatch and navigation
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ================================================================
    // Load recent chats when component mounts
    // ================================================================
    useEffect(() => {
        loadRecentChats();
    }, []);

    // ================================================================
    // Search users with debouncing (waits 500ms after user stops typing)
    // Minimum 2 characters required to search
    // ================================================================
    useEffect(() => {
        const searchUsersDebounced = async () => {
            if (searchTerm.length >= 2) {
                setIsSearching(true);
                try {
                    const response = await searchUsers(searchTerm);
                    if (response.success) {
                        // Filter out current user from search results
                        const filtered = response.data.filter(u => u.id !== user?.id);
                        setSearchResults(filtered);
                    }
                } catch (error) {
                    console.error('Search failed:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        };

        const timeoutId = setTimeout(searchUsersDebounced, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, user?.id]);

    // ================================================================
    // Load recent chats from API
    // ================================================================
    const loadRecentChats = async () => {
        setLoading(true);
        try {
            const response = await getRecentChats();
            if (response.success) {
                dispatch(setRecentChats(response.data));
                console.log('Recent chats loaded:', response.data);
            }
        } catch (error) {
            console.error('Failed to load recent chats:', error);
        } finally {
            setLoading(false);
        }
    };

    // ================================================================
    // Handle user logout
    // ================================================================
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        toast.info('Logged out successfully');
    };

    // ================================================================
    // Handle chat/room selection
    // ================================================================
    const handleSelectChat = async (chatId, type, name) => {
        if (!chatId) {
            console.error('No chat ID provided');
            return;
        }
        
        dispatch(setCurrentChat({ type, id: chatId, name }));
        
        // Clear search when selecting a chat
        setSearchTerm('');
        setSearchResults([]);
        
        if (type === 'user') {
            try {
                const response = await getDirectMessages(chatId);
                if (response.success) {
                    dispatch(setMessages(response.data));
                }
            } catch (error) {
                console.error('Failed to load direct messages:', error);
                toast.error('Failed to load messages');
            }
        } else if (type === 'room') {
            try {
                await signalRService.joinRoomGroup(chatId);
                const response = await getRoomMessages(chatId);
                if (response.success) {
                    dispatch(setMessages(response.data));
                }
            } catch (error) {
                console.error('Failed to load room messages:', error);
                toast.error('Failed to load room messages');
            }
        }
    };

    // ================================================================
    // Start a new chat with searched user
    // ================================================================
    const handleStartChat = async (userId, displayName) => {
        if (!userId) {
            console.error('No user ID provided');
            return;
        }
        await handleSelectChat(userId, 'user', displayName);
    };

    // ================================================================
    // Clear search input and results
    // ================================================================
    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
    };

    // ================================================================
    // Format last message time for display
    // - Today: Show time (e.g., "05:18 PM")
    // - This week: Show day name (e.g., "Mon")
    // - Older: Show date (e.g., "Apr 14")
    // ================================================================
    const formatLastMessageTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        if (diff < 24 * 60 * 60 * 1000) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 7 * 24 * 60 * 60 * 1000) {
            return d.toLocaleDateString([], { weekday: 'short' });
        } else {
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    // ================================================================
    // Get preview of last message (truncate if too long)
    // ================================================================
    const getLastMessagePreview = (content) => {
        if (!content) return 'No messages yet';
        if (content.length > 35) {
            return content.substring(0, 35) + '...';
        }
        return content;
    };

    // ================================================================
    // Render search results section
    // ================================================================
    const renderSearchResults = () => {
        if (searchTerm.length < 2) return null;
        
        if (isSearching) {
            return (
                <div className="text-center text-secondary p-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Searching...</span>
                    </div>
                    <div className="mt-2 small">Searching...</div>
                </div>
            );
        }
        
        if (searchResults.length === 0 && searchTerm.length >= 2) {
            return (
                <div className="text-center text-secondary p-3">
                    <FaSearch size={30} className="mb-2 opacity-50" />
                    <div className="small">No users found</div>
                    <div className="small mt-1">Try a different name</div>
                </div>
            );
        }
        
        return (
            <>
                <div className="text-secondary px-2 py-1 small" style={{ fontSize: '11px' }}>
                    SEARCH RESULTS ({searchResults.length})
                </div>
                {searchResults.map((result) => (
                    <div
                        key={result.id}  //  Unique key
                        className="d-flex align-items-center p-2 rounded mb-1"
                        style={{ 
                            cursor: 'pointer', 
                            backgroundColor: '#3d5a73',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleStartChat(result.id, result.displayName || result.username)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a6b4a'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3d5a73'}
                    >
                        <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center"
                            style={{ width: '40px', height: '40px' }}>
                            <FaUser className="text-white" size={16} />
                        </div>
                        <div className="ms-2 flex-grow-1">
                            <div className="fw-bold text-white" style={{ fontSize: '13px' }}>
                                {result.displayName || result.username}
                            </div>
                            <small className="text-secondary" style={{ fontSize: '10px' }}>
                                @{result.username}
                            </small>
                        </div>
                        <button className="btn btn-sm btn-primary" style={{ fontSize: '11px', padding: '2px 8px' }}>
                            Message
                        </button>
                    </div>
                ))}
            </>
        );
    };

    // ================================================================
    // Render recent chats list - FIXED for API data structure
    // API returns: { userId, username, displayName, lastMessage, lastMessageTime, unreadCount, avatarUrl }
    // ================================================================
    const renderRecentChats = () => {
        if (loading) {
            return (
                <div className="text-center text-secondary p-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-2 small">Loading chats...</div>
                </div>
            );
        }

        if (!recentChats || recentChats.length === 0) {
            return (
                <div className="text-center text-secondary p-3">
                    <FaComments size={30} className="mb-2 opacity-50" />
                    <div className="small">No recent chats</div>
                    <div className="small mt-1">Search for users to start chatting!</div>
                </div>
            );
        }

        //  FIXED: Using correct data structure from API
        return recentChats.map((chat, index) => {
            // API se aane wala data structure:
            // {
            //   userId: number,
            //   username: string,
            //   displayName: string,
            //   avatarUrl: string | null,
            //   lastMessage: string,
            //   lastMessageTime: string,
            //   unreadCount: number
            // }
            
            const chatId = chat.userId;
            const chatName = chat.displayName || chat.username;
            const lastMessage = chat.lastMessage;
            const lastMessageTime = chat.lastMessageTime;
            const unreadCount = chat.unreadCount || 0;
            
            // Skip if no valid chat ID
            if (!chatId) return null;

            return (
                <div
                    key={chatId}  //  Unique key using userId
                    className="d-flex align-items-center p-2 rounded mb-1"
                    style={{ 
                        cursor: 'pointer', 
                        backgroundColor: '#34495e',
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleStartChat(chatId, chatName)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d5a73'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#34495e'}
                >
                    {/* Avatar with online status indicator */}
                    <div className="bg-secondary rounded-circle d-flex justify-content-center align-items-center position-relative"
                        style={{ width: '40px', height: '40px' }}>
                        {chat.avatarUrl ? (
                            <img 
                                src={chat.avatarUrl} 
                                alt={chatName} 
                                className="rounded-circle" 
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                            />
                        ) : (
                            <FaUser className="text-white" size={16} />
                        )}
                        {/* Online status dot - green for online */}
                        <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: '#2ecc71',
                            border: '2px solid #34495e'
                        }}></div>
                    </div>
                    
                    {/* Chat info */}
                    <div className="ms-2 flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="fw-bold text-white" style={{ fontSize: '13px' }}>
                                {chatName}
                            </div>
                            <small className="text-secondary" style={{ fontSize: '9px' }}>
                                {formatLastMessageTime(lastMessageTime)}
                            </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-secondary" style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                                {getLastMessagePreview(lastMessage)}
                            </div>
                            {/* Unread message count badge */}
                            {unreadCount > 0 && (
                                <span className="badge bg-primary rounded-circle" style={{ fontSize: '9px', minWidth: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <>
            <div className="sidebar" style={{ 
                width: '320px', 
                backgroundColor: '#2c3e50', 
                color: '#ecf0f1',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* ================================================================ */}
                {/* USER PROFILE HEADER */}
                {/* ================================================================ */}
                <div className="p-3 border-bottom" style={{ borderColor: '#34495e' }}>
                    <div className="d-flex align-items-center">
                        {/* Avatar */}
                        <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center" 
                             style={{ width: '40px', height: '40px' }}>
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="avatar" className="rounded-circle" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                            ) : (
                                <FaUser className="text-white" size={18} />
                            )}
                        </div>
                        {/* User info */}
                        <div className="ms-2 flex-grow-1">
                            <div className="fw-bold text-white" style={{ fontSize: '14px' }}>{user?.displayName || user?.username}</div>
                            <small className="text-secondary" style={{ fontSize: '11px' }}>@{user?.username}</small>
                        </div>
                        {/* Logout button */}
                        <FaSignOutAlt 
                            style={{ cursor: 'pointer', fontSize: '18px', color: '#95a5a6' }}
                            onClick={handleLogout}
                            title="Logout"
                        />
                    </div>
                    {/* Admin Panel button (visible only for admin users) */}
                    {user?.role === 'ADMIN' && (
                        <button 
                            className="btn btn-outline-danger btn-sm mt-2 w-100"
                            onClick={() => navigate('/admin')}
                            style={{ fontSize: '12px' }}
                        >
                            <FaCrown /> Admin Panel
                        </button>
                    )}
                </div>

                {/* ================================================================ */}
                {/* SEARCH BAR */}
                {/* ================================================================ */}
                <div className="p-2">
                    <div className="input-group" style={{ position: 'relative' }}>
                        <span className="input-group-text" style={{ backgroundColor: '#34495e', border: 'none' }}>
                            <FaSearch className="text-white" size={12} />
                        </span>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                fontSize: '12px', 
                                backgroundColor: '#34495e', 
                                border: 'none',
                                color: 'white'
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                style={{ 
                                    position: 'absolute', 
                                    right: '8px', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    padding: 0,
                                    margin: 0,
                                    zIndex: 10
                                }}
                            >
                                <FaTimes size={12} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ================================================================ */}
                {/* TABS - Chats and Rooms */}
                {/* ================================================================ */}
                <div className="d-flex border-bottom" style={{ borderColor: '#34495e' }}>
                    <button 
                        className={`flex-grow-1 py-2 text-center ${activeTab === 'chats' ? 'active-tab' : ''}`}
                        onClick={() => {
                            setActiveTab('chats');
                            setSearchTerm('');
                            setSearchResults([]);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: activeTab === 'chats' ? '#3498db' : '#95a5a6',
                            fontSize: '12px',
                            fontWeight: activeTab === 'chats' ? 'bold' : 'normal',
                            borderBottom: activeTab === 'chats' ? '2px solid #3498db' : 'none'
                        }}
                    >
                        <FaComments className="me-1" size={11} /> Chats
                    </button>
                    <button 
                        className={`flex-grow-1 py-2 text-center ${activeTab === 'rooms' ? 'active-tab' : ''}`}
                        onClick={() => {
                            setActiveTab('rooms');
                            setSearchTerm('');
                            setSearchResults([]);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: activeTab === 'rooms' ? '#3498db' : '#95a5a6',
                            fontSize: '12px',
                            fontWeight: activeTab === 'rooms' ? 'bold' : 'normal',
                            borderBottom: activeTab === 'rooms' ? '2px solid #3498db' : 'none'
                        }}
                    >
                        <FaUsers className="me-1" size={11} /> Rooms
                    </button>
                </div>

                {/* ================================================================ */}
                {/* CREATE ROOM BUTTON - Only visible in Rooms tab */}
                {/* ================================================================ */}
                {activeTab === 'rooms' && (
                    <button 
                        className="btn btn-outline-primary m-2"
                        onClick={() => setShowCreateRoom(true)}
                        style={{ fontSize: '12px' }}
                    >
                        <FaPlus /> Create Room
                    </button>
                )}

                {/* ================================================================ */}
                {/* CONTENT AREA - Shows search results, recent chats, or rooms */}
                {/* ================================================================ */}
                <div className="flex-grow-1 overflow-auto p-2">
                    {/* Show search results if searching */}
                    {searchTerm.length >= 2 ? (
                        renderSearchResults()
                    ) : (
                        <>
                            {activeTab === 'chats' ? (
                                renderRecentChats()
                            ) : (
                                <RoomList onSelectRoom={handleSelectChat} />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Create Room Modal */}
            <CreateRoomModal 
                show={showCreateRoom} 
                onHide={() => setShowCreateRoom(false)} 
            />
        </>
    );
};

export default Sidebar;