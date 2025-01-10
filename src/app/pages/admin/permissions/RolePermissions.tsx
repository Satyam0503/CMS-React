import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { colors } from "../../../modules/theme/MuiTheme";
import { Box, Checkbox, Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../modules/components/CustomisedButton";
import { Check, Undo } from "@mui/icons-material";
import { CustomisedModal } from "../../../modules/components/CustomisedModal";
import { FC } from "react";
import { RolesType } from "../../../../utils/common_types";

type PropsType = {
  open: boolean;
  handleClose: () => void;
  role: RolesType;
};

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

export const RolePermissions: FC<PropsType> = ({ open, handleClose }) => {
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const intl = useIntl();
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
      <Stack spacing={2}>
        <Typography variant="h4">Edit Role</Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>
                  {intl.formatMessage({ id: "MENU.MODULE" })}
                </TableCell>
                <TableCell align="left">
                  {intl.formatMessage({ id: "MENU.SUP.ADMIN" })}
                </TableCell>
                <TableCell align="left">
                  {intl.formatMessage({ id: "MENU.ADMIN" })}
                </TableCell>
                <TableCell align="left">
                  {intl.formatMessage({ id: "MENU.MGMT" })}
                </TableCell>
                <TableCell align="left">
                  {intl.formatMessage({ id: "MENU.USER" })}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "600",
                        color: colors.alpha.neutral[800],
                      }}
                    >
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Checkbox {...label} defaultChecked />
                  </TableCell>
                  <TableCell align="left">
                    <Checkbox {...label} defaultChecked />
                  </TableCell>
                  <TableCell align="left">
                    <Checkbox {...label} defaultChecked />
                  </TableCell>
                  <TableCell align="left">
                    <Checkbox {...label} defaultChecked />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Grid container display={"flex"} justifyContent={"end"} gap={2}>
          <CustomisedButton
            variant="outlined"
            handleClick={handleClose}
            label="Cancel"
          />
          <CustomisedButton label="Update" />
        </Grid>
      </Stack>
    </CustomisedModal>
  );
};
