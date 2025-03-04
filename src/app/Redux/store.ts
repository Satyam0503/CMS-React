import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./Reducers/userSlice";
import { authReducer } from "./Reducers/authSlice";
import { filterReducers } from "./Reducers/filterSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    filters:filterReducers,
  },
});

// type for root state object, Dispatch function and store

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
