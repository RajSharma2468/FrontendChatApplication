import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProfile, updateProfile } from '../services/api/authService';
import { loginSuccess } from '../store/slices/authSlice';
import Navbar from '../components/Common/Navbar';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        avatarUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        try {
            const response = await getProfile();
            if (response.success) {
                setFormData({
                    displayName: response.data.displayName || '',
                    bio: response.data.bio || '',
                    avatarUrl: response.data.avatarUrl || ''
                });
            }
        } catch (error) {
            toast.error('Failed to load profile');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await updateProfile(formData);
            if (response.success) {
                dispatch(loginSuccess({ user: response.data, token: localStorage.getItem('connecthub_token') }));
                toast.success('Profile updated successfully');
            } else {
                toast.error(response.message || 'Update failed');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">My Profile</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={user?.username || ''}
                                            disabled
                                        />
                                        <small className="text-muted">Username cannot be changed</small>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={user?.email || ''}
                                            disabled
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Display Name</label>
                                        <input
                                            type="text"
                                            name="displayName"
                                            className="form-control"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            placeholder="How others see you"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Bio</label>
                                        <textarea
                                            name="bio"
                                            className="form-control"
                                            rows="3"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Tell something about yourself"
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Avatar URL</label>
                                        <input
                                            type="text"
                                            name="avatarUrl"
                                            className="form-control"
                                            value={formData.avatarUrl}
                                            onChange={handleChange}
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;