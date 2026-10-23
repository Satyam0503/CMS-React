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
import { EmployeeLifecycleDialog } from "./EmployeeLifecycleDialog";

interface Props {
  employeeList: GetAllEmployeeResponseModel[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalRecords: number;
  onPaginationChange: (page: number, pageSize: number) => void;
  canManageLifecycle?: boolean;
  onLifecycleSaved?: () => void;
}

const EmployeeGridView: FC<Props> = ({ employeeList, isLoading, page, pageSize, totalRecords, onPaginationChange, canManageLifecycle = false, onLifecycleSaved }) => {
  const currentEmpId = useAppSelector((state) => state.user.userData?.userId) ?? "";
  const navigate = useNavigate();
  const { currentLanguage } = useAppLang();
  const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage) ?? LANGUAGE.ENGLISH;
  const lifecycleLabel = (value?: string) => (value ?? "Active").replace(/([a-z])([A-Z])/g, "$1 $2");
  const lifecycleColor = (employment?: string, availability?: string): "success" | "warning" | "error" | "info" | "default" => {
    if (employment === "Resigned" || employment === "Terminated") return "error";
    if (availability && availability !== "Working") return "warning";
    if (employment === "NoticePeriod") return "info";
    return "success";
  };

  const handleClick = (employeeId: string) => {
    if (employeeId === currentEmpId) {
      navigate("/profile");
    } else {
      navigate(`/employees/${employeeId}`);
    }
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
            sx={{ position: "relative", overflow: "hidden" }}
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
                emp.fullProfileUrl || DEFAULT_USER_AVATAR
              }
              alt={`${emp.fullName} profile photo`}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src !== DEFAULT_USER_AVATAR) {
                  target.src = DEFAULT_USER_AVATAR;
                }
              }}
            />
            <Box className="employee-card-content" sx={{ position: "relative" }}>
              {canManageLifecycle && <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 4, maxWidth: "calc(100% - 20px)" }}><EmployeeLifecycleDialog employee={emp} onSaved={onLifecycleSaved} /></Box>}
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
              {canManageLifecycle && <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1 }}>
                <Chip
                  size="small"
                  color={lifecycleColor(emp.employmentStatus, emp.availabilityStatus)}
                  variant="outlined"
                  label={lifecycleLabel(emp.employmentStatus)}
                  aria-label={`Employment status: ${lifecycleLabel(emp.employmentStatus)}`}
                />
                {emp.availabilityStatus && emp.availabilityStatus !== "Working" && (
                  <Chip
                    size="small"
                    color="warning"
                    variant="outlined"
                    label={lifecycleLabel(emp.availabilityStatus)}
                    aria-label={`Availability status: ${lifecycleLabel(emp.availabilityStatus)}`}
                  />
                )}
                {emp.accountStatus && emp.accountStatus !== "Active" && (
                  <Chip size="small" color="error" variant="outlined" label={`Account: ${lifecycleLabel(emp.accountStatus)}`} aria-label={`Account status: ${lifecycleLabel(emp.accountStatus)}`} />
                )}
                {emp.payrollStatus && emp.payrollStatus !== "Active" && (
                  <Chip size="small" color="warning" variant="outlined" label={`Payroll: ${lifecycleLabel(emp.payrollStatus)}`} aria-label={`Payroll status: ${lifecycleLabel(emp.payrollStatus)}`} />
                )}
              </Box>}
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
