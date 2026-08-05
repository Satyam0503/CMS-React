import { Card, Chip, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { LeaveApplication } from "./components/LeaveApplication";
import { Add } from "@mui/icons-material";
import CustomisedButton from "../../../shared/components/C_Button";
import { useParams } from "react-router-dom";
import { EmployeeLeaveTypesCharts } from "./components/LeaveTypesChart";
import { MyLeaveRequests } from "./components/MyLeaveRequest";
import { ModulesName, Permission } from "../../../../utils/enums";
import {
  EmployeeLeaveTypeBalance,
  RequestLeaveModel,
} from "../../leaves/model";
import { useAppSelector } from "../../../Redux/hooks";
import { getEmployeeLeaveBalance, getMyProfileLeaveBalance } from "../../leaves/leaveServices";
import { toast } from "react-toastify";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { resolveLeaveBalanceTargetUserId } from "./leaveTrackerUtils";
import { getRequest } from "../../../../server/axios";

type WorkFromHomeContext = {
  isEligible: boolean;
  weeklyLimit: number;
  usedThisWeek: number;
  remainingThisWeek: number;
  canSchedule: boolean;
  disabledReasonCode?: string;
};

const initialLeaveRequestValue: RequestLeaveModel = {
  isHalfDay: false,
  startDate: null,
  endDate: null,
  reason: "",
  userId: "",
  leavePolicyId: "",
};

export const LeaveTracker: FC = () => {
  const { formatMessage: i } = useIntl();
  const [empLeaveTypeBalance, setEmployeeLeaveTypeBalance] = useState<
    EmployeeLeaveTypeBalance[]
  >([]);
  const [open, setOpen] = useState(false);
  const employeeId = useParams().employeeid;
  const currentUserId = useAppSelector((state) => state.user.userData?.userId)!;
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [wfhContext, setWfhContext] = useState<WorkFromHomeContext | null>(null);
  const modulePermission =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    if (empLeaveTypeBalance.length > 0 || wfhContext?.isEligible) {
      setOpen(true);
    } else {
      toast.error(i({ id: "VALIDATION_ERR.LEAVE_TYPES_NOT_AVAILABLE" }));
    }
  };

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  useEffect(() => {
    const fetchEmployeeLeaveTypeBalance = async () => {
      try {
        const { data } = employeeId
          ? await getEmployeeLeaveBalance(
              resolveLeaveBalanceTargetUserId(employeeId, currentUserId)
            )
          : await getMyProfileLeaveBalance();
        if (data.success && data.totalRecords > 0) {
          // console.log(data.methodResults);

          setEmployeeLeaveTypeBalance(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeLeaveTypeBalance();
  }, [currentUserId, employeeId, refresh]);

  useEffect(() => {
    // The WFH context is identity-bound, so only load it on the employee's own
    // profile rather than while HR is viewing another employee.
    if (employeeId) {
      setWfhContext(null);
      return;
    }

    getRequest<{ methodResult?: WorkFromHomeContext }>("api/wfh/context")
      .then(({ data }) => setWfhContext(data.methodResult ?? null))
      .catch((error) => console.error("Unable to load WFH allowance.", error));
  }, [employeeId, refresh]);

  return (
    <Stack className="gap-2">
      <Card className="p-4 d-flex justify-content-between">
        <Typography className="fs-20" variant="h6">
          {i({ id: "LEAVE.TITLE" })}
        </Typography>
        {(!employeeId ||
          hasModuleFeaturePermission(
            ModulesName.LeaveManagement,
            Permission.Create,
            modulePermission
          )) && (
            <CustomisedButton
              className="align-self-end"
              Icon={<Add />}
              label={i({ id: "LEAVE.APPLY_FOR_LEAVE" })}
              handleClick={handleOpen}
            />
          )}
      </Card>
      {open && (
        <LeaveApplication
          initialValues={initialLeaveRequestValue}
          leaveTypeBalance={empLeaveTypeBalance}
          handleRefresh={handleRefresh}
          edit={false}
          open={true}
          handleClose={handleClose}
        />
      )}
      {!employeeId && wfhContext && (
        <Card className="p-4">
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2}>
            <Stack spacing={0.5}>
              <Typography variant="h6">Work from home</Typography>
              <Typography variant="body2" color="text.secondary">
                Weekly allowance resets every Monday. WFH is tracked separately from monthly leave balances.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Chip label={`${wfhContext.usedThisWeek} used`} color="secondary" size="small" />
              <Chip label={`${wfhContext.remainingThisWeek} remaining`} color={wfhContext.canSchedule ? "success" : "default"} size="small" />
            </Stack>
          </Stack>
          <Typography sx={{ mt: 2 }}>
            {wfhContext.isEligible
              ? `${wfhContext.remainingThisWeek} of ${wfhContext.weeklyLimit} WFH day(s) remain this Monday–Sunday week.`
              : "Work from home is not assigned to your employee profile."}
          </Typography>
          {!wfhContext.canSchedule && wfhContext.isEligible && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {wfhContext.disabledReasonCode === "WFH_WEEKLY_LIMIT_USED"
                ? "This week’s WFH allowance has been used."
                : "WFH is currently unavailable for the selected dates or policy rules."}
            </Typography>
          )}
        </Card>
      )}
      <EmployeeLeaveTypesCharts
        isLoading={loading}
        leaveBalance={empLeaveTypeBalance}
      />
      {(!employeeId || hasModuleFeaturePermission(
        ModulesName.LeaveManagement,
        Permission.View,
        modulePermission
      )) && (
          <MyLeaveRequests
            leaveBalance={empLeaveTypeBalance}
            refresh={refresh}
            handleRefresh={handleRefresh}
          />
        )}
    </Stack>
  );
};
