import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaComments, FaDoorOpen, FaChartLine, FaHistory, FaTrash, FaBan } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
    getAdminUsers,
    getAdminRooms,
    getAdminMessages,
    getAdminAnalytics,
    getAdminAuditLogs,
    suspendUser,
    deleteUser,
    deleteRoom,
    deleteMessage
} from '../../services/api/adminService';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/dashboard');
            return;
        }
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'analytics':
                    const analyticsRes = await getAdminAnalytics();
                    if (analyticsRes.success) setAnalytics(analyticsRes.data);
                    break;
                case 'users':
                    const usersRes = await getAdminUsers();
                    if (usersRes.success) setUsers(usersRes.data);
                    break;
                case 'rooms':
                    const roomsRes = await getAdminRooms();
                    if (roomsRes.success) setRooms(roomsRes.data);
                    break;
                case 'messages':
                    const messagesRes = await getAdminMessages();
                    if (messagesRes.success) setMessages(messagesRes.data);
                    break;
                case 'logs':
                    const logsRes = await getAdminAuditLogs();
                    if (logsRes.success) setAuditLogs(logsRes.data);
                    break;
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendUser = async (userId) => {
        if (window.confirm('Are you sure you want to suspend this user?')) {
            try {
                const response = await suspendUser(userId, 'Violation of terms');
                if (response.success) {
                    toast.success('User suspended successfully');
                    loadData();
                }
            } catch (error) {
                toast.error('Failed to suspend user');
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to permanently delete this user?')) {
            try {
                const response = await deleteUser(userId);
                if (response.success) {
                    toast.success('User deleted successfully');
                    loadData();
                }
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                const response = await deleteRoom(roomId);
                if (response.success) {
                    toast.success('Room deleted successfully');
                    loadData();
                }
            } catch (error) {
                toast.error('Failed to delete room');
            }
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                const response = await deleteMessage(messageId);
                if (response.success) {
                    toast.success('Message deleted successfully');
                    loadData();
                }
            } catch (error) {
                toast.error('Failed to delete message');
            }
        }
    };

    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="container-fluid p-0">
            <div className="d-flex">
                {/* Sidebar */}
                <div className="bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
                    <div className="p-3 border-bottom border-secondary">
                        <h4 className="mb-0">Admin Panel</h4>
                        <small className="text-secondary">ConnectHub Admin</small>
                    </div>
                    <nav className="nav flex-column p-2">
                        <button
                            className={`btn btn-dark text-start mb-1 ${activeTab === 'analytics' ? 'active bg-primary' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <FaChartLine className="me-2" /> Analytics
                        </button>
                        <button
                            className={`btn btn-dark text-start mb-1 ${activeTab === 'users' ? 'active bg-primary' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <FaUsers className="me-2" /> Users
                        </button>
                        <button
                            className={`btn btn-dark text-start mb-1 ${activeTab === 'rooms' ? 'active bg-primary' : ''}`}
                            onClick={() => setActiveTab('rooms')}
                        >
                            <FaDoorOpen className="me-2" /> Rooms
                        </button>
                        <button
                            className={`btn btn-dark text-start mb-1 ${activeTab === 'messages' ? 'active bg-primary' : ''}`}
                            onClick={() => setActiveTab('messages')}
                        >
                            <FaComments className="me-2" /> Messages
                        </button>
                        <button
                            className={`btn btn-dark text-start mb-1 ${activeTab === 'logs' ? 'active bg-primary' : ''}`}
                            onClick={() => setActiveTab('logs')}
                        >
                            <FaHistory className="me-2" /> Audit Logs
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-grow-1 p-4">
                    {loading && (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && analytics && (
                        <div>
                            <h3 className="mb-4">Platform Analytics</h3>
                            <div className="row">
                                <div className="col-md-3 mb-3">
                                    <div className="card bg-primary text-white">
                                        <div className="card-body">
                                            <h5 className="card-title">Total Users</h5>
                                            <h2 className="mb-0">{analytics.totalUsers}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card bg-success text-white">
                                        <div className="card-body">
                                            <h5 className="card-title">Active Users (24h)</h5>
                                            <h2 className="mb-0">{analytics.activeUsers24h}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card bg-info text-white">
                                        <div className="card-body">
                                            <h5 className="card-title">Total Messages</h5>
                                            <h2 className="mb-0">{analytics.totalMessages}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card bg-warning text-dark">
                                        <div className="card-body">
                                            <h5 className="card-title">Messages Today</h5>
                                            <h2 className="mb-0">{analytics.messagesToday}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card bg-secondary text-white">
                                        <div className="card-body">
                                            <h5 className="card-title">Total Rooms</h5>
                                            <h2 className="mb-0">{analytics.totalRooms}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <div className="card bg-danger text-white">
                                        <div className="card-body">
                                            <h5 className="card-title">Active Connections</h5>
                                            <h2 className="mb-0">{analytics.activeConnections}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-muted mt-3">
                                Generated at: {new Date(analytics.generatedAt).toLocaleString()}
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div>
                            <h3 className="mb-4">User Management</h3>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Username</th>
                                            <th>Display Name</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Messages</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.username}</td>
                                                <td>{user.displayName}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                        {user.isActive ? 'Active' : 'Suspended'}
                                                    </span>
                                                </td>
                                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td>{user.messageCount}</td>
                                                <td>
                                                    {user.isActive ? (
                                                        <button
                                                            className="btn btn-sm btn-warning me-1"
                                                            onClick={() => handleSuspendUser(user.id)}
                                                        >
                                                            <FaBan /> Suspend
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-sm btn-success me-1"
                                                            onClick={() => handleSuspendUser(user.id)}
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        <FaTrash /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Rooms Tab */}
                    {activeTab === 'rooms' && (
                        <div>
                            <h3 className="mb-4">Room Management</h3>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Room Name</th>
                                            <th>Type</th>
                                            <th>Creator</th>
                                            <th>Members</th>
                                            <th>Messages</th>
                                            <th>Created</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map((room) => (
                                            <tr key={room.id}>
                                                <td>{room.id}</td>
                                                <td>{room.roomName}</td>
                                                <td>{room.roomType}</td>
                                                <td>{room.creatorName}</td>
                                                <td>{room.memberCount}</td>
                                                <td>{room.messageCount}</td>
                                                <td>{new Date(room.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge ${room.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                        {room.isActive ? 'Active' : 'Deleted'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteRoom(room.id)}
                                                    >
                                                        <FaTrash /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Messages Tab */}
                    {activeTab === 'messages' && (
                        <div>
                            <h3 className="mb-4">Message Management</h3>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Sender</th>
                                            <th>Receiver/Room</th>
                                            <th>Content</th>
                                            <th>Sent At</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {messages.map((message) => (
                                            <tr key={message.id}>
                                                <td>{message.id}</td>
                                                <td>{message.senderName}</td>
                                                <td>{message.receiverName || message.roomName || 'N/A'}</td>
                                                <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                                                    {message.content}
                                                </td>
                                                <td>{new Date(message.sentAt).toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge ${!message.isDeleted ? 'bg-success' : 'bg-danger'}`}>
                                                        {!message.isDeleted ? 'Active' : 'Deleted'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteMessage(message.id)}
                                                    >
                                                        <FaTrash /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Audit Logs Tab */}
                    {activeTab === 'logs' && (
                        <div>
                            <h3 className="mb-4">Audit Logs</h3>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Admin</th>
                                            <th>Action</th>
                                            <th>Target Type</th>
                                            <th>Target ID</th>
                                            <th>Details</th>
                                            <th>IP Address</th>
                                            <th>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td>{log.id}</td>
                                                <td>{log.adminName}</td>
                                                <td>
                                                    <span className="badge bg-info">{log.action}</span>
                                                </td>
                                                <td>{log.targetType}</td>
                                                <td>{log.targetId}</td>
                                                <td>{log.details || '-'}</td>
                                                <td>{log.ipAddress || '-'}</td>
                                                <td>{new Date(log.createdAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;