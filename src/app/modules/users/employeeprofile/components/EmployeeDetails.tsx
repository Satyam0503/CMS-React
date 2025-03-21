import { Card, Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { dateFormatter } from "../../../../../utils/common";
import { FC } from "react";

import { EmployeeModel } from "../../../../../utils/common_types";

interface Props {
  employeeDetails: EmployeeModel;
}

export const EmployeeDetails: FC<Props> = ({ employeeDetails }) => {
  const intl = useIntl();

  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {intl.formatMessage({ id: "PROFILE.PI" })}
      </Typography>

      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.ADDRESS" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.address || "NA"}{" "}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.email || "NA"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.PHONE" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.phoneNumber || "NA"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.DOB" })}
          </Typography>
          <Typography variant="body1">
            {dateFormatter(employeeDetails?.dateOfBirth!, "DD MMMM YYYY") ||
              "NA"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.GENDER" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.gender || "NA"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.DOJ" })}
          </Typography>
          <Typography variant="body1">
            {dateFormatter(employeeDetails?.dateOfJoining!, "DD MMMM YYYY")}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.EMP_ID" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.employeeId || "NA"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.DEPARTMENT" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.department || "NA"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.reportingManager || "NA"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.TEAM_LEAD" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.teamLead || "NA"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.PERSONAL_EMAIL" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.personalEmail || "NA"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.emergencyContact || "NA"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
          </Typography>
          <Typography variant="body1">
            {employeeDetails?.bloodGroup || "NA"}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
};
