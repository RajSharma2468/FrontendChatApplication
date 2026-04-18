import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginSuccess } from '../store/slices/authSlice';
import { FaGoogle } from 'react-icons/fa';
import { login } from '../services/api/authService';
import { googleLogin } from '../services/api/authService';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await login({ username, password });
            console.log('Login response:', data);

            if (data.success) {
                const user = {
                    id: data.data.userId,
                    username: data.data.username,
                    displayName: data.data.displayName,
                    email: data.data.email,
                    role: data.data.role || 'USER'
                };

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
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        googleLogin();
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-header bg-primary text-white text-center py-3">
                    <h3 className="mb-0">ConnectHub</h3>
                    <small>Real Time Chat</small>
                </div>
                <div className="card-body p-4">
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

                    <div className="position-relative my-4">
                        <hr />
                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                            OR
                        </span>
                    </div>

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