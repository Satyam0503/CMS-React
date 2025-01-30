import { createContext, useContext, useEffect, useState } from "react";
import {
  EmployeeModel,
  UserCertificationModel,
  UserEducationModel,
} from "../../../utils/common_types";
import {
  getEmployeeCertifications,
  getEmployeeDetails,
  getEmployeeEducations,
  getEmployeeSummary,
  UserSummaryModel,
} from "./userservices";
import { Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { useAppSelector } from "../../Redux/hooks";

type UserDataContextType = {
  userDetails: {
    userPersonalDetails: EmployeeModel;
    userEducations: UserEducationModel[];
    userCertifications: UserCertificationModel[];
    userSkills: string[];
    userSummary: UserSummaryModel;
  };
  setRefresh: (isRefresh: boolean) => void;
  isRefresh: boolean;
};

type PropTypes = {
  children: React.ReactNode;
};

// Create UserDetails Context
const UserDetailsContext = createContext<UserDataContextType | undefined>(
  undefined
);

// User Details Provider
export const UserDetailsProvider = (props: PropTypes) => {
  const [isRefresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const intl = useIntl();
  const [userEducations, setUserEducations] = useState<UserEducationModel[]>(
    []
  );
  const currentUser= useAppSelector(state=>state.user.userData);
  const [userCertifications, setUserCertifications] = useState<
    UserCertificationModel[]
  >([]);
  const [userSummary, setUserSummary] = useState<UserSummaryModel>({
    userId:currentUser?.userId!,
    summaryId: "",
    summary: "",
  });
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userPersonalDetails, setUserPersonalDetails] = useState<EmployeeModel>(
    {} as EmployeeModel
  );

  useEffect(() => {
    const getAllDetails = async () => {
      try {
        const responseArray = await Promise.all([
          getEmployeeDetails(),
          getEmployeeEducations(),
          getEmployeeCertifications(),
          getEmployeeSummary(),
          // getEmployeeSkills(token),
        ]);
        setUserPersonalDetails(responseArray[0].data.methodResult);
        setUserEducations(responseArray[1].data.methodResults);
        setUserCertifications(responseArray[2].data.methodResults);
        setUserSummary(responseArray[3].data.methodResult);
        // setUserSkills(responseArray[4].data.methodResults);
      } catch (error: any) {
        // setError(error.message)
        // toast.error(error.message);
        // console.log(error.message);
        
      } finally {
        setLoading(false);
      }
    };

    getAllDetails();
  }, [isRefresh]);

  if (loading) {
    return (
      <Typography variant="h4">
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
      value={{
        userDetails: {
          userPersonalDetails,
          userEducations,
          userCertifications,
          userSkills,
          userSummary,
        },
        isRefresh,
        setRefresh,
      }}
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
