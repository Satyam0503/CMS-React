import {
  Box,
  Typography,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { EmployeeLeaveBalanceData, LeavePolicyModel } from "../model";
import CustomisedButton from "../../../shared/components/C_Button";
import { getLeavePolicies, getWorkFromHomeEmployeeAllocations, saveWorkFromHomeEmployeeAllocation, updateEmployeeLeaveBalance } from "../leaveServices";
import { getRequest } from "../../../../server/axios";
import {
  AccrualPeriodMapper,
  blockInvalidCharOnNumberField,
  getCustomStatusCodesErrorMessage,
} from "../../../../utils/common";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { toast } from "react-toastify";

import { AppCheckbox, AppTextField } from "../../../shared/components/ui";
type Props = {
  openOptions: boolean;
  handleClose: () => void;
  handleRefresh: () => void;
  selectedEmployee: EmployeeLeaveBalanceData;
};

type InitialValueType = {
  leaveBalanceId?: string;
  employeeId: string;
  leavePolicyId: string;
  totalAllocated: number;
  expectedVersion?: number;
  remove?: boolean;
}[];

type GetLeaveBalanceValue = () => InitialValueType;

export default function EditEmployeePoliciesForm(props: Props) {
  const { selectedEmployee } = props;
  const { formatMessage: i } = useIntl();
  const [leavePolicies, setLeavePolicies] = useState<Array<LeavePolicyModel>>(
    []
  );
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0, 6]);
  const [wfhWeeklyLimit, setWfhWeeklyLimit] = useState<number | null>(null);
  const [initialWfhWeeklyLimit, setInitialWfhWeeklyLimit] = useState<number | null>(null);
  const [wfhEligible, setWfhEligible] = useState(false);
  const [initialWfhEligible, setInitialWfhEligible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getRequest<{ offDays: number[] }>("api/attendance/weekly-offs");
        if (data && Array.isArray(data.offDays)) {
          setWeeklyOffDays(data.offDays);
        }
      } catch (error) {
        console.error("Unable to load weekly off schedule.", error);
      }
    })();
  }, []);

  const wfhPolicy = leavePolicies.find((policy) => policy.policyType === 2);
  const allowOnWeeklyOff = Boolean(wfhPolicy?.workFromHome?.allowOnWeeklyOff);
  const offDaysCount = new Set(weeklyOffDays.filter((d) => d >= 0 && d <= 6)).size;
  const maxWorkingDays = allowOnWeeklyOff ? 7 : Math.max(1, Math.min(7, 7 - offDaysCount));

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getLeavePolicies(true);
        if (data) {
          setLeavePolicies(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getWorkFromHomeEmployeeAllocations();
        const allocation = data.methodResult?.find(
          (item) => item.employeeId.trim().toUpperCase() === selectedEmployee.employeeCode?.trim().toUpperCase()
        );
        const policyLimit = leavePolicies.find((policy) => policy.policyType === 2)
          ?.workFromHome?.maxDaysPerWeek ?? 1;
        const rawLimit = allocation?.weeklyLimit ?? policyLimit;
        const limit = Math.max(0, Math.min(maxWorkingDays, rawLimit));
        setWfhWeeklyLimit(limit);
        setInitialWfhWeeklyLimit(limit);
        // Do not infer assignment from the company default. The API evaluates
        // the selected employee against the same WFH policy used on submission.
        const eligible = allocation?.isEligible ?? false;
        setWfhEligible(eligible);
        setInitialWfhEligible(eligible);
      } catch (error) {
        console.error("Unable to load the employee WFH allocation.", error);
      }
    })();
  }, [leavePolicies, selectedEmployee.employeeCode, maxWorkingDays]);

  useEffect(() => {
    if (wfhWeeklyLimit !== null && wfhWeeklyLimit > maxWorkingDays) {
      setWfhWeeklyLimit(maxWorkingDays);
    }
  }, [maxWorkingDays, wfhWeeklyLimit]);

  const getInitialValues: GetLeaveBalanceValue = () => {
    if (selectedEmployee.leaveBalances.length) {
      return selectedEmployee.leaveBalances.map((lb) => {
        return {
          leaveBalanceId: lb.leaveBalanceId,
          employeeId: selectedEmployee.employeeId,
          leavePolicyId: lb.leavePolicyId,
          totalAllocated: lb.totalAllocated,
          expectedVersion: lb.version,
          remove: false,
        };
      });
    } else {
      return [];
    }
  };

  async function handleLeaveBalanceSubmission(
    values: InitialValueType,
    setSubmitting: (isSubmitting: boolean) => void,
    hasLeaveBalanceChanges: boolean
  ) {
    try {
      // WFH has its own persisted allocation. Do not make this employee-level
      // setting depend on a separate leave-balance mutation when HR changed
      // only the WFH checkbox or weekly limit.
      if (wfhWeeklyLimit !== null && (wfhWeeklyLimit !== initialWfhWeeklyLimit || wfhEligible !== initialWfhEligible)) {
        if (!selectedEmployee.employeeCode) {
          throw new Error("WFH allocation is unavailable because this employee has no employee code.");
        }
        if (wfhEligible && (wfhWeeklyLimit < 0 || wfhWeeklyLimit > maxWorkingDays)) {
          throw new Error(`Weekly WFH allowance must be between 0 and ${maxWorkingDays} working day(s) per week.`);
        }
        const { data: allocationData } = await saveWorkFromHomeEmployeeAllocation({
          employeeId: selectedEmployee.employeeCode,
          weeklyLimit: wfhEligible ? wfhWeeklyLimit : 0,
        });
        if (!allocationData.success) {
          throw new Error(allocationData.message || allocationData.statusCode?.toString() || "Unable to update the WFH allocation.");
        }
      }

      if (hasLeaveBalanceChanges) {
        const payload: InitialValueType = values;
        const { data } = await updateEmployeeLeaveBalance(payload);
        if (!data.success) {
          throw new Error(data.message || data.statusCode?.toString() || "Unable to update leave allocation.");
        }
      }

      {
        toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
        window.dispatchEvent(new CustomEvent("wfh-allocation-changed"));
        props.handleRefresh();
        props.handleClose();
      }
    } catch (error) {
      const message = (error as Error).message;
      const statusMessage = getCustomStatusCodesErrorMessage(+message);
      toast.error(Number.isFinite(+message) ? i({ id: statusMessage }) : message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CustomisedModal
      open={props.openOptions}
      handleClose={props.handleClose}
      title={`${i({ id: "LEAVE.TITLES.MANAGE_LEAVE_ALLOCATION" })} — ${selectedEmployee.employeeName}`}
    >
      <Box component={"div"}>
        <Formik
          enableReinitialize={true}
          initialValues={getInitialValues()}
          onSubmit={(values, { setSubmitting }) => {
            const changedLeaveBalances = values.filter((value) => {
              const original = selectedEmployee.leaveBalances.find(
                (balance) => balance.leaveBalanceId === value.leaveBalanceId || balance.leavePolicyId === value.leavePolicyId
              );
              return !original
                ? !value.remove
                : Boolean(value.remove) || original.totalAllocated !== value.totalAllocated;
            });
            handleLeaveBalanceSubmission(changedLeaveBalances, setSubmitting, changedLeaveBalances.length > 0);
          }}
        >
          {({
            values,
            handleSubmit,
            setValues,
            ...formik
          }) => (
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              {leavePolicies.filter((leave) => leave.policyType === 1).map((leave) => {
                const selectedLeave = values.find(
                  (lb) => lb.leavePolicyId === leave.id
                );

                const handleLeavePolicyChange = (
                  id: string,
                  totalAllocated: number
                ) => {
                  const existingIndex = values.findIndex((lb) => lb.leavePolicyId === id);
                  const exist = existingIndex > -1;
                  if (exist) {
                    setValues(values.map((lb, index) => index === existingIndex ? { ...lb, remove: !lb.remove } : lb));
                  } else {
                    setValues([
                      ...values,
                      {
                        leavePolicyId: id,
                        totalAllocated: totalAllocated,
                        employeeId: selectedEmployee.employeeId,
                      },
                    ]);
                  }
                };

                const handleLeaveBalanceChange = (
                  id: string,
                  totalAllocated: number
                ) => {
                  const exist =
                    values.findIndex((lb) => lb.leavePolicyId === id) > -1;
                  if (exist) {
                    setValues(
                      values.map((lb) => {
                        if (lb.leavePolicyId === id) {
                          return {
                            ...lb,
                            totalAllocated: totalAllocated,
                          };
                        }
                        return lb;
                      })
                    );
                  }
                };

                return (
                  <Stack direction="row" key={leave.id} sx={{ alignItems: "center" }}>
                    <FormControlLabel
                      key={leave.id}
                      label={
                        <Box component={"div"}>
                          <Typography variant="body1" color="initial">
                            {leave.name}
                          </Typography>
                          <Typography variant="body2">
                            {i({
                              id: "LEAVE.TYPES.POLICY_ACCURAL_PERIOD",
                            })}
                            {" : "}

                            {i({
                              id: AccrualPeriodMapper[leave.accrualPeriod],
                            })}
                          </Typography>
                        </Box>
                      }
                      labelPlacement="end"
                      sx={{
                        width: "100%",
                      }}
                      control={
                        <AppCheckbox
                          value={leave.id}
                          checked={selectedLeave ? !selectedLeave.remove : false}
                          // name={leave.id}
                          className="check-leave-selected"
                          sx={{
                            ".MuiSvgIcon-root": {
                              fontSize: "28px",
                            },
                          }}
                          onChange={() =>
                            handleLeavePolicyChange(
                              leave.id as string,
                              leave.accrualAmount
                            )
                          }
                          color="primary"
                        />
                      }
                    />
                    <AppTextField
                      fullWidth
                      label="Total allocation"
                      type="number"
                      placeholder="Total allocation"
                      name={`${leave.id}totalAllocated`}
                      value={selectedLeave && !selectedLeave.remove ? selectedLeave.totalAllocated : ""}
                      disabled={!selectedLeave || selectedLeave.remove}
                      onChange={(e) => {
                        handleLeaveBalanceChange(
                          leave.id as string,
                          Number(e.target.value)
                        );
                      }}
                      onKeyDown={(e) => {
                        blockInvalidCharOnNumberField(e);
                      }}
                      slotProps={{
                        htmlInput: {
                          min: 0,
                          max: leave.maxBalance,
                          step: 0.5,
                        },
                      }}
                    />
                  </Stack>
                );
              })}
              {leavePolicies.filter((leave) => leave.policyType === 2).map((leave) => (
                <Stack direction="row" key={leave.id} sx={{ alignItems: "center" }}>
                  <Box sx={{ width: "100%" }}>
                    <FormControlLabel
                      control={<AppCheckbox checked={wfhEligible} onChange={(event) => setWfhEligible(event.target.checked)} />}
                      label="Eligible for Work From Home"
                    />
                    <Typography variant="body1" color="initial">
                      {leave.name}
                    </Typography>
                    <Typography variant="body2">
                      Weekly WFH allowance (HR/Admin can set 0 to disable it for this employee, max {maxWorkingDays} days)
                    </Typography>
                  </Box>
                  <AppTextField
                    fullWidth
                    label="WFH days per week"
                    type="number"
                    value={wfhWeeklyLimit ?? ""}
                    disabled={!wfhEligible}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value);
                      setWfhWeeklyLimit(Math.max(0, Math.min(maxWorkingDays, val)));
                    }}
                    onKeyDown={blockInvalidCharOnNumberField}
                    slotProps={{ htmlInput: { min: 0, max: maxWorkingDays, step: 1 } }}
                    helperText={wfhEligible ? `Allowed: 0 to ${maxWorkingDays} working day(s) per week (Company work week: ${maxWorkingDays} days)` : undefined}
                  />
                </Stack>
              ))}
              <CustomisedButton
                label={i({
                  id: "BUTTON.UPDATE",
                })}
                type="submit"
                loading={formik.isSubmitting}
                disabled={
                  formik.isSubmitting ||
                  (!(formik.isValid && formik.dirty) && wfhWeeklyLimit === initialWfhWeeklyLimit && wfhEligible === initialWfhEligible)
                }
              />
            </form>
          )}
        </Formik>
      </Box>
    </CustomisedModal>
  );
}
