import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Badge } from 'react-bootstrap';
import { FaCrown, FaUserMinus, FaSpinner } from 'react-icons/fa';
import { getRoomMembers, updateMemberRole, removeMember } from '../../services/api/roomService';
import { searchUsers, getUserById } from '../../services/api/authService';
import { toast } from 'react-toastify';

// ================================================================
// ROOM INFO MODAL - Shows room details, members, and admin controls
// ================================================================
// Features:
// - Display room description
// - List all members with their roles
// - Show real user names
// - Admin can promote members to admin
// - Admin can remove members
// ================================================================

const RoomInfoModal = ({ show, onHide, roomId, roomName, roomDescription, currentUserId, isAdmin, onMemberRemoved }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userNames, setUserNames] = useState({});

    // ================================================================
    // Fetch user names from Auth Service using direct user endpoint
    // ================================================================
    const fetchUserNames = async (userIds) => {
        const names = {};
        
        for (const userId of userIds) {
            try {
                // Option 1: Use getUserById endpoint (preferred)
                // This requires implementing getUserById in authService
                const response = await getUserById(userId);
                if (response.success && response.data) {
                    names[userId] = response.data.displayName || response.data.username || `User ${userId}`;
                } else {
                    names[userId] = `User ${userId}`;
                }
            } catch (error) {
                // If getUserById fails, fallback to using userId
                console.warn(`Failed to fetch user ${userId}:`, error);
                names[userId] = `User ${userId}`;
            }
        }
        
        setUserNames(names);
    };

    // ================================================================
    // Alternative: Fetch user names using the room members data directly
    // If the API already returns user names, use them!
    // ================================================================
    const extractUserNamesFromMembers = (membersList) => {
        const names = {};
        membersList.forEach(member => {
            // If member already has userName or displayName from API
            const userName = member.userName || member.displayName || member.name;
            if (userName) {
                names[member.userId] = userName;
            } else {
                names[member.userId] = `User ${member.userId}`;
            }
        });
        return names;
    };

    // Load members when modal opens
    useEffect(() => {
        if (show && roomId) {
            loadMembers();
        }
    }, [show, roomId]);

    // ================================================================
    // Load room members from API
    // ================================================================
    const loadMembers = async () => {
        setLoading(true);
        try {
            const response = await getRoomMembers(roomId);
            if (response.success) {
                const membersList = response.data;
                setMembers(membersList);
                
                // Check if members already have names from the API
                const hasNames = membersList.some(m => m.userName || m.displayName);
                
                if (hasNames) {
                    // Use names directly from API response
                    const names = extractUserNamesFromMembers(membersList);
                    setUserNames(names);
                } else {
                    // Fetch names separately
                    const userIds = membersList.map(m => m.userId);
                    await fetchUserNames(userIds);
                }
            }
        } catch (error) {
            console.error('Failed to load members:', error);
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    // ================================================================
    // Promote a member to admin (only room admin can do this)
    // ================================================================
    const handleMakeAdmin = async (userId) => {
        try {
            await updateMemberRole(roomId, userId, 'ADMIN');
            toast.success('Member promoted to admin');
            loadMembers(); // Refresh member list
            if (onMemberRemoved) onMemberRemoved();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    // ================================================================
    // Remove a member from room (only room admin can do this)
    // ================================================================
    const handleRemoveMember = async (userId, userName) => {
        if (window.confirm(`Remove ${userName} from this room?`)) {
            try {
                await removeMember(roomId, userId);
                toast.success('Member removed');
                loadMembers(); // Refresh member list
                if (onMemberRemoved) onMemberRemoved();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to remove member');
            }
        }
    };

    // Get display name for a member
    const getDisplayName = (member) => {
        // Priority: userNames state > member.userName > member.displayName > fallback
        if (userNames[member.userId]) return userNames[member.userId];
        if (member.userName) return member.userName;
        if (member.displayName) return member.displayName;
        return `User ${member.userId}`;
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{roomName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Room Description Section */}
                <div className="mb-3">
                    <strong>Description:</strong>
                    <p className="text-muted mt-1">{roomDescription || 'No description provided'}</p>
                </div>
                
                <hr />
                
                {/* Members List Section */}
                <strong>Members ({members.length})</strong>
                <ListGroup className="mt-2">
                    {members.map((member) => (
                        <ListGroup.Item key={member.userId} className="d-flex justify-content-between align-items-center">
                            <div>
                                {/* Show real user name */}
                                {getDisplayName(member)}
                                {member.role === 'ADMIN' && (
                                    <Badge bg="warning" className="ms-2" style={{ color: '#000' }}>
                                        <FaCrown /> Admin
                                    </Badge>
                                )}
                            </div>
                            <div>
                                {/* Admin controls - only visible to room admin */}
                                {isAdmin && member.userId !== currentUserId && (
                                    <>
                                        {member.role !== 'ADMIN' && (
                                            <Button 
                                                size="sm" 
                                                variant="outline-warning" 
                                                className="me-1"
                                                onClick={() => handleMakeAdmin(member.userId)}
                                            >
                                                Make Admin
                                            </Button>
                                        )}
                                        <Button 
                                            size="sm" 
                                            variant="outline-danger"
                                            onClick={() => handleRemoveMember(member.userId, getDisplayName(member))}
                                        >
                                            <FaUserMinus /> Remove
                                        </Button>
                                    </>
                                )}
                                {/* Show "You" badge for current user */}
                                {member.userId === currentUserId && (
                                    <Badge bg="secondary">You</Badge>
                                )}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                
                {/* Loading spinner */}
                {loading && (
                    <div className="text-center mt-3">
                        <FaSpinner className="spinner" /> Loading...
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RoomInfoModal;