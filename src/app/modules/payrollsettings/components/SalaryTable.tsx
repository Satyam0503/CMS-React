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
}

const columns: Column[] = [
  { id: "employeeId", label: "PAYROLL.TABLE.EMP_ID", minWidth: 120 },
  { id: "employeeName", label: "PAYROLL.TABLE.EMP_NAME", minWidth: 200 },
  { id: "basicPay", label: "PAYROLL.TABLE.BASIC_PAY", minWidth: 100 },
  { id: "hra", label: "PAYROLL.TABLE.HRA", minWidth: 100 },
  { id: "lta", label: "PAYROLL.TABLE.LTA", minWidth: 100 },
  { id: "otherAllowance", label: "PAYROLL.TABLE.OTHER_ALLOWANCE", minWidth: 130 },
  { id: "bonus", label: "PAYROLL.TABLE.BONUS", minWidth: 100 },
  { id: "healthInsurance", label: "PAYROLL.TABLE.HEALTH_INS", minWidth: 150 },
  { id: "grossSalary", label: "PAYROLL_SETTINGS.GROSS_SALARY", minWidth: 120 },
  { id: "ctc", label: "PAYROLL_SETTINGS.CTC", minWidth: 120 },
  { id: "effectiveFrom", label: "PAYROLL_SETTINGS.EFFECTIVE_FROM", minWidth: 130 },
  { id: "status", label: "PAYROLL_SETTINGS.STATUS", minWidth: 110 },
];

const amountColumns = new Set<Column["id"]>([
  "basicPay", "hra", "lta", "otherAllowance", "bonus", "healthInsurance", "grossSalary", "ctc",
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
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          scrollbarGutter: "stable",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2.5,
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "action.selected", borderRadius: 8 },
        }}
      >
      <Table stickyHeader sx={{ minWidth: 1560, "& .MuiTableCell-root": { py: 1.35 }, "& .MuiTableHead-root .MuiTableCell-root": { bgcolor: "action.hover", color: "text.secondary", fontWeight: 800, fontSize: 12, whiteSpace: "nowrap" } }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell id={col.id} sx={{ minWidth: col.minWidth }} key={col.id}>
                {i({ id: col.label })}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                {i({ id: "MESSAGE.NO_DATA_AVAILABLE" })}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                hover
                tabIndex={-1}
                key={index}
                className={clsx("pointer-cursor", { "pe-none": !hasEditPermission })}
                sx={{ borderBottom: 1, borderColor: "divider", transition: "background-color .2s ease", "&:hover": { bgcolor: "action.hover" } }}
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
                    return <TableCell key={column.id}>{row.employeeId}</TableCell>;
                  }
                  if (column.id === "status") {
                    const lifecycleStatus = row.lifecyclePayrollStatus;
                    const statusLabel = lifecycleStatus && lifecycleStatus !== "Active"
                      ? lifecycleStatus.replace(/([a-z])([A-Z])/g, "$1 $2")
                      : row.activeSalary ? i({ id: "PAYROLL_SETTINGS.STATUS_ACTIVE" }) : i({ id: "PAYROLL_SETTINGS.STATUS_NOT_SET" });
                    return (
                      <TableCell key={column.id}>
                        <Chip
                          size="small"
                          color={lifecycleStatus && lifecycleStatus !== "Active" ? "warning" : row.activeSalary ? "success" : "default"}
                          label={statusLabel}
                        />
                      </TableCell>
                    );
                  }
                  if (column.id === "effectiveFrom") {
                    return (
                      <TableCell key={column.id}>
                        {dateFormatter(row.activeSalary?.effectiveFrom ?? null, "DD MMM YYYY")}
                      </TableCell>
                    );
                  }
                  if (amountColumns.has(column.id)) {
                    return (
                      <TableCell key={column.id}>
                        {currencyFormatter(row.activeSalary?.[column.id as keyof SalaryModel] as number | null | undefined)}
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
        sx={{ mt: 1, "& .MuiTablePagination-toolbar": { px: { xs: 0, sm: 1 }, flexWrap: "wrap", justifyContent: "flex-end", gap: 0.5 }, "& .MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } } }}
      />
    </Box>
  );
};
