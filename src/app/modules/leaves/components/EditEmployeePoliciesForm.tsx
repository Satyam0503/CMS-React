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
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { getLeavePolicies, updateEmployeeLeaveBalance } from "../leaveServices";
import {
  AccrualPeriodMapper,
  blockInvalidCharOnNumberField,
  getCustomStatusCodesErrorMessage,
} from "../../../../utils/common";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
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
  balance: number;
}[];

type GetLeaveBalanceValue = () => InitialValueType;

export default function EditEmployeePoliciesForm(props: Props) {
  const { selectedEmployee } = props;
  const { formatMessage: i } = useIntl();
  const [leavePolicies, setLeavePolicies] = useState<Array<LeavePolicyModel>>(
    []
  );

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

  const getInitialValues: GetLeaveBalanceValue = () => {
    if (selectedEmployee.leaveBalances.length) {
      return selectedEmployee.leaveBalances.map((lb) => {
        return {
          leaveBalanceId: lb.leaveBalanceId,
          employeeId: selectedEmployee.employeeId,
          leavePolicyId: lb.leavePolicyId,
          balance: lb.remaining,
        };
      });
    } else {
      return [];
    }
  };

  async function handleLeaveBalanceSubmission(
    values: InitialValueType,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    try {
      const payload: InitialValueType = values;
      const { data } = await updateEmployeeLeaveBalance(payload);
      if (data.success) {
        toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
        props.handleRefresh();
        props.handleClose();
      } else {
        throw new Error(data.statusCode.toString());
      }
    } catch (error) {
      toast.error(i({ id: getCustomStatusCodesErrorMessage(+(error as Error).message) }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CustomisedModal
      open={props.openOptions}
      handleClose={props.handleClose}
      title={i({ id: "LEAVE.TITLES.MANAGE_LEAVE_ALLOCATION" })}
    >
      <Box component={"div"}>
        <Formik
          enableReinitialize={true}
          initialValues={getInitialValues()}
          onSubmit={(values, { setSubmitting }) => {
            handleLeaveBalanceSubmission(values, setSubmitting);
          }}
        >
          {({
            values,
            handleSubmit,
            setValues,
            ...formik
          }) => (
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              {leavePolicies.map((leave) => {
                const selectedLeave = values.find(
                  (lb) => lb.leavePolicyId === leave.id
                );

                const handleLeavePolicyChange = (
                  id: string,
                  balance: number
                ) => {
                  const exist =
                    values.findIndex((lb) => lb.leavePolicyId === id) > -1;
                  if (exist) {
                    setValues(values.filter((lb) => lb.leavePolicyId !== id));
                  } else {
                    setValues([
                      ...values,
                      {
                        leavePolicyId: id,
                        balance: balance,
                        employeeId: selectedEmployee.employeeId,
                      },
                    ]);
                  }
                };

                const handleLeaveBalanceChange = (
                  id: string,
                  balance: number
                ) => {
                  const exist =
                    values.findIndex((lb) => lb.leavePolicyId === id) > -1;
                  if (exist) {
                    setValues(
                      values.map((lb) => {
                        if (lb.leavePolicyId === id) {
                          return {
                            ...lb,
                            balance: balance,
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
                          checked={selectedLeave ? true : false}
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
                      label={i({
                        id: "LEAVE.TITLES.LEAVE_BALANCE",
                      })}
                      type="number"
                      placeholder={i({
                        id: "LEAVE.TITLES.LEAVE_BALANCE",
                      })}
                      name={`${leave.id}balance`}
                      value={selectedLeave?.balance ?? ""}
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
              <CustomisedButton
                label={i({
                  id: "BUTTON.UPDATE",
                })}
                type="submit"
                loading={formik.isSubmitting}
                disabled={
                  formik.isSubmitting || !(formik.isValid && formik.dirty)
                }
              />
            </form>
          )}
        </Formik>
      </Box>
    </CustomisedModal>
  );
}
