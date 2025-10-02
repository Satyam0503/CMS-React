import { AUTH_LOCAL_STORAGE_KEY } from "../../../../utils/constant/Constant";
import { AuthTokens } from "./_models";

const clientId = "ClientId";

const getLocalKey = (): AuthTokens | undefined => {
  if (!localStorage) {
    return;
  }
  const lsValue: string | null = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY);
  if (!lsValue) {
    return;
  }
  try {
    const authKeys: AuthTokens = JSON.parse(lsValue) as AuthTokens;
    return authKeys;
  } catch (error) {
    console.error("AUTH LOCAL STORAGE PARSE ERROR", error);
  }
};

const setLocalKey = (keys: AuthTokens) => {
  if (!localStorage) {
    return;
  }
  try {
    const lsValue = JSON.stringify(keys);
    localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, lsValue);
  } catch (error) {
    console.error("AUTH LOCAL STORAGE SAVE ERROR", error);
  }
};

const removeLocalKey = () => {
  if (!localStorage) {
    return;
  }
  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error("AUTH LOCAL STORAGE REMOVE ERROR", error);
  }
};

export { getLocalKey, setLocalKey, removeLocalKey };
