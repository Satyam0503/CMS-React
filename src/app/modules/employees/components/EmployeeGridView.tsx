import { FC } from "react";
import { Box, Card, Typography } from "@mui/material";
import { useAppSelector } from "../../../Redux/hooks";
import { useNavigate } from "react-router-dom";
import { EmpCardSkeleton } from "./EmployeeCardSkeleton";
import { FormattedMessage } from "react-intl";
import { CardMessage } from "../../../shared/CardMessage";
import { GetAllEmployeeResponseModel } from "../models";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import { LANGUAGE } from "../../../../utils/enums";

interface Props {
  employeeList: GetAllEmployeeResponseModel[];
  isLoading: boolean;
}

const EmployeeGridView: FC<Props> = ({ employeeList, isLoading }) => {
  const currentEmpId = useAppSelector((state) => state.user.userData?.userId) ?? "";
  const navigate = useNavigate();
  const { currentLanguage } = useAppLang();
  const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage) ?? LANGUAGE.ENGLISH;

  const handleClick = (employeeId: string) => {
    employeeId === currentEmpId
      ? navigate("/profile")
      : navigate(`/employees/${employeeId}`);
  };

  if (employeeList.length === 0) {
    return <CardMessage title="MESSAGE.NO_EMPLOYEE" />
  }

  return (
    <Box component="div" className="employee-grid-container">
      {isLoading
        ? [1, 2, 3, 4, 5, 6].map((ele) => {
          return <EmpCardSkeleton key={ele} />;
        })
        : employeeList.length > 0 &&
        employeeList.map((emp) => (
          <Card
            className="employee-card "
            key={emp.userId}
            onClick={() => handleClick(emp.userId)}
          >
            <img
              src={
                emp.fullProfileUrl ?? DEFAULT_USER_AVATAR
              }
              alt="employee-profile-image"
            />
            <Box className="employee-card-content">
              <Typography
                variant="h6"
                className="fw-bold"
                sx={{ color: 'common.white' }}
              >
                {emp.fullName}
              </Typography>
              <Typography sx={{ color: 'common.white' }}>{emp.jobRole === null ? <FormattedMessage id="NOT_AVAILABLE" /> : emp.jobRole[currentLanguage] || emp.jobRole[defaultLang]}</Typography>
            </Box>
          </Card>
        ))}
    </Box>
  );
};

export { EmployeeGridView };
