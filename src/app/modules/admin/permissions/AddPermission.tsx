import {
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Check } from "@mui/icons-material";
import { colors } from "../../../modules/theme/MuiTheme";
import CustomisedButton from "../../../shared/components/CustomisedButton";

function createData(name: string) {
  return { name };
}

const rows = [
  createData("Contacts"),
  createData("Attendance"),
  createData("Project"),
  createData("Leaves"),
  createData("Post Notice"),
];

export const AddPermission = () => {
  const intl = useIntl();
  const { state } = useLocation();
  const navigate = useNavigate();
  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  return (
    <>
      <Stack position={"sticky"}>
        <Typography variant="h4" mb={3}>
          {intl.formatMessage({ id: "ROLES.ADD" })}
        </Typography>{" "}
      </Stack>
      <Stack spacing={1}>
        <TextField
          variant="standard"
          label="Role Name"
          fullWidth
          sx={{
            "& .MuiInput-underline:before": {
              borderBottomColor: "gray", // default border color
            },
            "& .MuiInput-underline:focus": {
              borderBottomColor: colors.alpha.primary, // change border color on focus
            },
          }}
        />
        <TextField variant="standard" label="Description" fullWidth />
      </Stack>

      <Typography variant="h5" my={2}>
        {intl.formatMessage({ id: "Permissions" })}
      </Typography>
      <Container
        sx={{
          border: "1px solid",
          borderColor: colors.alpha.neutral[200],
          borderRadius: 1,
          p: { xs: 2, sm: 5 },
        }}
      >
        <Stack spacing={4}>
          <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.DASHBOARD" })}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.VIEW" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.EDIT" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.EMP" })}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.VIEW" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.EDIT" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>

          <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.LEAVE_MGMT" })}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.VIEW" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.EDIT" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "Assign Leaves" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.ATTENDANCE" })}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.VIEW" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.EDIT" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.PROJ" })}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.VIEW" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.EDIT" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.CLIENTS" })}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.VIEW" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.EDIT" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.RECRUITMENT" })}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.VIEW" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "JOB.REQUIREMENTS_EDIT" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "JOB.DESCRIPTION_EDIT" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "JOB.APPLICATIONS_EDIT" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>

          <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.HOLIDAYS" })}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.VIEW" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.EDIT" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.NOTICE_BOARD" })}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.VIEW" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "MENU.NOTICE_EDIT" })}
                  </Typography>
                }
              />

              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>

          {/* User profile */}
          <Stack spacing={1}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.PROFILE" })}
            </Typography>

            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({
                      id: "PERMISSION.VIEW",
                    })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({
                      id: "Edit introduction",
                    })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({
                      id: "Edit personal informantion",
                    })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({
                      id: "Edit skills",
                    })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({
                      id: "Edit education",
                    })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({
                      id: "Edit certification",
                    })}
                  </Typography>
                }
              />

              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({
                      id: "Edit pending for approval leaves",
                    })}
                  </Typography>
                }
              />

              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "Edit work history" })}
                  </Typography>
                }
              />

              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "Edit notifications settings" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "Change Password" })}
                  </Typography>
                }
              />

              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.ADMIN" })}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap={"wrap"}>
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.VIEW" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "Template theme edit" })}
                  </Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "Assign permissions" })}
                  </Typography>
                }
              />

              <FormControlLabel
                control={<Checkbox />}
                label={
                  <Typography variant="caption">
                    {intl.formatMessage({ id: "PERMISSION.DELETE" })}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
        </Stack>
      </Container>
      <Grid container display={"flex"} justifyContent={"end"} gap={2} mt={2}>
        <CustomisedButton
          variant="outlined"
          // handleClick={handleClose}
          label="Cancel"
        />
        <CustomisedButton
          label="Save Changes"
          Icon={<Check />}
          iconPosition="start"
        />
      </Grid>
    </>
  );
};
