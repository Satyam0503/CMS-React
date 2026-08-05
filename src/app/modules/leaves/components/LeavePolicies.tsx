import { Add } from "@mui/icons-material";
import { Card, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { CustomIconButton } from "../../../shared/components/C_IconButton";
import { useIntl } from "react-intl";
import AddLeavePolicy from "./AddLeavePolicy";
import { LeavePolicyModel } from "../model";
import {
  getLeavePolicies,
} from "../leaveServices";
import {
  EmployeeLeavePoliciesColumnList,
} from "../../../../utils/constant/Constant";
import { CustomisedTable } from "../../../shared/components/C_Table";

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
};

function LeavePolicies() {
  const { formatMessage: i } = useIntl();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [leavePolicies, setLeavePolicies] = useState<Array<LeavePolicyModel>>(
    []
  );
  const [refresh, setRefresh] = useState<boolean>(true);
  const [leavePoliciesValues, setLeavePoliciesValues] =
    useState<LeavePolicyModel>();

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
          rows={leavePolicies}
          columns={EmployeeLeavePoliciesColumnList}
          page={0}
          rowsPerPage={10}
          loading={loading}
          handleEdit={handleEdit}
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
    </>
  );
}

export default LeavePolicies;
