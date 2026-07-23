import {
  Autocomplete,
  ListItemText,
} from "@mui/material";
import { Stack } from "@mui/system";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";

import CustomisedButton from "../../../shared/components/CustomisedButton";
import { getLeavePolicies } from "../leaveServices";
import { useIntl } from "react-intl";
import { LeavePolicyModel } from "../model";
import { FilterComponent } from "../../../shared/components/FilterComponent";
import { FilterComponentProps } from "../../../../utils/common_types";

import { AppCheckbox, AppTextField } from "../../../shared/components/ui";
type Props = {
  selectedPolicies: Array<string>;
  handleSelectingPolicies: (policyIds: Array<string>) => void;
  handleRefresh: () => void;
} & FilterComponentProps;

export default function FilterPolicySearch(props: Props) {
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

  return (
    <FilterComponent open={props.open} handleClose={props.handleClose} anchorEl={props.anchorEl}>
      <Formik
        enableReinitialize={true}
        initialValues={{
          selectedPolicies: props.selectedPolicies,
        }}
        onSubmit={(values, { setSubmitting }) => {
          props.handleSelectingPolicies(values.selectedPolicies);
          setSubmitting(false);
          props.handleRefresh();
          props.handleClose();
        }}
      >
        {({
          values,
          setFieldValue,
          handleSubmit,
          ...formik
        }) => (
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
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
                <AppTextField
                  {...params}
                  placeholder={i({ id: "LEAVE.TITLES.LEAVE_POLICY" })}
                />
              )}
              renderOption={(props, option, state) => {
                return (
                  <li {...props} key={option.id}>
                    <AppCheckbox
                      // key={option.id}
                      checked={state.selected}
                      sx={{ mr: 1 }}
                    />
                    <ListItemText primary={option.name} />
                  </li>
                );
              }}
            />

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <CustomisedButton
                label={i({
                  id: "BUTTON.CLEAR",
                })}
                variant="outlined"
                handleClick={() => {
                  props.handleSelectingPolicies([]);
                  props.handleRefresh();
                  props.handleClose();
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
    </FilterComponent>
  );
}
