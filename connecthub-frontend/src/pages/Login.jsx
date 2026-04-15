import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginSuccess } from '../store/slices/authSlice';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ================================================================
    // HANDLE NORMAL LOGIN
    // ================================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5046/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (data.success) {
                // Create user object
                const user = {
                    id: data.data.userId,
                    username: data.data.username,
                    displayName: data.data.displayName,
                    email: data.data.email,
                    role: data.data.role || 'USER'
                };
                
                // Dispatch Redux action (this will also save to localStorage)
                dispatch(loginSuccess({
                    user: user,
                    token: data.data.token
                }));
                
                toast.success('Login successful!');
                navigate('/dashboard');
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // ================================================================
    // HANDLE GOOGLE LOGIN - Redirect to backend Google OAuth
    // ================================================================
    const handleGoogleLogin = () => {
        // Redirect to backend Google login endpoint
        window.location.href = 'http://localhost:5046/api/auth/google-login';
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-header bg-primary text-white text-center py-3">
                    <h3 className="mb-0">ConnectHub</h3>
                    <small>Real Time Chat</small>
                </div>
                <div className="card-body p-4">
                    {/* Normal Login Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Username or Email</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter username or email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="position-relative my-4">
                        <hr />
                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                            OR
                        </span>
                    </div>

                    {/* Google Login Button */}
                    <button 
                        className="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                        onClick={handleGoogleLogin}
                    >
                        <FaGoogle size={18} />
                        Sign in with Google
                    </button>
                </div>
                <div className="card-footer text-center py-3">
                    <span>Don't have an account? </span>
                    <Link to="/register">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;