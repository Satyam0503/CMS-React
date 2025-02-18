import { createContext, FC, useContext, useEffect, useMemo, useState } from "react";
import { EmployeeModel } from "../../../utils/common_types";
import { getEmployeeById } from "./userservices";
import { setProfileImageUrl } from "../../Redux/Reducers/userSlice";
import { useAppDispatch } from "../../Redux/hooks";

type UserDataContextType = {
  userDetails: EmployeeModel;
  userSkills: string[];
  updateUserDetails: (userData?: EmployeeModel ) => void;
  setUserSkills: (skills: string[]) => void;
  refresh:boolean,
  setRefresh:React.Dispatch<React.SetStateAction<boolean>>
};

type PropTypes = {
  children: React.ReactNode;
};

// Create UserDetails Context
const UserDetailsContext = createContext<UserDataContextType | undefined>(
  undefined
);

// User Details Provider
export const UserDetailsProvider: FC<PropTypes> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [userDetails, setUserDetails] = useState<EmployeeModel>(
    {} as EmployeeModel
  );
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [refresh,setRefresh]= useState(false);

  function updateUserDetails(userData?: EmployeeModel) {
    if (!userData) {
      setUserDetails(prev =>prev);
    }
    else{
      setUserDetails(userData);
    }
  }

  useEffect(()=>{
    getEmployeeById()
    .then(response=>{
      const {success,message,methodResult,statusCode}= response.data;
      if(!(success && statusCode ===200)){
        throw new Error(message);
      }  
      setUserDetails(methodResult);
      dispatch(setProfileImageUrl(methodResult.fullProfileUrl!));
    })
    .catch(error=>{
      console.error(error);
    })
  },[refresh])
  
  return (
    <UserDetailsContext.Provider
      value={{
        userDetails,
        userSkills,
        updateUserDetails,
        setUserSkills,
        refresh,
        setRefresh
      }}
    >
      {children}
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
