import { useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { EmployeesDataTypes } from "../../../utils/common_types";
import { dateFormatter } from "../../../utils/common";
import CustomisedButton from "../components/CustomisedButton";
import { CustomisedModal } from "../components/CustomisedModal";
type PropsType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  employeeData: EmployeesDataTypes;
};

export const ViewEmployeeDetails = (props: PropsType) => {
  const intl = useIntl();
  const { open, setOpen, employeeData } = props;

  function handleClose() {
    setOpen(false);
  }
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Box>
        <Stack direction={"column"} spacing={3}>
          <Typography variant="h4" className="text-primary">
            {intl.formatMessage({ id: "MENU.EMPLOYEE_DETAILS" })}
          </Typography>
          <Stack direction={"row"} spacing={2} sx={{ alignItems: "center" }}>
            <Avatar
              alt="User Profile"
              src=""
              sx={{ width: "128px", height: "128px", fontSize: "48px" }}
            >
              {employeeData.firstName.charAt(0)}
            </Avatar>
            <Stack>
              <Typography variant="h5">{`${employeeData?.firstName} ${employeeData?.lastName}`}</Typography>
              <Typography variant="body2">{employeeData?.jobRole}</Typography>
            </Stack>
          </Stack>

          <Grid container rowSpacing={1} columnSpacing={1} columns={12}>
            <Grid xs={6}>
              <Typography className="fw-bold">Employee ID</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData?.employeeId}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Email</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData?.email}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Phone</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData?.phoneNumber}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Department</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData?.department}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Reporting Manager</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData?.reportingManager}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Team Lead</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData?.teamLead}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Gender</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData?.gender}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Date Of Birth</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>
                {dateFormatter(employeeData.dateOfBirth, "DD MMMM YYYY")}
              </Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Address</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData.address}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Blood Group</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData?.bloodGroup}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Personal Email</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData.personalEmail}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Emergency Contact</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData.emergencyContact}</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Joining Date</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>
                {dateFormatter(employeeData.dateOfJoining, "DD MMMM YYYY")}
              </Typography>
            </Grid>
            <Grid xs={6}>
              <Typography className="fw-bold">Status</Typography>
            </Grid>
            <Grid xs={6}>
              <Typography>{employeeData.status}</Typography>
            </Grid>
          </Grid>
          <Stack
            direction={"row"}
            spacing={1}
            sx={{ justifyContent: "flex-end" }}
          >
            <CustomisedButton label="Close" handleClick={handleClose} />
          </Stack>
        </Stack>
      </Box>
    </CustomisedModal>
  );
};
