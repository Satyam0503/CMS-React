import { Card, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { LeaveApplication } from "./components/LeaveApplication";
import { Add } from "@mui/icons-material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useParams } from "react-router-dom";
import { EmployeeLeaveTypesCharts } from "./components/LeaveTypesChart";
import { MyLeaveRequests } from "./components/MyLeaveRequest";
import { LEAVE_TYPE, ModulesName, Permission } from "../../../../utils/enums";
import {
  EmployeeLeaveTypeBalance,
  RequestLeaveModel,
} from "../../leaves/model";
import { useAppSelector } from "../../../Redux/hooks";
import { getEmployeeLeaveBalance } from "../../leaves/leaveServices";
import { toast } from "react-toastify";
import { hasModuleFeaturePermission } from "../../../../utils/common";

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
  const modulePermission =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    if (empLeaveTypeBalance.length > 0) {
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
        const { data } = await getEmployeeLeaveBalance(
          employeeId ?? currentUserId
        );
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
  }, [currentUserId]);

  // console.log(currentUserId);

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
      <EmployeeLeaveTypesCharts
        isLoading={loading}
        leaveBalance={empLeaveTypeBalance}
      />
      {!employeeId && (
        <MyLeaveRequests
          leaveBalance={empLeaveTypeBalance}
          refresh={refresh}
          handleRefresh={handleRefresh}
        />
      )}
    </Stack>
  );
};
