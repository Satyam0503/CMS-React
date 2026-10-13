import {
  Formik,
  FormikProps } from "formik";
import * as Yup from "yup";
import { useIntl } from "react-intl";
import {
  Box,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { LeavePolicyModel } from "../../leaves/model";
import {
  getLeavePolicies,
  updateEmployeeLeaveBalance,
} from "../../leaves/leaveServices";
import {
  AccrualPeriodMapper,
  getCustomStatusCodesErrorMessage,
} from "../../../../utils/common";
import { EmployeeLeaveBalance } from "../models";
import { toast } from "react-toastify";

import { AppCheckbox } from "../../../shared/components/ui";
interface PropsTypes {
  formRef: React.MutableRefObject<FormikProps<{
    selectedPolicies: string[];
  }> | null>;
  employeeId: string;
  handleLeaveAllocation: () => void;
  handleButtonLoading: (loading: boolean) => void;
}

export const LeaveAllocateForm = ({
  formRef,
  employeeId,
  handleLeaveAllocation,
  handleButtonLoading,
}: PropsTypes) => {
  const { formatMessage: i } = useIntl();
  const [leavePolicies, setLeavePolicies] = useState<
    Array<Omit<LeavePolicyModel, "applicableTo">>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getLeavePolicies(true);
        if (data.success) {
          // This step creates employee leave-credit balances. UL is approval-only
          // and WFH has its own policy workflow, so neither belongs in this batch.
          setLeavePolicies((data.methodResults ?? []).filter((policy) => policy.policyType === 1));
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    })();
  }, []);

  const AllocateEmployeeLeaveBalance = async (
    values: { selectedPolicies: string[] },
    setSubmitting: (isSubmitting: boolean) => void,
  ) => {
    if (values.selectedPolicies.length == 0) {
      handleButtonLoading(false);
      setSubmitting(false);
      handleLeaveAllocation();
      return;
    } else {
      const payload: EmployeeLeaveBalance = values.selectedPolicies.map(
        (item) => ({
          employeeId: employeeId,
          leavePolicyId: item,
          totalAllocated:
            leavePolicies.find((lp) => lp.id === item)?.accrualAmount ?? 0,
        }),
      );

      try {
        const { data } = await updateEmployeeLeaveBalance(payload);
        if (data.success) {
          handleLeaveAllocation();
        } else {
          toast.error(data.message || i({ id: getCustomStatusCodesErrorMessage(data.statusCode) }));
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setSubmitting(false);
        handleButtonLoading(false);
      }
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{
        selectedPolicies: [] as string[],
      }}
      innerRef={formRef}
      validationSchema={Yup.object({
        selectedPolicies: Yup.array().of(Yup.string()),
      })}
      onSubmit={(values, { setSubmitting }) => {
        AllocateEmployeeLeaveBalance(values, setSubmitting);
      }}
    >
      {({ values, setFieldValue, handleSubmit }) => {
        const handleCheck = (id: string) => {
          const isSelected = values.selectedPolicies.includes(id);

          if (isSelected) {
            setFieldValue(
              "selectedPolicies",
              values.selectedPolicies.filter((item) => item !== id),
            );
          } else {
            setFieldValue("selectedPolicies", [...values.selectedPolicies, id]);
          }
        };

        return (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} className="leave-policy-item-wrapper">
              <Stack>
                <Typography variant="h6">
                  {i({ id: "EMPLOYEE.LEAVE.ASSIGN_LEAVE" })}
                </Typography>

                <Typography variant="body2">
                  {i({ id: "EMPLOYEE.LEAVE.NOTE" })}
                </Typography>
              </Stack>

              {leavePolicies.length > 0 ? (
                <Stack spacing={2}>
                  {leavePolicies.map((item) => (
                    <FormControlLabel
                      key={item.id}
                      className="leave-policy-item"
                      control={
                        <AppCheckbox
                          checked={values.selectedPolicies.includes(item.id!)}
                          onChange={() => handleCheck(item.id!)}
                          sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                        />
                      }
                      data-policy-checked={values.selectedPolicies.includes(
                        item.id!,
                      )}
                      label={
                        <>
                          <Typography variant="h6">{item.name}</Typography>

                          <Stack
                            direction="row"
                            sx={{
                              flexWrap: "wrap",
                              columnGap: 2,
                              rowGap: 1,
                            }}
                          >
                            <Typography variant="body1">
                              {i({ id: "EMPLOYEE.LEAVE.CODE" })} : {item.code}
                            </Typography>

                            <Typography variant="body1">
                              {i({ id: "EMPLOYEE.LEAVE.ACCRUAL_PERIOD" })} :
                              {i({
                                id: AccrualPeriodMapper[item.accrualPeriod],
                              })}
                            </Typography>

                            <Typography variant="body1">
                              {i({ id: "EMPLOYEE.LEAVE.ACCRUAL_AMOUNT" })} :
                              {i(
                                { id: "PLURAL.DAY" },
                                { days: item.accrualAmount },
                              )}
                            </Typography>

                            <Typography variant="body1">
                              {i({ id: "EMPLOYEE.LEAVE.MAX_BALANCE" })} :
                              {i(
                                { id: "PLURAL.DAY" },
                                { days: item.maxBalance },
                              )}
                            </Typography>
                          </Stack>
                        </>
                      }
                    />
                  ))}
                </Stack>
              ) : (
                <Box className="no-leave-policy">
                  <Typography variant="h6">
                    {i({ id: "EMPLOYEE.LEAVE.NO_POLICY" })}
                  </Typography>
                </Box>
              )}
            </Stack>
          </form>
        );
      }}
    </Formik>
  );
};
