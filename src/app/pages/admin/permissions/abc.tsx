import {
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../modules/components/CustomisedButton";
import { CustomisedModal } from "../../../modules/components/CustomisedModal";
import { FC } from "react";
import { RolesType } from "../../../../utils/common_types";
import { colors } from "../../../modules/theme/MuiTheme";

type PropsType = {
  open: boolean;
  handleClose: () => void;
  role: RolesType;
};

export const RolePermissions: FC<PropsType> = ({ open, handleClose }) => {
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const intl = useIntl();
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack position={"sticky"}>
        <Typography variant="h4" mb={2}>
          {intl.formatMessage({ id: "ROLES.EDIT" })}
        </Typography>
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
              {intl.formatMessage({ id: "USER.DASHBOARD" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel control={<Checkbox disabled />} label="Edit" />
            <FormControlLabel control={<Checkbox disabled />} label="Delete" />
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
            <FormControlLabel control={<Checkbox disabled />} label="Edit" />
            <FormControlLabel control={<Checkbox disabled />} label="Delete" />
          </Stack>
        </Stack>

        {/* <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.LEAVE_MGMT" })}
              </Typography>
            </Stack>
            <Stack direction="row">
              <FormControlLabel control={<Checkbox disabled />} label="View" />
              <FormControlLabel control={<Checkbox disabled />} label="Edit" />
              <FormControlLabel control={<Checkbox disabled />} label="Delete" />
            </Stack>
          </Stack> */}
        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.ATTENDANCE" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel control={<Checkbox disabled />} label="Edit" />
            <FormControlLabel control={<Checkbox disabled />} label="Delete" />
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
            <FormControlLabel control={<Checkbox disabled />} label="Edit" />
            <FormControlLabel control={<Checkbox disabled />} label="Delete" />
          </Stack>
        </Stack>
        {/* <Stack>
            <Stack>
              <Typography variant="body1">
                {intl.formatMessage({ id: "MENU.CLIENTS" })}
              </Typography>
            </Stack>
            <Stack direction="row">
              <FormControlLabel control={<Checkbox />} label="View" />
              <FormControlLabel control={<Checkbox disabled />} label="Edit" />
              <FormControlLabel control={<Checkbox disabled />} label="Delete" />
            </Stack>
          </Stack> */}

        <Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "MENU.HOLIDAYS" })}
            </Typography>
          </Stack>
          <Stack direction="row">
            <FormControlLabel control={<Checkbox />} label="View" />
            <FormControlLabel control={<Checkbox disabled />} label="Edit" />
            <FormControlLabel control={<Checkbox disabled />} label="Delete" />
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
            <FormControlLabel control={<Checkbox disabled />} label="Edit" />
            <FormControlLabel control={<Checkbox disabled />} label="Delete" />
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
            <FormControlLabel control={<Checkbox disabled />} label="Delete" />
          </Stack>
        </Stack>
      </Stack>
      <Grid container display={"flex"} justifyContent={"end"} gap={2}>
        <CustomisedButton
          variant="outlined"
          handleClick={handleClose}
          label="Cancel"
        />
        <CustomisedButton label="Update" />
      </Grid>
    </CustomisedModal>
  );
};
