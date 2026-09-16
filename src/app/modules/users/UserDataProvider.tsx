import { createContext, FC, useContext, useEffect, useState } from "react";
import { getEmployeeById } from "./userservices";
import { useParams } from "react-router-dom";
import { EmployeeByIdResponse } from "./models";

type UserDataContextType = {
  userDetails: EmployeeByIdResponse;
  totalSkills: number;
  updateUserDetails: (userData?: EmployeeByIdResponse) => void;
  updateTotalSkills: (totalSkills: number) => void;
  setRefresh: () => void;
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
  const [userDetails, setUserDetails] = useState<EmployeeByIdResponse>({} as EmployeeByIdResponse);
  const [totalSkills, setTotalSkills] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const employeeId = useParams().employeeid ?? "";

  function updateUserDetails(userData?: EmployeeByIdResponse) {
    if (!userData) {
      setUserDetails(prev => prev);
    }
    else {
      setUserDetails(userData);
    }
  }

  function updateTotalSkills(totalSkills: number) {
    setTotalSkills(totalSkills);
  }

  function handleRefresh() {
    setRefresh(!refresh);
  }

  useEffect(() => {
    getEmployeeById(employeeId)
      .then(response => {
        const { success, message, methodResult, statusCode } = response.data;
        if (!(success && statusCode === 200)) {
          throw new Error(message);
        }
        const profile = methodResult as EmployeeByIdResponse & {
          lifecycle?: {
            availabilityStatus?: string;
            accountStatus?: string;
            payrollStatus?: string;
            alumniStatus?: string;
          };
        };
        setUserDetails({
          ...profile,
          availabilityStatus: profile.availabilityStatus ?? profile.lifecycle?.availabilityStatus,
          accountStatus: profile.accountStatus ?? profile.lifecycle?.accountStatus,
          payrollStatus: profile.payrollStatus ?? profile.lifecycle?.payrollStatus,
          alumniStatus: profile.alumniStatus ?? profile.lifecycle?.alumniStatus,
        });
      })
      .catch(error => {
        console.error(error.message);
      })
  }, [refresh, employeeId])
  return (
    <UserDetailsContext.Provider
      value={{
        userDetails,
        totalSkills,
        updateUserDetails,
        updateTotalSkills,
        setRefresh: handleRefresh,
      }}
    >
      {children}
    </UserDetailsContext.Provider>
  );
};

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext);
  if (context === undefined) {
    throw new Error("useUserDetails must be used within a UserDetailsProvider");
  }
  return context;
};
