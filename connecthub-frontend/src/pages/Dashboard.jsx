import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import signalRService from '../services/signalr/signalrService';
import { getMyRooms, getPublicRooms } from '../services/api/roomService';
import { getUnreadCount } from '../services/api/notificationService';
import { setMyRooms, setPublicRooms } from '../store/slices/roomSlice';
import { setUnreadCount } from '../store/slices/notificationSlice';
import { getProfile } from '../services/api/authService';
import { loginSuccess } from '../store/slices/authSlice';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const heartbeatIntervalRef = useRef(null);
    const [hubsReady, setHubsReady] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        loadData();
        connectHubs();  // SignalR enabled now

        // Cleanup on unmount
        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
            signalRService.disconnect();
        };
    }, []);

    // Start heartbeat only when hubs are ready
    useEffect(() => {
        if (hubsReady) {
            // Clear existing interval
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
            
            // Start heartbeat every 30 seconds
            heartbeatIntervalRef.current = setInterval(() => {
                signalRService.sendHeartbeat().catch(err => {
                    console.warn('Heartbeat failed:', err);
                });
            }, 30000);
        }
        
        return () => {
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
        };
    }, [hubsReady]);

    const loadData = async () => {
        try {
            // Load user profile
            const profileRes = await getProfile();
            if (profileRes.success) {
                dispatch(loginSuccess({ user: profileRes.data, token: localStorage.getItem('connecthub_token') }));
            }

            // Load rooms
            const myRoomsRes = await getMyRooms();
            if (myRoomsRes.success) {
                dispatch(setMyRooms(myRoomsRes.data));
            }

            const publicRoomsRes = await getPublicRooms();
            if (publicRoomsRes.success) {
                dispatch(setPublicRooms(publicRoomsRes.data));
            }

            // Load unread count (if notification service is running)
            try {
                const unreadRes = await getUnreadCount();
                if (unreadRes.success) {
                    dispatch(setUnreadCount(unreadRes.data));
                }
            } catch (err) {
                console.log('Notification service not available');
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const connectHubs = async () => {
        // ENABLED - Backend SignalR hubs are ready
        try {
            await signalRService.connectPresenceHub();
            // await signalRService.connectNotificationHub(); // Optional
            setHubsReady(true);
            console.log('Presence Hub connected successfully');
        } catch (error) {
            console.error('SignalR connection failed:', error);
            setHubsReady(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <Sidebar />
            <ChatWindow />
        </div>
    );
};

export default Dashboard;