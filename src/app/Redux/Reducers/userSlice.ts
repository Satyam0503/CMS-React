import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserModel } from "../../../utils/common_types";

interface UserDetailsModel {
  userData: UserModel | undefined;
}

const initialState: UserDetailsModel = {
  userData: undefined,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<UserModel>) => {
      state.userData = action.payload;
    },
    resetUserSlice: (state) => {
      state.userData = undefined;
    },
  },
});

// exporting userReducer and action creator
export const userReducer = userSlice.reducer;
export const { setCurrentUser, resetUserSlice } = userSlice.actions;
