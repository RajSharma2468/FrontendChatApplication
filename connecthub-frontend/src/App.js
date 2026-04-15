import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/Admin/AdminDashboard';
import GoogleCallback from './components/Auth/GoogleCallback';
import 'react-toastify/dist/ReactToastify.css';

// ================================================================
// PRIVATE ROUTE - Only accessible when authenticated
// ================================================================
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const token = localStorage.getItem('connecthub_token');
    const isAuth = isAuthenticated || !!token;
    return isAuth ? children : <Navigate to="/login" />;
};

// ================================================================
// ADMIN ROUTE - Only accessible for admin users
// ================================================================
const AdminRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    const token = localStorage.getItem('connecthub_token');
    const userData = user || JSON.parse(localStorage.getItem('connecthub_user') || '{}');
    return userData?.role === 'ADMIN' ? children : <Navigate to="/dashboard" />;
};

// ================================================================
// PUBLIC ROUTE - Redirect to dashboard if already authenticated
// ================================================================
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const token = localStorage.getItem('connecthub_token');
    const isAuth = isAuthenticated || !!token;
    return !isAuth ? children : <Navigate to="/dashboard" />;
};

function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                {/* Public Routes - Redirect to dashboard if logged in */}
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                } />
                
                {/* Google OAuth Callback - Public */}
                <Route path="/auth/google-callback" element={<GoogleCallback />} />
                
                {/* Private Routes - Require authentication */}
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                } />
                
                {/* Admin Routes - Require admin role */}
                <Route path="/admin" element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                } />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;