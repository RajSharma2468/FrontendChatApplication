import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../store/slices/authSlice';  // Fixed path
import { toast } from 'react-toastify';

const GoogleCallback = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        // Get parameters from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const userId = params.get('userId');
        const displayName = params.get('displayName');
        const username = params.get('username');

        if (token && userId) {
            // Create user object
            const user = {
                id: parseInt(userId),
                displayName: decodeURIComponent(displayName),
                username: username,
                role: 'USER'
            };
            
            // Save to Redux and localStorage
            dispatch(loginSuccess({
                user: user,
                token: token
            }));
            
            toast.success('Google login successful!');
            navigate('/dashboard');
        } else {
            toast.error('Google login failed. Please try again.');
            navigate('/login');
        }
    }, [dispatch, navigate]);

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="text-center">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Authenticating with Google...</p>
            </div>
        </div>
    );
};

export default GoogleCallback;