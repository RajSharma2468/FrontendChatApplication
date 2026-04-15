import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { searchUsers } from '../../services/api/authService';
import { FaSearch } from 'react-icons/fa';

const UserList = ({ onSelectChat }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const { onlineUsers } = useSelector((state) => state.presence);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (searchTerm.length >= 2) {
            searchUsersAPI();
        } else {
            setUsers([]);
        }
    }, [searchTerm]);

    const searchUsersAPI = async () => {
        setLoading(true);
        try {
            const response = await searchUsers(searchTerm);
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const isOnline = (userId) => {
        return onlineUsers.includes(userId);
    };

    return (
        <div className="p-2">
            {/* Search Bar */}
            <div className="input-group mb-3">
                <span className="input-group-text bg-dark text-white border-0">
                    <FaSearch />
                </span>
                <input
                    type="text"
                    className="form-control bg-dark text-white border-0"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users List */}
            {loading && (
                <div className="text-center text-white p-3">
                    <div className="spinner-border spinner-border-sm"></div>
                </div>
            )}

            {!loading && users.length === 0 && searchTerm.length >= 2 && (
                <div className="text-center text-secondary p-3">
                    No users found
                </div>
            )}

            {users.map((u) => (
                <div
                    key={u.id}
                    className="d-flex align-items-center p-2 rounded mb-1"
                    style={{ cursor: 'pointer', backgroundColor: '#34495e' }}
                    onClick={() => onSelectChat(u.id, 'user', u.displayName)}
                >
                    <div className="position-relative">
                        <div className="bg-secondary rounded-circle d-flex justify-content-center align-items-center"
                            style={{ width: '40px', height: '40px' }}>
                            <span className="text-white">{u.displayName?.charAt(0)}</span>
                        </div>
                        <span className={`online-badge ${isOnline(u.id) ? 'online' : 'offline'}`}
                            style={{ position: 'absolute', bottom: 0, right: 0 }}></span>
                    </div>
                    <div className="ms-2 flex-grow-1">
                        <div className="fw-bold text-white">{u.displayName}</div>
                        <small className="text-secondary">@{u.username}</small>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserList;