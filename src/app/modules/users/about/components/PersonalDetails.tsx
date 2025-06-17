import { Card, Grid, Stack, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import {
  dateFormatter,
  hasModuleFeaturePermission,
} from "../../../../../utils/common";
import { UpdateUserInfo } from "./UpdateUserInfo";
import { useState } from "react";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import { Edit } from "@mui/icons-material";
import { useUserDetails } from "../../UserDataProvider";
import { useParams } from "react-router-dom";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";

export const PersonalDetails = () => {
  const intl = useIntl();
  const [isModalOpen, setModalOpen] = useState(false);
  const { userDetails } = useUserDetails();
  const employeeId = useParams().employeeid;
  const userPermissions = useAppSelector((state) => state.user.userData?.modulePermission) || [];
  const hasEmployeeEditPermission = !employeeId || hasModuleFeaturePermission(ModulesName.Employees, Permission.Edit, userPermissions)


  return (
    <Card sx={{ p: 2 }}>
      <Stack className="flex-row justify-content-between" sx={{ mb: 2 }}   >
        <Typography variant="h5">
          {intl.formatMessage({ id: "PROFILE.PI" })}
        </Typography>
        {
          hasEmployeeEditPermission &&
          <CustomIconButton
            tooltip={intl.formatMessage({ id: "BUTTON.EDIT" })}
            icon={<Edit />}
            handleClick={() => setModalOpen(true)}
          />
        }

        {isModalOpen && userDetails && (
          <UpdateUserInfo
            open={isModalOpen}
            setOpen={setModalOpen}
            userData={userDetails}
          />
        )}
      </Stack>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.ADDRESS" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.address || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "FORM.EMAIL" })}
          </Typography>
          <Typography variant="body1">{userDetails?.email}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.PHONE" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.phoneNumber || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.DOB" })}
          </Typography>
          <Typography variant="body1">
            {dateFormatter(userDetails?.dateOfBirth!, "DD MMMM YYYY") || intl.formatMessage({ id: "NOT_AVAILABLE" })}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.GENDER" })}
          </Typography>
          <Typography variant="body1">{userDetails?.gender}</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.DOJ" })}
          </Typography>
          <Typography variant="body1">
            {dateFormatter(userDetails?.dateOfJoining!, "DD MMMM YYYY") || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.EMP_ID" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.employeeId}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.DEPARTMENT" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.departmentName || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.reportingManagerName || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.TEAM_LEAD" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.teamLeadName || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.PERSONAL_EMAIL" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.personalEmail || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.emergencyContact || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
          </Typography>
          <Typography variant="body1">
            {userDetails?.bloodGroup || <FormattedMessage id="NOT_AVAILABLE" />}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
};
