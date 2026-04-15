import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { createRoom } from '../../services/api/roomService';
import { addRoom } from '../../store/slices/roomSlice';
import { toast } from 'react-toastify';

const CreateRoomModal = ({ show, onHide }) => {
    const [roomName, setRoomName] = useState('');
    const [description, setDescription] = useState('');
    const [roomType, setRoomType] = useState('PUBLIC');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        if (!roomName.trim()) {
            toast.error('Room name is required');
            return;
        }

        setLoading(true);
        try {
            const response = await createRoom({
                roomName,
                description,
                roomType
            });
            
            if (response.success) {
                dispatch(addRoom(response.data));
                toast.success('Room created successfully');
                onHide();
                setRoomName('');
                setDescription('');
                setRoomType('PUBLIC');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Create New Room</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Room Name *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter room name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Room description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Room Type</Form.Label>
                        <Form.Select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                            <option value="PUBLIC">Public - Anyone can join</option>
                            <option value="PRIVATE">Private - Invite only</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Room'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateRoomModal;