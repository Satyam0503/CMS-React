import { Box, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { toast } from "react-toastify";
import { getRequest, postRequest } from "../../../../server/axios";
import { ResponseData } from "../../../../utils/common_types";
import { AppSwitch, AppTextField } from "../../../shared/components/ui";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";

type EmployeePenaltyPolicy = {
  id?: string;
  userId?: string;
  employeeId?: string;
  name: string;
  combinedLhdEdMonthlyLimit: number;
  isEnabled: boolean;
  requiresHrApproval: boolean;
  defaultDecision: string;
  effectiveFrom: string;
  effectiveTo?: string;
  version: number;
};

const initialPolicy = (): EmployeePenaltyPolicy => ({
  name: "Combined LHD + ED monthly allowance",
  combinedLhdEdMonthlyLimit: 2,
  isEnabled: true,
  requiresHrApproval: true,
  defaultDecision: "REVIEW_REQUIRED",
  effectiveFrom: dayjs().format("YYYY-MM-DD"),
  version: 0,
});

export type EmployeePayrollPenaltyPolicyHandle = {
  save: () => Promise<boolean>;
};

/** HR/Admin-only employee payroll setting. The server derives the company from JWT. */
export const EmployeePayrollPenaltyPolicy = forwardRef<EmployeePayrollPenaltyPolicyHandle, { employeeUserId: string }>(({ employeeUserId }, ref) => {
  const [policy, setPolicy] = useState<EmployeePenaltyPolicy>(initialPolicy);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getRequest<ResponseData<EmployeePenaltyPolicy>>(
        `api/attendance/penalty/employees/${encodeURIComponent(employeeUserId)}/policy`,
      );
      if (!data.success || !data.methodResult) throw new Error(data.message || "Unable to load the employee policy.");
      const item = data.methodResult;
      setPolicy({ ...item, effectiveFrom: item.effectiveFrom.slice(0, 10), effectiveTo: item.effectiveTo?.slice(0, 10) });
    } catch (error) {
      toast.error((error as Error).message || "Unable to load the employee payroll policy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [employeeUserId]);

  const save = async (): Promise<boolean> => {
    if (loading) {
      toast.info("Wait for the employee policy to finish loading.");
      return false;
    }
    if (!Number.isInteger(policy.combinedLhdEdMonthlyLimit) || policy.combinedLhdEdMonthlyLimit < 0 || policy.combinedLhdEdMonthlyLimit > 31) {
      toast.error("Monthly limit must be a whole number from 0 to 31.");
      return false;
    }
    setLoading(true);
    try {
      const { data } = await postRequest<EmployeePenaltyPolicy, { success: boolean; message?: string }>(
        `api/attendance/penalty/employees/${encodeURIComponent(employeeUserId)}/policy`,
        policy,
      );
      if (!data.success) throw new Error(data.message || "Unable to save the employee payroll policy.");
      await load();
      return true;
    } catch (error) {
      toast.error((error as Error).message || "Unable to save the employee payroll policy.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ save }));

  return (
    <Stack
      spacing={2}
      sx={{
        mt: 2.5,
        p: { xs: 2, sm: 2.5 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <div>
          <Typography id="employee-payroll-policy-title" variant="subtitle2" fontWeight={750} color="text.primary">
            Attendance & Penalty Policy
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            This policy applies only to this employee. Exceeded limits always require an audited HR/Admin review before payroll.
          </Typography>
        </div>
      </Stack>
      <Box
        aria-labelledby="employee-payroll-policy-title"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "minmax(240px, 1fr) minmax(220px, 1fr) auto",
          },
          gap: 2,
          alignItems: "end",
        }}
      >
        <AppTextField
          disabled={loading}
          label="Combined LHD + ED monthly limit"
          type="number"
          inputProps={{ min: 0, max: 31, step: 1 }}
          value={policy.combinedLhdEdMonthlyLimit}
          onChange={(event) => setPolicy({ ...policy, combinedLhdEdMonthlyLimit: Number(event.target.value) })}
          sx={{ "& .MuiOutlinedInput-root": { minHeight: 44, borderRadius: 2 } }}
        />
        <CustomisedDatePicker
          disabled={loading}
          label="Effective from"
          format="DD-MM-YYYY"
          value={policy.effectiveFrom ? dayjs(policy.effectiveFrom) : null}
          setValue={(date) => date && setPolicy({ ...policy, effectiveFrom: date.format("YYYY-MM-DD") })}
          sx={{
            "& .MuiPickersInputBase-root, & .MuiOutlinedInput-root": { minHeight: 44, borderRadius: 2 },
            "& .MuiFormControl-root": { width: "100%" },
          }}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "space-between", md: "flex-start" },
            gap: 1.25,
            minHeight: 44,
            px: 1.75,
            py: 0.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "action.hover",
            whiteSpace: "nowrap",
          }}
        >
          <AppSwitch
            size="small"
            disabled={loading}
            checked={policy.isEnabled}
            onChange={(event) => setPolicy({ ...policy, isEnabled: event.target.checked })}
            inputProps={{ "aria-label": "Enable employee payroll penalty policy" }}
            sx={{ m: 0 }}
          />
          <Typography variant="body2" fontWeight={650}>
            {policy.isEnabled ? "Policy Active" : "Policy Disabled"}
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
});
