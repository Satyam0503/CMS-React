import {
  Box,
  Button,
  FormControl,
  FormLabel,
  InputLabel,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  Chip,
  Stack,
} from "@mui/material";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { leaveBalanceValidationSchema } from "../../../../utils/Schema/leaveManagementValidationSchemas";
import { LeavePolicyModel } from "../model";
import { CheckBox } from "@mui/icons-material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { ACCURAL_PERIOD } from "../../../../utils/enums";
import { getLeavePolicies } from "../leaveServices";
import { AccrualPeriodMapper } from "../../../../utils/common";
export default function EditEmployeePoliciesForm() {
  const { formatMessage: i } = useIntl();
  const [isLoading, setLoading] = useState(true);
  const [leavePolicies, setLeavePolicies] = useState<Array<LeavePolicyModel>>(
    []
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await  getLeavePolicies(true);
        if (data) {
          setLeavePolicies(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box component={"div"}>
      <Typography variant="h5" sx={{ marginBottom: "20px" }}>
        {i({ id: "LEAVE.TITLES.MANAGE_LEAVE_ALLOCATION" })}
      </Typography>
      <Formik
        initialValues={{}}
        onSubmit={(values, { setSubmitting }) => {
          // handleLeaveBalanceSubmission(values, setSubmitting);
        }}
      >
        {({
          values,
          setFieldValue,
          setFieldTouched,
          handleSubmit,
          ...formik
        }) => (
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {leavePolicies.map((leave) => {
              return (
                <Stack direction={"row"}>
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
                          })}{" "}
                          {/* <Chip
                              label={}
                              size="small"
                            /> */}
                          {AccrualPeriodMapper[leave.accrualPeriod]}
                        </Typography>
                      </Box>
                    }
                    labelPlacement="end"
                    sx={{
                      width: "100%",
                    }}
                    control={
                      <Checkbox
                        value={leave.id}
                        // checked={false}
                        className="check-leave-selected"
                        sx={{
                          ".MuiSvgIcon-root": {
                            fontSize: "28px",
                          },
                        }}
                        onChange={() => console.log("Hello")}
                        color="primary"
                      />
                    }
                  />
                  <TextField
                    label={i({
                      id: "LEAVE.TITLES.LEAVE_BALANCE",
                    })}
                    type="number"
                    placeholder={i({
                      id: "LEAVE.TITLES.LEAVE_BALANCE",
                    })}
                    value={leave.accrualAmount ? leave.accrualAmount : ""}
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
  );
}
