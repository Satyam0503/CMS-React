import { createContext, FC, useContext, useEffect, useMemo, useState } from "react";
import { EmployeeModel } from "../../../utils/common_types";
import { getEmployeeById } from "./userservices";
import { useParams } from "react-router-dom";

type UserDataContextType = {
  userDetails: EmployeeModel;
  totalSkills:number;
  updateUserDetails: (userData?: EmployeeModel ) => void;
  updateTotalSkills:(totalSkills:number)=>void;
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
  const [totalSkills, setTotalSkills] = useState(0);
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

  function updateTotalSkills(totalSkills:number){
    setTotalSkills(totalSkills);
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
        totalSkills,
        updateUserDetails,
        updateTotalSkills,
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
