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
import { useIsDark } from "../../theme/useIsDark";

interface Column {
  id: keyof SalaryModel | "employeeId" | "employeeName" | "status";
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
}

const columns: Column[] = [
  { id: "employeeId", label: "PAYROLL.TABLE.EMP_ID", minWidth: 140 },
  { id: "employeeName", label: "PAYROLL.TABLE.EMP_NAME", minWidth: 230 },
  { id: "basicPay", label: "PAYROLL.TABLE.BASIC_PAY", minWidth: 125, align: "right" },
  { id: "hra", label: "PAYROLL.TABLE.HRA", minWidth: 110, align: "right" },
  { id: "lta", label: "PAYROLL.TABLE.LTA", minWidth: 110, align: "right" },
  { id: "otherAllowance", label: "PAYROLL.TABLE.OTHER_ALLOWANCE", minWidth: 135, align: "right" },
  { id: "bonus", label: "PAYROLL.TABLE.BONUS", minWidth: 110, align: "right" },
  { id: "healthInsurance", label: "PAYROLL.TABLE.HEALTH_INS", minWidth: 140, align: "right" },
  { id: "grossSalary", label: "PAYROLL_SETTINGS.GROSS_SALARY", minWidth: 140, align: "right" },
  { id: "ctc", label: "PAYROLL_SETTINGS.CTC", minWidth: 145, align: "right" },
  { id: "effectiveFrom", label: "PAYROLL_SETTINGS.EFFECTIVE_FROM", minWidth: 135, align: "center" },
  { id: "status", label: "PAYROLL_SETTINGS.STATUS", minWidth: 130, align: "center" },
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
  const isDark = useIsDark();
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
          bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.55)",
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
            minWidth: 1650,
            tableLayout: "fixed",
            "& .MuiTableCell-root": {
              py: 1.4,
              px: 2,
              fontVariantNumeric: "tabular-nums",
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              bgcolor: isDark ? "#0f172a !important" : "#f8fafc !important",
              backdropFilter: "none",
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
          <colgroup>
            {columns.map((col) => (
              <col key={col.id} style={{ width: col.minWidth }} />
            ))}
          </colgroup>
          <TableHead>
            <TableRow>
              {columns.map((col) => {
                const isStickyId = col.id === "employeeId";
                const isStickyName = col.id === "employeeName";
                return (
                  <TableCell
                    id={col.id}
                    align={col.align ?? "left"}
                    sx={{
                      minWidth: col.minWidth,
                      width: col.minWidth,
                      maxWidth: col.minWidth,
                      ...(isStickyId && {
                        position: "sticky",
                        left: 0,
                        zIndex: 4,
                        bgcolor: isDark ? "#0f172a !important" : "#f8fafc !important",
                      }),
                      ...(isStickyName && {
                        position: "sticky",
                        left: 140,
                        zIndex: 4,
                        bgcolor: isDark ? "#0f172a !important" : "#f8fafc !important",
                        boxShadow: isDark
                          ? "4px 0 8px -2px rgba(0, 0, 0, 0.35)"
                          : "4px 0 8px -2px rgba(15, 23, 42, 0.04)",
                      }),
                    }}
                    key={col.id}
                  >
                    {i({ id: col.label })}
                  </TableCell>
                );
              })}
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
              rows.map((row, index) => {
                const rowBg = isDark ? "#0f172a" : "#FFFFFF";
                const stickyCellCommon = {
                  bgcolor: rowBg,
                  transition: "background-color 0.18s ease",
                };
                return (
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
                        bgcolor: isDark ? "#1e293b !important" : "#f1f5f9 !important",
                        "& > td": {
                          bgcolor: isDark ? "#1e293b !important" : "#f1f5f9 !important",
                        },
                      },
                    })}
                    onClick={() => { if (hasEditPermission) handleRowClick(row); }}
                  >
                    {columns.map((column) => {
                      if (column.id === "employeeId") {
                        return (
                          <TableCell
                            key={column.id}
                            sx={{
                              position: "sticky",
                              left: 0,
                              zIndex: 2,
                              width: 140,
                              minWidth: 140,
                              maxWidth: 140,
                              ...stickyCellCommon,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                fontWeight: 650,
                                fontSize: "0.785rem",
                                px: 1.25,
                                py: 0.45,
                                borderRadius: "6px",
                                bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.05)",
                                color: "text.primary",
                                border: "1px solid",
                                borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                letterSpacing: "0.02em",
                              }}
                            >
                              {row.employeeId}
                            </Box>
                          </TableCell>
                        );
                      }
                      if (column.id === "employeeName") {
                        return (
                          <TableCell
                            key={column.id}
                            sx={{
                              position: "sticky",
                              left: 140,
                              zIndex: 2,
                              width: 230,
                              minWidth: 230,
                              maxWidth: 230,
                              boxShadow: isDark
                                ? "4px 0 8px -2px rgba(0, 0, 0, 0.35)"
                                : "4px 0 8px -2px rgba(15, 23, 42, 0.04)",
                              ...stickyCellCommon,
                            }}
                          >
                            <AvatarCell avatarSrc={""} title={row.employeeName} subTitle={row.jobTitle} />
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
                          <TableCell key={column.id} align="center" sx={{ whiteSpace: "nowrap", px: 2 }}>
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
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                height: 24,
                                borderRadius: "6px",
                                textTransform: "capitalize",
                                px: 0.5,
                              }}
                            />
                          </TableCell>
                        );
                      }
                      if (column.id === "effectiveFrom") {
                        const formattedDate = dateFormatter(row.activeSalary?.effectiveFrom ?? null, "DD MMM YYYY");
                        return (
                          <TableCell key={column.id} align="center" sx={{ color: "text.secondary", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
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
                        const isCtc = column.id === "ctc";
                        const isGross = column.id === "grossSalary";
                        const isHighlightColumn = isGross || isCtc;
                        return (
                          <TableCell
                            key={column.id}
                            align="right"
                            sx={{
                              fontWeight: isCtc ? 750 : isGross ? 700 : 500,
                              fontSize: isHighlightColumn ? "0.865rem" : "0.835rem",
                              whiteSpace: "nowrap",
                              color:
                                formatted === "NA"
                                  ? "text.disabled"
                                  : isCtc
                                    ? "primary.main"
                                    : isGross
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
                );
              })
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
