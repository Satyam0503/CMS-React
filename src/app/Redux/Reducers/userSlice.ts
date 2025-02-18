import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ModulePermissoinModel, UserDataModel } from "../../../utils/common_types";


interface UserDetailsModel {
  userData:UserDataModel | undefined;
  userPermissions: ModulePermissoinModel[];
  profileImageUrl:string;
}

const initialState: UserDetailsModel = {
  userData:undefined,
  userPermissions:[],
  profileImageUrl:"",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser:(state,action:PayloadAction<UserDataModel | undefined>)=>{
      state.userData= action.payload;
    },
    setUserPermissions: (state,action:PayloadAction<ModulePermissoinModel[]>)=>{
      state.userPermissions= action.payload;
    },
    setProfileImageUrl :(state, action:PayloadAction<string>) =>{
      state.profileImageUrl= action.payload;
    }
  },
});

// exporting userReducer and action creator
export const userReducer = userSlice.reducer;
export const { setCurrentUser, setUserPermissions, setProfileImageUrl } = userSlice.actions;
