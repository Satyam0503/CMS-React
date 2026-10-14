import {
  Table,
  TableBody,
  Chip,
  Stack,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { History, Visibility } from "@mui/icons-material";
import { useIntl } from "react-intl";
import { PayRollDataModel, PayRollResponseModel } from "../models";
import { AvatarCell } from "../../../shared/components/AvatarCell";
import { useEffect, useMemo, useState } from "react";
import { currencyFormatter, dateFormatter, hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import clsx from "clsx";
import { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { generateEmployeePaySlip } from "../services";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { PdfViewer } from "../../../shared/components/PdfViewer";

import { AppIconButton } from "../../../shared/components/ui";
interface Column {
  id:
    | keyof PayRollDataModel
    | "employeeName"
    | "paymentStatus"
    | "grossPay"
    | "totalDeductions"
    | "netPay"
    | "actions";
  label: string;
  minWidth?: number;
  align?: "right";
}

const columns: Column[] = [
  { id: "actions", label: "ACTION", minWidth: 108 },
  { id: "employeeId", label: "PAYROLL.TABLE.EMP_ID", minWidth: 120 },
  { id: "employeeName", label: "PAYROLL.TABLE.EMP_NAME", minWidth: 200 },
  { id: "paidDate", label: "PAYROLL.TABLE.PAID_DATE", minWidth: 130 },
  { id: "paymentStatus", label: "PAYROLL.TABLE.PAYMENT_STATUS", minWidth: 135 },
  { id: "basicPay", label: "PAYROLL.TABLE.BASIC_PAY", minWidth: 100 },
  { id: "bonus", label: "PAYROLL.TABLE.BONUS", minWidth: 100 },
  { id: "paidDays", label: "PAYROLL.TABLE.PAID_DAYS", minWidth: 100 },
  { id: "hra", label: "PAYROLL.TABLE.HRA", minWidth: 100 },
  { id: "lta", label: "PAYROLL.TABLE.LTA", minWidth: 100 },
  {
    id: "otherAllowance",
    label: "PAYROLL.TABLE.OTHER_ALLOWANCE",
    minWidth: 130,
  },
  {
    id: "lossOfPayDays",
    label: "PAYROLL.TABLE.LOSS_OF_PAID_DAYS",
    minWidth: 130,
  },
  { id: "lossOfPay", label: "PAYROLL.TABLE.LOSS_OF_PAY", minWidth: 120 },
  { id: "incomeTax", label: "PAYROLL.TABLE.INCOME_TAX", minWidth: 100 },
  { id: "healthInsurance", label: "PAYROLL.TABLE.HEALTH_INS", minWidth: 150 },
  { id: "epf", label: "PAYROLL.TABLE.EPF", minWidth: 100 },
  { id: "esic", label: "PAYROLL.TABLE.ESIC", minWidth: 100 },
  { id: "grossPay", label: "PAYROLL.TABLE.GROSS_PAY", minWidth: 120 },
  {
    id: "totalDeductions",
    label: "PAYROLL.TABLE.TOTAL_DEDUCTION",
    minWidth: 130,
  },
  { id: "netPay", label: "PAYROLL.TABLE.NET_PAY", minWidth: 100 },
];

const amountColumns = new Set<Column["id"]>([
  "basicPay", "bonus", "hra", "lta", "otherAllowance", "lossOfPay",
  "incomeTax", "healthInsurance", "epf", "esic", "grossPay", "totalDeductions", "netPay",
]);

type TableProps = {
  payRollData: PayRollResponseModel[];
  payMonth: Dayjs | null;
  handleRowClick: (row: PayRollResponseModel) => void;
  handleRecordPayment: (row: PayRollResponseModel) => void;
  handleViewAudit: (row: PayRollResponseModel) => void;
};

export const PayRollTable = ({ payRollData, payMonth, handleRowClick, handleViewAudit }: TableProps) => {
  const { formatMessage: i } = useIntl();
  const userModulePermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasEditPermission = hasModuleFeaturePermission(
    ModulesName.PayRoll,
    Permission.Edit,
    userModulePermissions,
  );
  const [previewingEmployeeId, setPreviewingEmployeeId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePreviewPaySlip = async (
    e: React.MouseEvent<HTMLButtonElement>,
    employeeId: string,
    employeeName: string,
  ) => {
    e.stopPropagation();
    if (!payMonth || previewingEmployeeId) {
      return;
    }
    setPreviewingEmployeeId(employeeId);
    try {
      const response = await generateEmployeePaySlip({
        employeeId,
        month: payMonth.month() + 1,
        year: payMonth.year(),
      });
      setPreviewTitle(employeeName);
      setPreviewUrl(URL.createObjectURL(response.data));
    } catch (error) {
      const response = (error as AxiosError).response;
      const contentType = response?.headers["content-type"] as string | undefined;
      if (contentType?.includes("application/json")) {
        const errorData = await (response?.data as Blob).text();
        const errorJson = JSON.parse(errorData);
        toast.error(errorJson.message || i({ id: "ERROR.500" }));
      } else {
        toast.error(i({ id: "ERROR.500" }));
      }
    } finally {
      setPreviewingEmployeeId(null);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewTitle("");
  };

  // Memoize processed data
  const processedData = useMemo(() => {
    return payRollData.map((row) => {
      const grossPay =
        (row.payData.basicPay ?? 0) +
        (row.payData.bonus ?? 0) +
        (row.payData.hra ?? 0) +
        (row.payData.lta ?? 0) +
        (row.payData.otherAllowance ?? 0);
      const totalDeductions =
        (row.payData.incomeTax ?? 0) +
        (row.payData.healthInsurance ?? 0) +
        (row.payData.lossOfPay ?? 0) +
        (row.payData.epf ?? 0) +
        (row.payData.esic ?? 0) +
        (row.payData.deductionLines ?? [])
          .filter((line) => line.code.toUpperCase() !== "LHD_ED_POLICY")
          .reduce((sum, line) => sum + Math.max(0, line.amount || 0), 0);
      const netPay = grossPay - totalDeductions;
      return {
        ...row,
        payData: {
          ...row.payData,
          grossPay,
          totalDeductions,
          netPay,
        },
      };
    });
  }, [payRollData]);

  useEffect(() => {
    setPage(0);
  }, [payRollData, payMonth]);

  const visibleRows = useMemo(
    () => processedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [processedData, page, rowsPerPage],
  );

  return (
    <>
      <TableContainer
        className="flex-grow-1"
        sx={{
          width: "100%",
          minWidth: 0,
          maxHeight: { xs: "60vh", md: "none" },
          overflowX: "auto",
          overflowY: { xs: "auto", md: "hidden" },
          touchAction: "pan-x",
          "&::-webkit-scrollbar": { height: 7, width: 7 },
        }}
      >
        <Table size="small" stickyHeader sx={{ minWidth: { xs: 900, sm: 1100, lg: 1440 } }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  id={col.id}
                  sx={{
                    minWidth: col.minWidth,
                    fontSize: { xs: 11.5, sm: 13 },
                    whiteSpace: "nowrap",
                    ...(col.id === "actions" ? {
                      position: "sticky",
                      left: 0,
                      zIndex: 3,
                      bgcolor: "background.paper",
                    } : {}),
                  }}
                  align={col.align}
                  key={col.id}
                >
                  {col.label === "PAYROLL.TABLE.PAYMENT_STATUS"
                    ? i({ id: col.label, defaultMessage: "Payment Status" })
                    : i({ id: col.label, defaultMessage: col.label.split(".").pop()?.replace(/_/g, " ") })}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {processedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  {" "}
                  {i({ id: "MESSAGE.NO_DATA_AVAILABLE" })}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row, index) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={row.payData.payRollId || `${row.employeeId}-${page * rowsPerPage + index}`}
                  className={clsx("pointer-cursor", {
                    "pe-none": !hasEditPermission || row.payData.isProcessed,
                  })}
                  sx={{ borderBottom: 1, borderColor: "text.disabled" }}
                  onClick={() => handleRowClick(row)}
                >
                  {columns.map((column) => {
                    if (column.id === "employeeName") {
                      return (
                        <TableCell key={column.id} sx={{ fontSize: { xs: 11.5, sm: 13 } }}>
                          <AvatarCell
                            avatarSrc={""}
                            title={row.employeeName}
                            subTitle={row.jobTitle}
                          />
                        </TableCell>
                      );
                    }
                    if (column.id === "paidDate") {
                      return (
                        <TableCell key={column.id} sx={{ fontSize: { xs: 11.5, sm: 13 }, whiteSpace: "nowrap" }}>
                          {dateFormatter(row.payData.paidDate, "DD MMM YYYY")}
                        </TableCell>
                      );
                    }
                    if (column.id === "paymentStatus") {
                      const status = (row.payData.workflowStatus ?? row.payData.paymentStatus ?? (row.payData.isProcessed ? "PROCESSED" : "DRAFT")).toUpperCase();
                      return <TableCell key={column.id} sx={{ fontSize: { xs: 11.5, sm: 13 } }}><Chip size="small" label={status} color={status === "CLOSED" ? "default" : status === "PAID" ? "success" : status === "PROCESSED" ? "info" : "warning"} /></TableCell>;
                    }
                    if (column.id === "actions") {
                      const hasPayRoll = Boolean(row.payData.payRollId);
                      const isProcessed = Boolean(row.payData.isProcessed);
                      return (
                        <TableCell
                          key={column.id}
                          className="pe-auto"
                          sx={{ position: "sticky", left: 0, zIndex: 2, bgcolor: "background.paper", whiteSpace: "nowrap" }}
                        >
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: "nowrap" }}>
                            <AppIconButton
                              aria-label="View payroll history"
                              title="View payroll history"
                              disabled={!hasPayRoll}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewAudit(row);
                              }}
                            >
                              <History fontSize="small" />
                            </AppIconButton>
                            {hasPayRoll && !isProcessed ? (
                              <Typography variant="caption" color="warning.main" fontWeight={700}>
                                Draft
                              </Typography>
                            ) : (
                              <AppIconButton
                                aria-label={i({ id: "PAYROLL.TABLE.PREVIEW_PAYSLIP" })}
                                title={i({ id: "PAYROLL.TABLE.PREVIEW_PAYSLIP" })}
                                disabled={!hasPayRoll || previewingEmployeeId === row.employeeId}
                                onClick={(e) => handlePreviewPaySlip(e, row.employeeId, row.employeeName)}
                              >
                                <Visibility fontSize="small" />
                              </AppIconButton>
                            )}
                          </Stack>
                        </TableCell>
                      );
                    }
                    if (amountColumns.has(column.id)) {
                      const deductionDetails = column.id === "totalDeductions"
                        ? (row.payData.deductionLines ?? []).filter((line) => line.code.toUpperCase() !== "LHD_ED_POLICY").map((line) => `${line.description}: ${currencyFormatter(line.amount)}`).join("; ")
                        : undefined;
                      return (
                        <TableCell key={column.id} title={deductionDetails || undefined} sx={{ fontSize: { xs: 11.5, sm: 13 }, whiteSpace: "nowrap" }}>
                          {currencyFormatter(row.payData[column.id] as number | null | undefined)}
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell key={column.id} sx={{ fontSize: { xs: 11.5, sm: 13 }, whiteSpace: "nowrap" }}>
                        {String(row.payData[column.id] ?? "")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={processedData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        sx={{
          borderTop: 1,
          borderColor: "divider",
          mt: 1,
          display: "flex",
          justifyContent: "flex-end",
          "& .MuiTablePagination-toolbar": {
            minHeight: 48,
            px: { xs: 1, sm: 2 },
            justifyContent: "flex-end",
            width: "100%",
          },
          "& .MuiTablePagination-spacer": { flex: "1 1 100%" },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: { xs: 12, sm: 14 }, mb: 0 },
          "& .MuiTablePagination-actions": { ml: { xs: 1, sm: 2.5 } },
        }}
      />
      {
        previewUrl &&
        <CustomisedModal open={true} handleClose={handleClosePreview} title={previewTitle} allowMaximize>
          <PdfViewer pdfUrl={previewUrl} />
        </CustomisedModal>
      }
    </>
  );
};

