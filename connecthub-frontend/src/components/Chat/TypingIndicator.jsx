import React from 'react';
import { useSelector } from 'react-redux';

const TypingIndicator = ({ users }) => {
    const { user } = useSelector((state) => state.auth);
    
    // Filter out current user from typing users
    const otherUsers = users.filter(id => id !== user?.id);
    
    if (otherUsers.length === 0) return null;

    let text = '';
    if (otherUsers.length === 1) {
        text = 'Someone is typing...';
    } else if (otherUsers.length === 2) {
        text = '2 people are typing...';
    } else {
        text = 'Several people are typing...';
    }

    return (
        <div className="px-3 py-2" style={{ fontSize: '12px', color: '#6c757d' }}>
            <span className="typing-animation"></span>
            {text}
            <style>{`
                .typing-animation {
                    display: inline-block;
                    width: 20px;
                    height: 12px;
                    background: repeating-linear-gradient(
                        90deg,
                        #6c757d,
                        #6c757d 3px,
                        transparent 3px,
                        transparent 6px
                    );
                    animation: typing 1s infinite;
                    margin-right: 5px;
                }
                @keyframes typing {
                    0% { opacity: 0.3; }
                    50% { opacity: 1; }
                    100% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default TypingIndicator;