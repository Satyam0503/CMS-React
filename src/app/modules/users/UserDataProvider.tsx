import { createContext, useContext, useEffect, useState } from "react";
import { EmployeesDataTypes } from "../../../utils/common_types";
import { getUserDetails } from "./userservices";
import { Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { useAppSelector } from "../../Redux/hooks";

type UserDataContextType = {
  userDetails: EmployeesDataTypes | undefined;
  setUserDetails: (userData: EmployeesDataTypes) => void;
  setRefresh: (isRefresh: boolean) => void;
  error: string | undefined;
  isRefresh: boolean;
};

type PropTypes = {
  children: React.ReactNode;
};

//  Create UserDetails Context
const UserDetailsContext = createContext<UserDataContextType | undefined>(
  undefined
);

//  get the token and user id from store
const id = "92fb9794-31c8-4b55-a4b4-dfa74c6cb007";

// User Details Provider
export const UserDetailsProvider = (props: PropTypes) => {
  const token = useAppSelector(state=>state.auth.token)!;
  const [userDetails, setUserDetails] = useState<EmployeesDataTypes>();
  const [isRefresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const intl = useIntl();

  useEffect(() => {
    setLoading(true);
    getUserDetails(id, token)
      .then((res) => {
        const { message, success, methodResult } = res.data;
        if (!success) {
          throw new Error("Failed to fetch employee details");
        }
        setUserDetails(methodResult);
      })
      .catch((error) => {
        setError("Failed to fetch employee details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isRefresh]);

  if (loading) {
    return (
      <Typography variant="h4">
        {" "}
        {intl.formatMessage({ id: "USER.DETAILS_LOADING" })}{" "}
      </Typography>
    );
  }
  if (error) {
    return (
      <Typography variant="h4" color="error">
        {error}
      </Typography>
    );
  }
  return (
    <UserDetailsContext.Provider
      value={{ userDetails, setUserDetails, isRefresh, setRefresh, error }}
    >
      {props.children}
    </UserDetailsContext.Provider>
  );
};

// hook for consuming userDetails Context

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext);
  if (context === undefined) {
    throw new Error("useUserDetails must be used within a UserDetailsProvider");
  }
  return context;
};
