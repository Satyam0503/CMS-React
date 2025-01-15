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
import CustomisedButton from "../../../modules/components/CustomisedButton";

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

export const EditPermission = () => {
  const intl = useIntl();
  const { state } = useLocation();
  const navigate = useNavigate();
  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  useEffect(() => {
    if (!state) {
      navigate("/error/404", { replace: true });
    }
  }, []);

  console.log(state);
  

  return (
    <>
      <Stack position={"sticky"}>
        <Typography variant="h4" mb={3}>
          {intl.formatMessage({ id: "ROLES.EDIT" })}
        </Typography>{" "}
      </Stack>
      <Stack spacing={1}>
        <TextField variant="standard" label="Role Name" fullWidth />
        <TextField variant="standard" label="Description" fullWidth />
      </Stack>

      <Typography variant="h5" my={2}>
        {intl.formatMessage({ id: "Permissions" })}
      </Typography>

      <Stack
        sx={{
          border: "1px solid",
          borderColor: colors.alpha.neutral[200],
          borderRadius: 1,
          my: 2,
          p: { xs: 2, sm: 5 },
        }}
        spacing={3}
      >
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
                  {intl.formatMessage({ id: "Edit job requirements" })}
                </Typography>
              }
            />
            <FormControlLabel
              control={<Checkbox />}
              label={
                <Typography variant="caption">
                  {intl.formatMessage({ id: "Edit job description" })}
                </Typography>
              }
            />
            <FormControlLabel
              control={<Checkbox />}
              label={
                <Typography variant="caption">
                  {intl.formatMessage({ id: "Edit job application" })}
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
                  {intl.formatMessage({ id: "Edit posted notice" })}
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
      <Grid container display={"flex"} justifyContent={"end"} gap={2}>
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
