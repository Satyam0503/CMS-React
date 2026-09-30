import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  alpha,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { AvatarCell } from "../../../shared/components/AvatarCell";
import { currencyFormatter, dateFormatter, hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { CompanySalaryResponseModel } from "../model";
import { SalaryModel } from "../../employees/models";

interface Column {
  id: keyof SalaryModel | "employeeId" | "employeeName" | "status";
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
}

const columns: Column[] = [
  { id: "employeeId", label: "PAYROLL.TABLE.EMP_ID", minWidth: 115 },
  { id: "employeeName", label: "PAYROLL.TABLE.EMP_NAME", minWidth: 210 },
  { id: "basicPay", label: "PAYROLL.TABLE.BASIC_PAY", minWidth: 115, align: "right" },
  { id: "hra", label: "PAYROLL.TABLE.HRA", minWidth: 105, align: "right" },
  { id: "lta", label: "PAYROLL.TABLE.LTA", minWidth: 105, align: "right" },
  { id: "otherAllowance", label: "PAYROLL.TABLE.OTHER_ALLOWANCE", minWidth: 130, align: "right" },
  { id: "bonus", label: "PAYROLL.TABLE.BONUS", minWidth: 105, align: "right" },
  { id: "healthInsurance", label: "PAYROLL.TABLE.HEALTH_INS", minWidth: 140, align: "right" },
  { id: "grossSalary", label: "PAYROLL_SETTINGS.GROSS_SALARY", minWidth: 130, align: "right" },
  { id: "ctc", label: "PAYROLL_SETTINGS.CTC", minWidth: 130, align: "right" },
  { id: "effectiveFrom", label: "PAYROLL_SETTINGS.EFFECTIVE_FROM", minWidth: 130 },
  { id: "status", label: "PAYROLL_SETTINGS.STATUS", minWidth: 110 },
];

const amountColumns = new Set<Column["id"]>([
  "basicPay",
  "hra",
  "lta",
  "otherAllowance",
  "bonus",
  "healthInsurance",
  "grossSalary",
  "ctc",
]);

type TableProps = {
  salaryData: CompanySalaryResponseModel[];
  handleRowClick: (row: CompanySalaryResponseModel) => void;
};

export const SalaryTable = ({ salaryData, handleRowClick }: TableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { formatMessage: i } = useIntl();
  const userModulePermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasEditPermission = hasModuleFeaturePermission(
    ModulesName.PayrollSettings,
    Permission.Edit,
    userModulePermissions,
  );

  useEffect(() => {
    setPage(0);
  }, [salaryData]);

  const rows = useMemo(
    () => salaryData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [salaryData, page, rowsPerPage],
  );

  return (
    <Box className="d-flex flex-column flex-grow-1" sx={{ minWidth: 0 }}>
      <TableContainer
        sx={(theme) => ({
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          scrollbarGutter: "stable",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.55),
          backdropFilter: "blur(12px)",
          "&::-webkit-scrollbar": { height: 7 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: alpha(theme.palette.primary.main, 0.25),
            borderRadius: 8,
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.45) },
          },
        })}
      >
        <Table
          stickyHeader
          sx={(theme) => ({
            minWidth: 1520,
            "& .MuiTableCell-root": {
              py: 1.4,
              px: 2,
              fontVariantNumeric: "tabular-nums",
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(15, 23, 42, 0.9)"
                  : "rgba(248, 250, 252, 0.92)",
              backdropFilter: "blur(10px)",
              color: "text.secondary",
              fontWeight: 700,
              fontSize: "0.74rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              borderBottom: "1px solid",
              borderColor: "divider",
            },
          })}
        >
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  id={col.id}
                  align={col.align ?? "left"}
                  sx={{ minWidth: col.minWidth }}
                  key={col.id}
                >
                  {i({ id: col.label })}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5, color: "text.secondary" }}>
                  {i({ id: "MESSAGE.NO_DATA_AVAILABLE" })}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={row.userId || index}
                  className={clsx("pointer-cursor", { "pe-none": !hasEditPermission })}
                  sx={(theme) => ({
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    transition: "background-color 0.18s ease",
                    "&:hover": {
                      bgcolor: `${alpha(theme.palette.primary.main, 0.055)} !important`,
                    },
                  })}
                  onClick={() => handleRowClick(row)}
                >
                  {columns.map((column) => {
                    if (column.id === "employeeName") {
                      return (
                        <TableCell key={column.id}>
                          <AvatarCell avatarSrc={""} title={row.employeeName} subTitle={row.jobTitle} />
                        </TableCell>
                      );
                    }
                    if (column.id === "employeeId") {
                      return (
                        <TableCell key={column.id}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontWeight: 600,
                              px: 1,
                              py: 0.4,
                              borderRadius: 1.5,
                              bgcolor: "action.hover",
                              color: "text.primary",
                            }}
                          >
                            {row.employeeId}
                          </Typography>
                        </TableCell>
                      );
                    }
                    if (column.id === "status") {
                      const lifecycleStatus = row.lifecyclePayrollStatus;
                      const statusLabel =
                        lifecycleStatus && lifecycleStatus !== "Active"
                          ? lifecycleStatus.replace(/([a-z])([A-Z])/g, "$1 $2")
                          : row.activeSalary
                            ? i({ id: "PAYROLL_SETTINGS.STATUS_ACTIVE" })
                            : i({ id: "PAYROLL_SETTINGS.STATUS_NOT_SET" });
                      return (
                        <TableCell key={column.id}>
                          <Chip
                            size="small"
                            color={
                              lifecycleStatus && lifecycleStatus !== "Active"
                                ? "warning"
                                : row.activeSalary
                                  ? "success"
                                  : "default"
                            }
                            variant={row.activeSalary ? "filled" : "outlined"}
                            label={statusLabel}
                          />
                        </TableCell>
                      );
                    }
                    if (column.id === "effectiveFrom") {
                      const formattedDate = dateFormatter(row.activeSalary?.effectiveFrom ?? null, "DD MMM YYYY");
                      return (
                        <TableCell key={column.id} sx={{ color: "text.secondary" }}>
                          {formattedDate === "NA" ? "—" : formattedDate}
                        </TableCell>
                      );
                    }
                    if (amountColumns.has(column.id)) {
                      const rawAmount = row.activeSalary?.[column.id as keyof SalaryModel] as
                        | number
                        | null
                        | undefined;
                      const formatted = currencyFormatter(rawAmount);
                      const isHighlightColumn = column.id === "grossSalary" || column.id === "ctc";
                      return (
                        <TableCell
                          key={column.id}
                          align="right"
                          sx={{
                            fontWeight: isHighlightColumn ? 700 : 500,
                            color:
                              formatted === "NA"
                                ? "text.disabled"
                                : isHighlightColumn
                                  ? "text.primary"
                                  : "text.secondary",
                          }}
                        >
                          {formatted === "NA" ? "—" : formatted}
                        </TableCell>
                      );
                    }
                    return <TableCell key={column.id}></TableCell>;
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={salaryData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number.parseInt(event.target.value, 10));
          setPage(0);
        }}
        sx={{
          mt: 1,
          "& .MuiTablePagination-toolbar": {
            px: { xs: 0, sm: 1 },
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: 0.5,
          },
          "& .MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } },
        }}
      />
    </Box>
  );
};
