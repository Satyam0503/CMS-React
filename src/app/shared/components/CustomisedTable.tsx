import {
  Grid,
  Icon,
  Link,
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
import TableSkeleton from "./TableSkeleton";
import { useEffect, useState } from "react";
import { TableSorting } from "./TableSorting";
import { useNavigate } from "react-router-dom";

interface PropsTypes<Row, Columns> {
  tabName?: string;
  loading?: boolean;
  rows: Row[];
  columns: Columns[];
  page: number;
  rowsPerPage: number;
  openConfirmationModal?: (row: Row) => void;
  handleEdit?: (row: Row) => void;
  openViewModal?: (row: Row) => void;
}

export const CustomisedTable = <Row, Column extends ColumnListTypes>(
  props: PropsTypes<Row, Column>
) => {
  const [tableRows, setTableRows] = useState(props.rows);
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

  const UpdateTableRows = () => {};
  const navigate = useNavigate();

  useEffect(() => {
    setTableRows(rows);
  }, [rows]);
  function handleClick() {
    navigate(`/recruitment/applicant/${rows}`, {
      replace: true,
      state: { key: "value" },
    });
  }

  return (
    <Grid container>
      <TableContainer>
        <Table stickyHeader aria-label="table">
          <TableHead>
            <TableRow sx={{ textWrap: "nowrap" }}>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column?.align || "left"}
                  style={{ minWidth: column.minWidth || 120 }}
                >
                  {column.sorting ? (
                    <TableSorting
                      label={column.label}
                      rows={tableRows}
                      setRows={setTableRows}
                      columnKey={column.id}
                    />
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={12} align="center">
                  <TableSkeleton />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {tableRows?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    No Data Available
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {tableRows.map((row: any, index: number) => (
                    <TableRow hover key={index}>
                      {columns.map((column) => {
                        const value =
                          column.id === "serialNo"
                            ? page * rowsPerPage + (index + 1)
                            : column.id === "fullName"
                            ? row.firstName + " " + row.lastName
                            : row[column.id];
                        return (
                          <TableCell
                            // onClick={handleClick}
                            className="text pointer-cursor"
                            key={column.id}
                            align={column?.align || "left"}
                            style={
                              column.id === "vacancies"
                                ? {
                                    textAlign: "justify",
                                    paddingInline: "4rem",
                                  }
                                : {
                                    textAlign: "inherit",
                                  }
                            }
                          >
                            {column.avatarCell
                              ? column.avatarCell(row)
                              : column.format
                              ? column.format(value)
                              : column.build
                              ? column.id === "action"
                                ? column.build(
                                    row,
                                    handleEdit,
                                    openConfirmationModal,
                                    openViewModal
                                  )
                                : column.build(value)
                              : value}
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
