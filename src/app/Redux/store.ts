import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./Reducers/userSlice";
import { authReducer } from "./Reducers/authSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
  },
});

// type for root state object, Dispatch function and store

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
