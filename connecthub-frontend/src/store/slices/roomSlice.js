import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    rooms: [],
    myRooms: [],
    currentRoom: null,
    loading: false
};

const roomSlice = createSlice({
    name: 'rooms',
    initialState,
    reducers: {
        setPublicRooms: (state, action) => {
            state.rooms = action.payload;
        },
        setMyRooms: (state, action) => {
            state.myRooms = action.payload;
        },
        addRoom: (state, action) => {
            state.rooms.push(action.payload);
            state.myRooms.push(action.payload);
        },
        setCurrentRoom: (state, action) => {
            state.currentRoom = action.payload;
        },
        updateRoomMemberCount: (state, action) => {
            const { roomId, memberCount } = action.payload;
            const room = state.rooms.find(r => r.id === roomId);
            if (room) room.memberCount = memberCount;
        }
    }
});

export const { setPublicRooms, setMyRooms, addRoom, setCurrentRoom, updateRoomMemberCount } = roomSlice.actions;
export default roomSlice.reducer;