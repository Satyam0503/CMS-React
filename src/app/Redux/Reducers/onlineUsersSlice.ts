import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnlineUsersState {
    onlineUsers: string[];
}

const initialState: OnlineUsersState = {
    onlineUsers: [],
};

export const onlineUsersSlice = createSlice({
    name: "onlineUsers",
    initialState,
    reducers: {
        setOnlineUsers: (state, action: PayloadAction<string[]>) => {
            state.onlineUsers = action.payload;
        },
        removeOnlineUser: (state, action: PayloadAction<string>) => {
            state.onlineUsers = state.onlineUsers.filter(userId => userId !== action.payload);
        },
        resetOnlineUsers: (state) => {
            state.onlineUsers = [];
        },
    },
});

export const onlineUsersReducer = onlineUsersSlice.reducer;
export const { setOnlineUsers, resetOnlineUsers, removeOnlineUser } = onlineUsersSlice.actions;
