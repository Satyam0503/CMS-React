import { createSlice } from "@reduxjs/toolkit";

interface AuthenticationState {
  isUserAuthorized: boolean;
}

const initialState: AuthenticationState = {
  isUserAuthorized: false,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state) => {
      state.isUserAuthorized = true;
    },
    userLogout: (state) => {
      state.isUserAuthorized = false;
    },
  },
});

// export authReducer and action creator
export const authReducer = authSlice.reducer;
export const { setAuth } = authSlice.actions;
