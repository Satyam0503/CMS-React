import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { colors } from "../../../modules/theme/MuiTheme";
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
import CustomisedButton from "../../../modules/components/CustomisedButton";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

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

  return (
    <Container>
      <Stack position={"sticky"}>
        <Typography variant="h4" my={3}>
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
          p: 5,
          borderRadius: 1,
          my: 2,
        }}
        spacing={3}
      >
        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.DASHBOARD" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel control={<Checkbox />} label="Edit" />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>
        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.EMP" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel control={<Checkbox />} label="Edit" />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>

        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.LEAVE_MGMT" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel control={<Checkbox />} label="Edit" />
            <FormControlLabel control={<Checkbox />} label="Assign Leaves" />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>
        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.ATTENDANCE" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel control={<Checkbox />} label="Edit" />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>
        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.PROJ" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel control={<Checkbox />} label="Edit" />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>
        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.CLIENTS" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel control={<Checkbox />} label="Edit" />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>
        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.RECRUITMENT" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel
              control={<Checkbox />}
              label="Edit job requirements"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Edit job description"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Edit job applications"
            />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>

        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.HOLIDAYS" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel control={<Checkbox />} label="Edit" />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>
        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.NOTICE_BOARD" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel
              control={<Checkbox />}
              label="Edit posted notice"
            />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>

        {/* User profile */}
        <Stack spacing={1}>
          <Typography variant="body1">
            {intl.formatMessage({ id: "USER.PROFILE" })}
          </Typography>

          <Stack direction="row" flexWrap={"wrap"}>
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel
              control={<Checkbox />}
              label="Edit introduction"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Edit personal informantion"
            />
            <FormControlLabel control={<Checkbox />} label="Edit skills" />
            <FormControlLabel control={<Checkbox />} label="Edit education" />
            <FormControlLabel
              control={<Checkbox />}
              label="Edit certification"
            />

            <FormControlLabel
              control={<Checkbox />}
              label="Edit pending for approval leaves"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Edit work history"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Edit notifications settings"
            />
            <FormControlLabel control={<Checkbox />} label="Change Password" />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>
        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.ADMIN" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel
              control={<Checkbox />}
              label="Template theme edit"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Assign permissions to admin"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Assign permissions to user"
            />
            <FormControlLabel control={<Checkbox />} label="Delete" />
          </Stack>
        </Stack>
      </Stack>
      <Grid container display={"flex"} justifyContent={"end"} gap={2}>
        <CustomisedButton
          variant="outlined"
          // handleClick={handleClose}
          label="Cancel"
        />
        <CustomisedButton label="Update" />
      </Grid>
    </Container>
  );
};
