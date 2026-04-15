import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUsers, FaPlus, FaSpinner } from 'react-icons/fa';
import { getMyRooms, getPublicRooms, joinRoom } from '../../services/api/roomService';
import { setMyRooms, setPublicRooms } from '../../store/slices/roomSlice';
import { toast } from 'react-toastify';

// ================================================================
// ROOM LIST COMPONENT - Displays My Rooms and Public Rooms
// ================================================================
// Features:
// - Display rooms where user is a member (My Rooms)
// - Display all public rooms available to join
// - Join public rooms with proper error handling
// - Prevent duplicate join attempts
// - Show loading state during join operation
// ================================================================

const RoomList = ({ onSelectRoom }) => {
    const { myRooms, rooms } = useSelector((state) => state.rooms);
    const dispatch = useDispatch();
    const [joiningRoomId, setJoiningRoomId] = useState(null); // Track which room is being joined

    // Load rooms when component mounts
    useEffect(() => {
        loadRooms();
    }, []);

    // ================================================================
    // Load both My Rooms and Public Rooms from API
    // ================================================================
    const loadRooms = async () => {
        try {
            const [myRoomsRes, publicRoomsRes] = await Promise.all([
                getMyRooms(),
                getPublicRooms()
            ]);
            
            if (myRoomsRes.success) dispatch(setMyRooms(myRoomsRes.data));
            if (publicRoomsRes.success) dispatch(setPublicRooms(publicRoomsRes.data));
        } catch (error) {
            console.error('Failed to load rooms:', error);
            toast.error('Failed to load rooms');
        }
    };

    // ================================================================
    // FIXED: Handle Join Room - Prevents duplicate joins and 400 errors
    // ================================================================
    const handleJoinRoom = async (roomId, event) => {
        event.stopPropagation(); // Prevent triggering parent onClick
        
        // Check if already a member of this room
        const isAlreadyMember = myRooms.some(room => room.id === roomId);
        
        if (isAlreadyMember) {
            toast.info('You are already a member of this room');
            return;
        }
        
        // Prevent multiple simultaneous join attempts
        if (joiningRoomId === roomId) {
            return;
        }
        
        setJoiningRoomId(roomId);
        
        try {
            const response = await joinRoom(roomId);
            
            if (response.success) {
                toast.success('Joined room successfully');
                await loadRooms(); // Refresh both room lists
                
                // Optional: Auto-select the newly joined room
                // onSelectRoom(roomId, 'room', response.data?.roomName);
            }
        } catch (error) {
            console.error('Join room error:', error);
            
            // Handle different error scenarios
            if (error.response?.status === 400) {
                const message = error.response?.data?.message;
                
                if (message?.includes('already an active member') || 
                    message?.includes('Already a member')) {
                    toast.info('You are already a member of this room');
                    loadRooms(); // Refresh to update UI
                } else if (message?.includes('Room not found')) {
                    toast.error('Room does not exist');
                } else if (message?.includes('full')) {
                    toast.warning('This room is full');
                } else {
                    toast.info(message || 'Cannot join this room');
                }
            } else {
                toast.error('Failed to join room. Please try again.');
            }
        } finally {
            setJoiningRoomId(null); // Reset loading state
        }
    };

    // ================================================================
    // Check if user is already a member of a room
    // ================================================================
    const isMemberOfRoom = (roomId) => {
        return myRooms.some(room => room.id === roomId);
    };

    return (
        <div className="p-2">
            {/* ================================================================ */}
            {/* MY ROOMS SECTION - Rooms where user is already a member */}
            {/* ================================================================ */}
            <div className="text-secondary mb-2 small">MY ROOMS</div>
            {myRooms.length === 0 ? (
                <div className="text-secondary text-center py-3 small">
                    No rooms yet. Join a public room below!
                </div>
            ) : (
                myRooms.map((room) => (
                    <div
                        key={room.id}
                        className="d-flex align-items-center p-2 rounded mb-1"
                        style={{ cursor: 'pointer', backgroundColor: '#34495e' }}
                        onClick={() => onSelectRoom(room.id, 'room', room.roomName)}
                    >
                        <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center"
                            style={{ width: '40px', height: '40px' }}>
                            <FaUsers className="text-white" />
                        </div>
                        <div className="ms-2 flex-grow-1">
                            <div className="fw-bold text-white">{room.roomName}</div>
                            <small className="text-secondary">{room.memberCount} members</small>
                        </div>
                        {/* Show role badge for admin */}
                        {room.userRole === 'ADMIN' && (
                            <span className="badge bg-warning text-dark ms-2">Admin</span>
                        )}
                    </div>
                ))
            )}

            {/* ================================================================ */}
            {/* PUBLIC ROOMS SECTION - Available rooms to join */}
            {/* ================================================================ */}
            <div className="text-secondary mb-2 mt-3 small">PUBLIC ROOMS</div>
            {rooms.filter(r => !isMemberOfRoom(r.id)).map((room) => (
                <div
                    key={room.id}
                    className="d-flex align-items-center p-2 rounded mb-1"
                    style={{ backgroundColor: '#34495e' }}
                >
                    <div className="bg-secondary rounded-circle d-flex justify-content-center align-items-center"
                        style={{ width: '40px', height: '40px' }}>
                        <FaUsers className="text-white" />
                    </div>
                    <div className="ms-2 flex-grow-1">
                        <div className="fw-bold text-white">{room.roomName}</div>
                        <small className="text-secondary">{room.memberCount} members</small>
                    </div>
                    <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={(event) => handleJoinRoom(room.id, event)}
                        disabled={joiningRoomId === room.id}
                    >
                        {joiningRoomId === room.id ? (
                            <FaSpinner className="spinner-border spinner-border-sm me-1" />
                        ) : (
                            'Join'
                        )}
                    </button>
                </div>
            ))}

            {/* Show message if no public rooms available */}
            {rooms.filter(r => !isMemberOfRoom(r.id)).length === 0 && (
                <div className="text-secondary text-center py-3 small">
                    No public rooms available to join
                </div>
            )}
        </div>
    );
};

export default RoomList;