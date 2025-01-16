
const AUTH_LOCAL_STORAGE_KEY = "kt-auth-react-v";

const getLocalKey = (): string | undefined => {
  if (!localStorage) {
    return;
  }

  const lsValue: string | null = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY);
  if (!lsValue) {
    return;
  }
  return lsValue;
};

const setLocalKey = (key: string) => {
  if (!localStorage) {
    return;
  }

  try {
    localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, key);
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

// export function setupAxios(axios: any) {
//   axios.defaults.headers.Accept = "application/json";
//   axios.interceptors.request.use(
//     (config: { headers: { Authorization: string } }) => {
//       const auth = getAuth();
//       if (auth && auth.token) {
//         config.headers.Authorization = `Bearer ${auth.token}`;
//       }

//       return config;
//     },
//     (err: any) => Promise.reject(err)
//   );
// }

export { getLocalKey, setLocalKey, removeLocalKey, AUTH_LOCAL_STORAGE_KEY };
