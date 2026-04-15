import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaSignOutAlt, FaInfoCircle } from 'react-icons/fa';
import { leaveRoom, getRoomById } from '../../services/api/roomService';
import { setCurrentChat } from '../../store/slices/messageSlice';
import { toast } from 'react-toastify';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import RoomInfoModal from './RoomInfoModal';
import signalRService from '../../services/signalr/signalrService';

const ChatWindow = () => {
    const { currentChat, typingUsers } = useSelector((state) => state.messages);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [showRoomInfo, setShowRoomInfo] = useState(false);
    const [roomDetails, setRoomDetails] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (currentChat?.type === 'room') {
            fetchRoomDetails();
        }
    }, [currentChat]);

    const fetchRoomDetails = async () => {
        if (currentChat?.type === 'room') {
            try {
                const response = await getRoomById(currentChat.id);
                if (response.success) {
                    setRoomDetails(response.data);
                    setIsAdmin(response.data.userRole === 'ADMIN');
                }
            } catch (error) {
                console.error('Failed to load room details:', error);
            }
        }
    };

    const handleLeaveRoom = async () => {
        if (window.confirm(`Leave room "${currentChat?.name}"?`)) {
            try {
                await leaveRoom(currentChat.id);
                await signalRService.leaveRoomGroup(currentChat.id);
                dispatch(setCurrentChat(null));
                toast.success('Left room successfully');
            } catch (error) {
                toast.error('Failed to leave room');
            }
        }
    };

    if (!currentChat) {
        return (
            <div className="chat-area d-flex justify-content-center align-items-center">
                <div className="text-center text-secondary">
                    <h4>Welcome to ConnectHub</h4>
                    <p>Select a chat to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-area">
            {/* Chat Header */}
            <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="mb-0">{currentChat.name}</h5>
                    <small className="text-secondary">
                        {currentChat.type === 'user' ? 'Direct Message' : 'Group Chat'}
                    </small>
                </div>
                <div>
                    {currentChat.type === 'room' && (
                        <>
                            <button 
                                className="btn btn-outline-info btn-sm me-2" 
                                onClick={() => setShowRoomInfo(true)}
                                title="Room Info"
                            >
                                <FaInfoCircle /> Info
                            </button>
                            <button 
                                className="btn btn-outline-danger btn-sm" 
                                onClick={handleLeaveRoom}
                                title="Leave Room"
                            >
                                <FaSignOutAlt /> Leave
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Message List */}
            <MessageList />

            {/* Typing Indicator */}
            {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

            {/* Message Input */}
            <MessageInput />

            {/* Room Info Modal */}
            {currentChat.type === 'room' && (
                <RoomInfoModal
                    show={showRoomInfo}
                    onHide={() => setShowRoomInfo(false)}
                    roomId={currentChat.id}
                    roomName={roomDetails.roomName}
                    roomDescription={roomDetails.description}
                    currentUserId={user?.id}
                    isAdmin={isAdmin}
                    onMemberRemoved={fetchRoomDetails}
                />
            )}
        </div>
    );
};

export default ChatWindow;