import { FC } from "react";
import { ArrowForward, WorkOutline } from "@mui/icons-material";
import { Box, Card, Chip, TablePagination, Typography } from "@mui/material";
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
  page: number;
  pageSize: number;
  totalRecords: number;
  onPaginationChange: (page: number, pageSize: number) => void;
}

const EmployeeGridView: FC<Props> = ({ employeeList, isLoading, page, pageSize, totalRecords, onPaginationChange }) => {
  const currentEmpId = useAppSelector((state) => state.user.userData?.userId) ?? "";
  const navigate = useNavigate();
  const { currentLanguage } = useAppLang();
  const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage) ?? LANGUAGE.ENGLISH;

  const handleClick = (employeeId: string) => {
    employeeId === currentEmpId
      ? navigate("/profile")
      : navigate(`/employees/${employeeId}`);
  };

  if (!isLoading && employeeList.length === 0) {
    return <CardMessage title="MESSAGE.NO_EMPLOYEE" />
  }

  return (
    <>
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
            tabIndex={0}
            role="button"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleClick(emp.userId);
              }
            }}
          >
            <img
              src={
                emp.fullProfileUrl ?? DEFAULT_USER_AVATAR
              }
              alt="employee-profile-image"
            />
            <Box className="employee-card-content">
              <Chip
                icon={<WorkOutline />}
                label={
                  emp.jobRole === null
                    ? <FormattedMessage id="NOT_AVAILABLE" />
                    : emp.jobRole[currentLanguage] || emp.jobRole[defaultLang]
                }
                size="small"
                className="employee-role-chip"
              />
              <Typography
                variant="h6"
                className="fw-bold employee-card-name"
                sx={{ color: 'common.white' }}
              >
                {emp.fullName}
              </Typography>
              <Box className="employee-card-link">
                <Typography variant="caption">View profile</Typography>
                <ArrowForward />
              </Box>
            </Box>
          </Card>
        ))}
    </Box>
    {!isLoading && totalRecords > 0 && <TablePagination
      component="div"
      count={totalRecords}
      page={page}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[10, 25, 50]}
      onPageChange={(_, nextPage) => onPaginationChange(nextPage, pageSize)}
      onRowsPerPageChange={(event) => onPaginationChange(0, Number(event.target.value))}
      labelRowsPerPage="Employees per page:"
    />}
    </>
  );
};

export { EmployeeGridView };
