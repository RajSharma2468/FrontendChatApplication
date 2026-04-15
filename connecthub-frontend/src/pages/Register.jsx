import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register } from '../services/api/authService';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (formData.username.length < 3) {
            toast.error('Username must be at least 3 characters');
            return;
        }
        
        if (formData.displayName.length < 2) {
            toast.error('Display name must be at least 2 characters');
            return;
        }
        
        if (!formData.email.includes('@')) {
            toast.error('Enter valid email address');
            return;
        }
        
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await register({
                username: formData.username,
                displayName: formData.displayName,
                email: formData.email,
                password: formData.password
            });

            if (response.success) {
                toast.success('Registration successful! Please login.');
                navigate('/login');
            } else {
                toast.error(response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="card shadow-lg" style={{ width: '100%', maxWidth: '450px' }}>
                <div className="card-header bg-primary text-white text-center py-3">
                    <h3 className="mb-0">Create Account</h3>
                    <small>Join ConnectHub</small>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Username *</label>
                            <input
                                type="text"
                                name="username"
                                className="form-control"
                                placeholder="Choose a username (min 3 chars)"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Display Name *</label>
                            <input
                                type="text"
                                name="displayName"
                                className="form-control"
                                placeholder="How others see you"
                                value={formData.displayName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password *</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                    </form>
                </div>
                <div className="card-footer text-center py-3">
                    <span>Already have an account? </span>
                    <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;