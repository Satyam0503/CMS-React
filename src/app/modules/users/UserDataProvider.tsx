import { createContext, FC, useContext, useEffect, useMemo, useState } from "react";
import { EmployeeModel } from "../../../utils/common_types";
import { getEmployeeById } from "./userservices";
import { useParams } from "react-router-dom";

type UserDataContextType = {
  userDetails: EmployeeModel;
  userSkills: string[];
  updateUserDetails: (userData?: EmployeeModel ) => void;
  updateUserSkills:(skills:string[])=>void;
  setRefresh:()=> void;
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
  const [userDetails, setUserDetails] = useState<EmployeeModel>({} as EmployeeModel);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [refresh,setRefresh]= useState(false);
  const employeeId = useParams().employeeid ?? "";

  function updateUserDetails(userData?: EmployeeModel) {
    if (!userData) {
      setUserDetails(prev =>prev);
    }
    else{
      setUserDetails(userData);
    }
  }

  function updateUserSkills(skills:string[]){
    setUserSkills(skills);
  }

  function handleRefresh(){
    setRefresh(!refresh);
  }
 
  useEffect(()=>{
    getEmployeeById(employeeId)
    .then(response=>{
      const {success,message,methodResult,statusCode}= response.data;
      if(!(success && statusCode ===200)){
        throw new Error(message);
      }  
      setUserDetails(methodResult);
    })
    .catch(error=>{
      console.error(error.message);
    })
  },[refresh])  
  
  return (
    <UserDetailsContext.Provider
      value={{
        userDetails,
        userSkills,
        updateUserDetails,
        updateUserSkills,
        setRefresh:handleRefresh,
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
