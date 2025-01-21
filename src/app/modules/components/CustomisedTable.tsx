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

interface PropsTypes<Row, Columns> {
  tabName?: string;
  loading?: boolean;
  rows: Row[];
  columns: Columns[];
  page: number;
  rowsPerPage: number;
  openConfirmationModal?: (row: Row) => void;
  handleEdit?: (row: Row) => void;
  openViewModal?: (row:Row) => void;
  handleDownload?:()=>void;
}

export const CustomisedTable = <Row, Column extends ColumnListTypes>(
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
    handleDownload
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
                    <TableRow hover key={index}>
                      {columns.map((column) => {
                        const value =
                          column.id === "serialNo"
                            ? page * rowsPerPage + (index + 1)
                            : row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            align={column?.align || "left"}
                            sx={{ minWidth: column.minWidth || 140 }}
                          >
                            { column.avatarCell ? (
                                column.avatarCell(row)
                            ) : column.format ? (
                              column.format(value)
                            ) : column.build ? (
                              column.id === "action" ? (
                                column.build(
                                  row,
                                  handleEdit,
                                  openConfirmationModal,
                                  openViewModal,
                                  handleDownload,
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
