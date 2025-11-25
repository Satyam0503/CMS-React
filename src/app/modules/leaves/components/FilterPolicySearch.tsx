import {
  FormControlLabel,
  Typography,
  Checkbox,
  TextField,
  Autocomplete,
  ListItemText,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
  AccrualPeriodMapper,
  blockInvalidCharOnNumberField,
} from "../../../../utils/common";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { getLeavePolicies } from "../leaveServices";
import { useIntl } from "react-intl";
import { LeavePolicyModel } from "../model";
import { JobType } from "../../../../utils/constant/Constant";

type Props = {
  selectedPolicies: Array<string>;
  handleSelectingPolicies: (policyIds: Array<string>) => void;
  handleRefresh: () => void;
};

export default function FilterPolicySearch(props: Props) {
  const { formatMessage: i } = useIntl();
  const [isLoading, setLoading] = useState(true);
  const [leavePolicies, setLeavePolicies] = useState<Array<LeavePolicyModel>>(
    []
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getLeavePolicies(true);
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
      <Formik
        enableReinitialize={true}
        initialValues={{
          selectedPolicies: props.selectedPolicies,
        }}
        onSubmit={(values, { setSubmitting }) => {
          props.handleSelectingPolicies(values.selectedPolicies);
          setSubmitting(false);
          props.handleRefresh();
          // console.log(values.selectedPolicies);
        }}
      >
        {({
          values,
          setFieldValue,
          setFieldTouched,
          handleSubmit,
          setValues,
          ...formik
        }) => (
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {/* {leavePolicies.map((policy) => {
              const isChecked = values.selectedPolicies.includes(policy.id!);
              console.log(values);

              // console.log(lb);

              const handleLeavePolicyChange = (id: string) => {
                if (isChecked) {
                  setFieldValue(
                    "selectedPolicies",
                    values.selectedPolicies.filter((p) => p !== id)
                  );
                } else {
                  setFieldValue("selectedPolicies", [
                    ...values.selectedPolicies,
                    id,
                  ]);
                }
              };

              return (
                <Stack direction="row" key={policy.id}>
                  <FormControlLabel
                    key={policy.id}
                    label={
                      <Typography variant="body1" color="initial">
                        {policy.name}
                      </Typography>
                    }
                    labelPlacement="start"
                    sx={{
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                    control={
                      <Checkbox
                        value={policy.id}
                        checked={isChecked}
                        name={policy.id!}
                        className="check-leave-selected"
                        onChange={() => handleLeavePolicyChange(policy.id!)}
                        color="primary"
                      />
                    }
                  />
                </Stack>
              );
            })} */}

            <Autocomplete
              multiple
              size="small"
              id="selectedPolicies"
              options={leavePolicies}
              disableCloseOnSelect
              value={leavePolicies.filter((policy) =>
                values.selectedPolicies.includes(policy.id!)
              )}
              onChange={(event, value) => {
                setFieldValue(
                  "selectedPolicies",
                  value.map((item) => item.id)
                );
              }}
              getOptionLabel={(option) => {
                return option.name;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={i({ id: "LEAVE.TITLES.LEAVE_POLICY" })}
                />
              )}
              renderOption={(props, option, state) => {
                return (
                  <li {...props} key={option.id}>
                    <Checkbox
                      // key={option.id}
                      checked={state.selected}
                      sx={{ mr: 1 }}
                    />
                    <ListItemText primary={option.name} />
                  </li>
                );
              }}
            />

            <Stack direction={"row"} spacing={2}>
              <CustomisedButton
                label={i({
                  id: "BUTTON.CLEAR",
                })}
                handleClick={() => {
                  props.handleSelectingPolicies([]);
                  props.handleRefresh();
                }}
              />
              <CustomisedButton
                label={i({
                  id: "BUTTON.APPLY",
                })}
                type="submit"
                loading={formik.isSubmitting}
                disabled={
                  formik.isSubmitting || !(formik.isValid && formik.dirty)
                }
              />
            </Stack>
          </form>
        )}
      </Formik>
    </Box>
  );
}
