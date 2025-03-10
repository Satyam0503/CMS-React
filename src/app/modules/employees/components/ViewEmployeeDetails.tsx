import Grid from "@mui/material/Unstable_Grid2";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { EmployeeModel } from "../../../../utils/common_types";
import { dateFormatter, statusDecoder } from "../../../../utils/common";
import CustomisedButton from "../../components/CustomisedButton";
import { CustomisedModal } from "../../components/CustomisedModal";
import { StyleStatus } from "../../components/StyledStatus";

type PropsType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  employeeData: EmployeeModel;
};

export const ViewEmployeeDetails = (props: PropsType) => {
  const intl = useIntl();
  const { open, setOpen, employeeData } = props;

  function handleClose() {
    setOpen(false);
  }
  const status = statusDecoder(employeeData.status as boolean);
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Box>
        <Stack direction={"column"} spacing={3}>
          <Typography variant="h5">
            {intl.formatMessage({ id: "MENU.EMPLOYEE_DETAILS" })}
          </Typography>
          <Stack direction={"row"} spacing={2} alignItems={"center"}>
            <Avatar
              alt="User Profile"
              src={employeeData.fullProfileUrl}
              sx={{
                width: "128px",
                height: "128px",
                fontSize: "3rem",
              }}
            >
              {employeeData.firstName.charAt(0)}
            </Avatar>
            <Stack>
              <Typography variant="h5">{`${employeeData?.firstName} ${employeeData?.lastName}`}</Typography>
              <Typography variant="body1">
                {employeeData?.jobRole || "NA "}
              </Typography>
            </Stack>
          </Stack>

          <Grid container rowSpacing={1} columnSpacing={1} columns={12}>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.EMP_ID" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData?.employeeId}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData?.email}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.PHONE" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData?.phoneNumber}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.DEPARTMENT" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData?.department}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData?.reportingManager}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.TEAM_LEAD" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData?.teamLead}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.GENDER" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData?.gender}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.DOB" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>
                {dateFormatter(employeeData.dateOfBirth, "DD MMMM YYYY")}
              </Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.ADDRESS" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData.address}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData?.bloodGroup}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.PERSONAL_EMAIL" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData.personalEmail}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData.emergencyContact}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.DOJ" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>
                {dateFormatter(employeeData.dateOfJoining, "DD MMMM YYYY")}
              </Typography>
            </Grid>

            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "USER.ROLE" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <Typography>{employeeData.jobRole}</Typography>
            </Grid>
            <Grid xs={5} md={6}>
              <Typography variant="body1" fontWeight={600}>
                {intl.formatMessage({ id: "PROFILE.STATUS" })}
              </Typography>
            </Grid>
            <Grid xs={7} md={6}>
              <StyleStatus
                label={status}
                className={employeeData.status ? "success" : "danger"}
              />
            </Grid>
          </Grid>
          <Stack direction={"row"} spacing={1} justifyContent={"flex-end"}>
            <CustomisedButton
              variant="outlined"
              label="Close"
              handleClick={handleClose}
            />
          </Stack>
        </Stack>
      </Box>
    </CustomisedModal>
  );
};
