import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useIntl } from "react-intl";
import { PayRollDataModel, PayRollResponseModel } from "../models";
import { AvatarCell } from "../../../shared/components/AvatarCell";
import { useMemo, useState } from "react";
import { currencyFormatter, dateFormatter, hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import clsx from "clsx";
import { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { generateEmployeePaySlip } from "../services";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { PdfViewer } from "../../../shared/components/PdfViewer";

interface Column {
  id:
    | keyof PayRollDataModel
    | "employeeName"
    | "grossPay"
    | "totalDeductions"
    | "netPay"
    | "actions";
  label: string;
  minWidth?: number;
  align?: "right";
}

const columns: Column[] = [
  { id: "actions", label: "ACTION", minWidth: 90 },
  { id: "employeeId", label: "PAYROLL.TABLE.EMP_ID", minWidth: 120 },
  { id: "employeeName", label: "PAYROLL.TABLE.EMP_NAME", minWidth: 200 },
  { id: "paidDate", label: "PAYROLL.TABLE.PAID_DATE", minWidth: 130 },
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
};

export const PayRollTable = ({ payRollData, payMonth, handleRowClick }: TableProps) => {
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
        (row.payData.esic ?? 0);
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

  return (
    <>
      <TableContainer className="flex-grow-1">
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  id={col.id}
                  sx={{ minWidth: col.minWidth }}
                  align={col.align}
                  key={col.id}
                >
                  {i({ id: col.label })}
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
              processedData.map((row, index) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={index}
                  className={clsx("pointer-cursor", {
                    "pe-none": !hasEditPermission,
                  })}
                  sx={{ borderBottom: 1, borderColor: "text.disabled" }}
                  onClick={() => handleRowClick(row)}
                >
                  {columns.map((column) => {
                    if (column.id === "employeeName") {
                      return (
                        <TableCell key={column.id}>
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
                        <TableCell key={column.id}>
                          {dateFormatter(row.payData.paidDate, "DD MMM YYYY")}
                        </TableCell>
                      );
                    }
                    if (column.id === "actions") {
                      const hasPayRoll = Boolean(row.payData.payRollId);
                      return (
                        <TableCell key={column.id} className="pe-auto">
                          <IconButton
                            aria-label={i({ id: "PAYROLL.TABLE.PREVIEW_PAYSLIP" })}
                            title={i({ id: "PAYROLL.TABLE.PREVIEW_PAYSLIP" })}
                            disabled={!hasPayRoll || previewingEmployeeId === row.employeeId}
                            onClick={(e) => handlePreviewPaySlip(e, row.employeeId, row.employeeName)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </TableCell>
                      );
                    }
                    if (amountColumns.has(column.id)) {
                      return (
                        <TableCell key={column.id}>
                          {currencyFormatter(row.payData[column.id] as number | null | undefined)}
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell key={column.id}>
                        {row.payData[column.id]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {
        previewUrl &&
        <CustomisedModal open={true} handleClose={handleClosePreview} title={previewTitle} allowMaximize>
          <PdfViewer pdfUrl={previewUrl} />
        </CustomisedModal>
      }
    </>
  );
};
