import { createSlice } from "@reduxjs/toolkit";

interface AuthenticationState {
  isUserAuthenticated: boolean;
}

const initialState: AuthenticationState = {
  isUserAuthenticated: false,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state) => {
      state.isUserAuthenticated = true;
    },
    userLogout: (state) => {
      state.isUserAuthenticated = false;
    },
  },
});

// export authReducer and action creator
export const authReducer = authSlice.reducer;
export const { setAuth } = authSlice.actions;
