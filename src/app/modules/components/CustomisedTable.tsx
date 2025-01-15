import {
  Avatar,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ColumnListTypes } from "../../../utils/common_types";
import { colors } from "../theme/MuiTheme";

interface PropsTypes<Row, Columns> {
  tabName?: string;
  loading?: boolean;
  rows: Row[];
  columns: Columns[];
  page: number;
  rowsPerPage: number;
  openConfirmationModal?: (id: string) => void;
  handleEdit?: (row: Row) => void;
  openViewModal?: (id: string) => void;
}

export const CustomisedTable = <
  Row extends { id: string },
  Column extends ColumnListTypes
>(
  props: PropsTypes<Row, Column>
) => {
  const {
    rows,
    columns,
    page,
    rowsPerPage,
    handleEdit,
    loading,
    openConfirmationModal,
    openViewModal,
  } = props;

  return (
    <Grid container>
      <TableContainer>
        <Table stickyHeader aria-label="table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column?.align || "left"}
                  style={{ minWidth: column.minWidth || 150 }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={12} align="center">
                  <Typography variant="h6"> Loading... </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    No Data Available
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {rows.map((row: any, index: number) => (
                    <TableRow hover key={row.id}>
                      {columns.map((column) => {
                        const value =
                          column.id === "serialNo"
                            ? page * rowsPerPage + (index + 1)
                            : column.id === "name"
                            ? row.firstName + " " + row.lastName
                            : row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            align={column?.align || "left"}
                            sx={{ minWidth: column.minWidth || 140 }}
                          >
                            {column.id === "name" ||
                            column.id === "jobTitle" ? (
                              <AvatarCell
                                title={value}
                                subTitle={row.jobRole}
                              />
                            ) : column.format ? (
                              column.format(value)
                            ) : column.build ? (
                              column.id === "action" ? (
                                column.build(
                                  row,
                                  handleEdit,
                                  openConfirmationModal,
                                  openViewModal
                                )
                              ) : (
                                column.build(value)
                              )
                            ) : (
                              value
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Grid>
  );
};

interface AvatarCellPropsTypes {
  title?: string;
  subTitle?: string;
  avatarSrc?: any;
}

export const AvatarCell = ({
  title,
  avatarSrc,
  subTitle,
}: AvatarCellPropsTypes) => {
  return (
    <Stack direction="row" spacing={1}>
      <Avatar src={avatarSrc || ""}>{title?.at(0)?.toLocaleUpperCase()}</Avatar>
      <Stack direction="column">
        <Typography variant="body1" className="fw-semibold d-block">
          {title || "NA"}
        </Typography>
        <Typography variant="body2" className="text-muted">
          {subTitle || "NA"}
        </Typography>
      </Stack>
    </Stack>
  );
};
