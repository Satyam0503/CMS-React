import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserModel } from "../../../utils/common_types";


interface UserDetailsModel {
  userData:UserModel | undefined;
}

const initialState: UserDetailsModel = {
  userData:undefined,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser:(state,action:PayloadAction<UserModel | undefined>)=>{
      state.userData= action.payload;
    },
  },
});

// exporting userReducer and action creator
export const userReducer = userSlice.reducer;
export const { setCurrentUser } = userSlice.actions;
