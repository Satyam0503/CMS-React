import { FC } from "react";
import { Box, Card, Typography } from "@mui/material";
import { useAppSelector } from "../../../Redux/hooks";
import { useNavigate } from "react-router-dom";
import { EmpCardSkeleton } from "./EmployeeCardSkeleton";
import { useIntl } from "react-intl";
import { CardMessage } from "../../../shared/CardMessage";
import { GetAllEmployeeResponseModel } from "../models";

interface Props {
  employeeList: GetAllEmployeeResponseModel[];
  isLoading: boolean;
}

const EmployeeGridView: FC<Props> = ({ employeeList, isLoading }) => {
  const currentEmpId = useAppSelector((state) => state.user.userData?.userId) ?? "";
  const navigate = useNavigate();

  const handleClick = (employeeId: string) => {
    employeeId === currentEmpId
      ? navigate("/profile")
      : navigate(`/employees/${employeeId}`);
  };

  if (employeeList.length === 0) {
    return <CardMessage title="Employee.No_Employee" />
  }

  return (
    <Box component={"div"} className="employee-grid-container">
      {isLoading
        ? Array(1, 2, 3, 4, 5, 6).map((ele) => {
          return <EmpCardSkeleton key={ele} />;
        })
        : employeeList.length > 0 &&
        employeeList.map((emp) => (
          <Card
            className="employee-card shadow-sm"
            key={emp.userId}
            onClick={() => handleClick(emp.userId)}
          >
            <img
              src={
                emp.fullProfileUrl ?? "/media/avatars/default-emp-imag.jpg"
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
              <Typography sx={{ color: 'common.white' }}>{emp.jobRole ?? ""}</Typography>
            </Box>
          </Card>
        ))}
    </Box>
  );
};

export { EmployeeGridView };
