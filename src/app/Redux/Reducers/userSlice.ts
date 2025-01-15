import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  token: string | null;
  userId: string | null;
  companyId: string | null;
  roleName: string;
  roleId: string | null;
  permissions: any[];
}
interface PermissionModel {
  permissionId:string;
  permissionName:string;
}

const initialState: UserState = {
  token: null,
  userId: null,
  companyId: null,
  roleName: "",
  roleId: "",
  permissions: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    setRoleName:(state,action:PayloadAction<{roleName:string}>)=>{
        state.roleName = action.payload.roleName;
    },
    setPermissions:(state,action:PayloadAction<PermissionModel[]> )=>{
      state.permissions= action.payload;
    }
  },
});

// exporting userReducer and action creator
export const userReducer = userSlice.reducer;
export const { setToken , setRoleName } = userSlice.actions;
