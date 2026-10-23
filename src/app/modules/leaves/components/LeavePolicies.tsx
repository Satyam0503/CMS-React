import { Add } from "@mui/icons-material";
import { Card, Stack, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { CustomIconButton } from "../../../shared/components/C_IconButton";
import { useIntl } from "react-intl";
import AddLeavePolicy from "./AddLeavePolicy";
import { LeavePolicyModel } from "../model";
import {
  getLeavePolicies, unlinkLifecyclePolicy, deleteLeavePolicy,
} from "../leaveServices";
import {
  EmployeeLeavePoliciesColumnList,
} from "../../../../utils/constant/Constant";
import { CustomisedTable } from "../../../shared/components/C_Table";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";

const LeavePolicyModelInitials: LeavePolicyModel = {
  id: null,
  name: "",
  code: "",
  description: "",
  status: true,
  paid: true,
  accrualPeriod: 1,
  accrualAmount: 0,
  maxBalance: 0,
  carryOverAllowed: true,
  carryOverLimit: 0,
  minNoticeDays: 0,
  halfDayAllowed: true,
  weekendInclusive: false,
  holidayInclusive: false,
  attendanceStatusCode: "",
  applicableTo: [],
  policyType: 1,
  workFromHome: null,
  lifecycle: null,
};

function LeavePolicies() {
  const { formatMessage: i } = useIntl();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [leavePolicies, setLeavePolicies] = useState<Array<LeavePolicyModel>>(
    []
  );
  const [selectedPolicy,setSelectedPolicy] = useState<LeavePolicyModel | null>(null);
  const [action,setAction]=useState<"delete" | "unlink" | null>(null);
  const [refresh, setRefresh] = useState<boolean>(true);
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasWfhAccess = modulePermissions.some((p) => p.startsWith("Work_From_Home."));
  const [leavePoliciesValues, setLeavePoliciesValues] =
    useState<LeavePolicyModel>();

    useEffect(()=>{
      const state=location.state as{
        createLifecycleLeave?:boolean;

      }|null;
      if(!state?.createLifecycleLeave) return;
      setIsEdit(false);
      setLeavePoliciesValues(LeavePolicyModelInitials);
      setIsOpen(true);
      window.history.replaceState({},document.title);

    },[location.state]);

  useEffect(() => {
    const eventType = (location.state as { lifecycleEventType?: string } | null)?.lifecycleEventType;
    if (!eventType) return;
    setIsEdit(false);
    setLeavePoliciesValues({ ...LeavePolicyModelInitials, lifecycle: {
      enabled: true,
      eventType,
      requiresHrApproval: true,
      requiresReason: true,
      requiresDocument: true,
      requiresExpectedReturnDate: true,
    }});
    setIsOpen(true);
    window.history.replaceState({}, document.title);
  }, [location.state]);

  function handleClose() {
    setIsOpen(false);
    setIsEdit(false);
  }

  function handleRefresh() {
    setRefresh(!refresh);
  }

  const handleEdit = (row: LeavePolicyModel) => {
    setIsEdit(true);
    setLeavePoliciesValues(row);
    setIsOpen(true);
  };
  const confirmPolicyAction=async()=>{
    if(!selectedPolicy) return;
    try{
      if(action==="unlink"){
        await unlinkLifecyclePolicy(selectedPolicy);
      }
      if(action==="delete" && selectedPolicy.id){
        await deleteLeavePolicy(selectedPolicy.id);
      }
      setSelectedPolicy(null);
      setAction(null);
      handleRefresh();
    }catch(error){
      console.log("Policy action failed ", error)
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getLeavePolicies();
        if (data) {
          setLeavePolicies(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  return (
    <>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          p: 2,
        }}
      >
        <Stack className="flex-row justify-content-between ">
          <Typography variant="h5">
            {i({ id: "LEAVE.TITLES.LEAVE_POLICIES" })}
          </Typography>
          <CustomIconButton
            icon={<Add />}
            handleClick={() => setIsOpen(true)}
            tooltip={i({ id: "LEAVE.TITLES.ADD_LEAVE_POLICIES" })}
          />
        </Stack>
        <CustomisedTable
          key="LeavePoliciesId"
          rows={hasWfhAccess ? leavePolicies : leavePolicies.filter((p) => p.policyType !== 2)}
          columns={EmployeeLeavePoliciesColumnList}
          page={0}
          rowsPerPage={10}
          loading={loading}
          handleEdit={handleEdit}
          openConfirmationModal={(row) => {
            setSelectedPolicy(row);
            setAction("delete");
          }}
          openUnlinkModal={(row) => {
            setSelectedPolicy(row);
            setAction("unlink");
          }}
        />
      </Card>
      {isOpen && (
        <AddLeavePolicy
          open={isOpen}
          handleClose={handleClose}
          initialValues={
            isEdit ? leavePoliciesValues : LeavePolicyModelInitials
          }
          isEdit={isEdit}
          handleRefresh={handleRefresh}
        />
      )}
      <Dialog open={Boolean(action && selectedPolicy)} onClose={() => { setAction(null); setSelectedPolicy(null); }}>
        <DialogTitle>{action === "unlink" ? "Unlink lifecycle policy?" : "Delete leave policy?"}</DialogTitle>
        <DialogContent>
          {action === "unlink"
            ? "The leave policy will remain available but will no longer create lifecycle cases."
            : "This policy will be deactivated. Existing requests and history will be preserved."}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAction(null); setSelectedPolicy(null); }}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmPolicyAction}>
            {action === "unlink" ? "Unlink" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default LeavePolicies;
