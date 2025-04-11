import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ColumnListTypes } from "../../../utils/common_types";
import TableSkeleton from "./TableSkeleton";
import { useEffect, useState } from "react";
import { TableSorting } from "./TableSorting";
import { getKeyForTableRow } from "../../../utils/common";
import { useIntl } from "react-intl";

interface PropsTypes<Row, Columns> {
  tabName?: string;
  keyName?: keyof Row;
  loading?: boolean;
  rows: Row[];
  columns: Columns[];
  page: number;
  rowsPerPage: number;
  openConfirmationModal?: (row: Row) => void;
  handleEdit?: (row: Row) => void;
  openViewModal?: (row: Row) => void;
  rowClickHandler?:(row:Row)=>void;
}

export const CustomisedTable = <Row, Column extends ColumnListTypes>(
  props: PropsTypes<Row, Column>
) => {
  const {formatMessage}= useIntl();
  const [tableRows, setTableRows] = useState(props.rows);
  const {
    rows,
    keyName,
    columns,
    page,
    rowsPerPage,
    handleEdit,
    loading,
    openConfirmationModal,
    openViewModal,
    rowClickHandler
  } = props;

  useEffect(() => {
    setTableRows(rows);
  }, [rows]);

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
                    formatMessage({id:column.label})
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
                    <TableRow
                      hover
                      key={keyName ? getKeyForTableRow(row, keyName) : index}
                      onClick={()=>rowClickHandler?.(row)}
                    >
                      {columns.map((column) => {
                        const value =
                          column.id === "serialNo"
                            ? page * rowsPerPage + (index + 1)
                            : column.id === "fullName"
                            ? row.firstName + " " + row.lastName
                            : row[column.id];
                        return (
                          <TableCell
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
