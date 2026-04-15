import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../../store/slices/authSlice';
import NotificationBell from './NotificationBell';
import { toast } from 'react-toastify';

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const { unreadCount } = useSelector((state) => state.notifications);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        toast.info('Logged out successfully');
    };

    return (
        <nav className="navbar navbar-dark bg-primary px-3">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/dashboard">
                    <strong>ConnectHub</strong>
                </Link>
                
                <div className="d-flex align-items-center ms-auto">
                    {/* Notification Bell */}
                    <NotificationBell />
                    
                    {/* User Menu */}
                    <div className="dropdown ms-3">
                        <button
                            className="btn btn-link text-white text-decoration-none dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                        >
                            <FaUser className="me-1" />
                            {user?.displayName}
                            {unreadCount > 0 && (
                                <span className="badge bg-danger rounded-pill ms-1">{unreadCount}</span>
                            )}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <Link className="dropdown-item" to="/profile">
                                    <FaUser className="me-2" /> Profile
                                </Link>
                            </li>
                            {user?.role === 'ADMIN' && (
                                <li>
                                    <Link className="dropdown-item" to="/admin">
                                        Admin Panel
                                    </Link>
                                </li>
                            )}
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button className="dropdown-item" onClick={handleLogout}>
                                    <FaSignOutAlt className="me-2" /> Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;