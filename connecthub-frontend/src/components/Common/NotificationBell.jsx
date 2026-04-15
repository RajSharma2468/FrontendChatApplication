import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaBell } from 'react-icons/fa';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/api/notificationService';
import { setNotifications, setUnreadCount, markAsRead as markAsReadAction } from '../../store/slices/notificationSlice';
import { toast } from 'react-toastify';

const NotificationBell = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { notifications, unreadCount } = useSelector((state) => state.notifications);
    const dispatch = useDispatch();

    useEffect(() => {
        loadNotifications();
        
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await getNotifications(1, 20);
            if (response.success) {
                dispatch(setNotifications(response.data));
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const response = await markAsRead(notificationId);
            if (response.success) {
                dispatch(markAsReadAction(notificationId));
            }
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await markAllAsRead();
            if (response.success) {
                dispatch(markAllAsRead());
            }
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'MESSAGE':
                return '💬';
            case 'MENTION':
                return '@';
            case 'ROOM_JOIN':
                return '🚪';
            case 'ROLE_CHANGE':
                return '👑';
            case 'PLATFORM':
                return '📢';
            default:
                return '🔔';
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const sentAt = new Date(date);
        const diffMs = now - sentAt;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour ago`;
        return `${diffDays} day ago`;
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button
                className="btn btn-link text-white position-relative"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="dropdown-menu show position-absolute end-0 mt-2" style={{ width: '350px', maxHeight: '500px', overflowY: 'auto' }}>
                    <div className="dropdown-header d-flex justify-content-between align-items-center">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <button className="btn btn-sm btn-link" onClick={handleMarkAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    {notifications.length === 0 ? (
                        <div className="text-center text-muted py-3">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`dropdown-item ${!notification.isRead ? 'bg-light' : ''}`}
                                style={{ cursor: 'pointer', whiteSpace: 'normal' }}
                                onClick={() => handleMarkAsRead(notification.id)}
                            >
                                <div className="d-flex">
                                    <div className="me-2 fs-4">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="fw-bold">{notification.title}</div>
                                        <div className="small text-muted">{notification.message}</div>
                                        <div className="small text-secondary mt-1">
                                            {formatTime(notification.sentAt)}
                                        </div>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="ms-2">
                                            <span className="badge bg-primary rounded-pill">New</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    
                    <div className="dropdown-footer text-center py-2">
                        <button className="btn btn-sm btn-link" onClick={() => setShowDropdown(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;