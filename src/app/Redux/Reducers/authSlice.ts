import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { AuthTokens } from "../../modules/auth";
import { AUTH_LOCAL_STORAGE_KEY } from "../../../utils/constant/Constant";

interface AuthenticationState {
  isUserAuthenticated: boolean;
  token: string | null;
}

const getStoredAccessToken = (): string | null => {
  const storedAuth = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY);
  if (!storedAuth) {
    return null;
  }

  try {
    const authTokens = JSON.parse(storedAuth) as Partial<AuthTokens>;
    return typeof authTokens.token === "string" && authTokens.token.length > 0
      ? authTokens.token
      : null;
  } catch {
    // A malformed legacy value must not prevent the application from loading.
    return null;
  }
};

const initialState: AuthenticationState = {
  isUserAuthenticated: false,
  token: getStoredAccessToken(),
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state) => {
      state.isUserAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.token = null;
      state.isUserAuthenticated = false;
    },
  },
});

// export authReducer and action creator
export const authReducer = authSlice.reducer;
export const { setAuth, setToken, logout } = authSlice.actions;

//  selector functions
export const getToken = (state: RootState) => state.auth.token;
export const getAuthentication = (state: RootState) =>
  state.auth.isUserAuthenticated;
