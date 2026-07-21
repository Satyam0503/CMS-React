import { UploadFile } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { bulkImportEmployees } from "../employeeServices";
import { BulkImportEmployeeModel } from "../models";

type Props = {
  open: boolean;
  handleClose: () => void;
  onImported?: () => void;
};

const validImportFileExtensions = ["xlsx", "xls", "csv"];
const requiredHeaderAlias: Record<keyof BulkImportEmployeeModel, string[]> = {
  empId: ["emp id", "employee id", "employeeid", "empid"],
  firstName: ["first name", "firstname"],
  lastName: ["last name", "lastname"],
  email: ["email", "email id", "emailid"],
  role: ["role", "role name"],
  department: ["department", "department name"],
  jobRole: ["job role", "jobrole", "job title", "designation"],
  gender: ["gender", "sex"],
};

const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").trim();

const getMappedHeader = (
  headers: string[],
  aliases: string[],
): string | undefined => {
  return headers.find((header) => aliases.includes(normalizeHeader(header)));
};

const mapRowsToBulkEmployees = (
  rows: Record<string, unknown>[],
): BulkImportEmployeeModel[] => {
  if (!rows.length) return [];

  const headers = Object.keys(rows[0]);
  const headerMap = {
    empId: getMappedHeader(headers, requiredHeaderAlias.empId),
    firstName: getMappedHeader(headers, requiredHeaderAlias.firstName),
    lastName: getMappedHeader(headers, requiredHeaderAlias.lastName),
    email: getMappedHeader(headers, requiredHeaderAlias.email),
    role: getMappedHeader(headers, requiredHeaderAlias.role),
    department: getMappedHeader(headers, requiredHeaderAlias.department),
    jobRole: getMappedHeader(headers, requiredHeaderAlias.jobRole),
    gender: getMappedHeader(headers, requiredHeaderAlias.gender),
  };

  if (
    !headerMap.empId ||
    !headerMap.firstName ||
    !headerMap.lastName ||
    !headerMap.email ||
    !headerMap.role ||
    !headerMap.department ||
    !headerMap.jobRole ||
    !headerMap.gender
  ) {
    throw new Error("Missing required headers");
  }

  const { empId, firstName, lastName, email, role, department, jobRole, gender } =
    headerMap;
  return rows
    .map((row) => ({
      empId: String(row[empId] ?? "").trim(),
      firstName: String(row[firstName] ?? "").trim(),
      lastName: String(row[lastName] ?? "").trim(),
      email: String(row[email] ?? "").trim(),
      role: String(row[role] ?? "").trim(),
      department: String(row[department] ?? "").trim(),
      jobRole: String(row[jobRole] ?? "").trim(),
      gender: String(row[gender] ?? "").trim(),
    }))
    .filter(
      (employee) =>
        employee.empId &&
        employee.firstName &&
        employee.lastName &&
        employee.email &&
        employee.role &&
        employee.department &&
        employee.jobRole &&
        employee.gender,
    );
};

export const BulkImportEmployeesModal = ({
  open,
  handleClose,
  onImported,
}: Props) => {
  const [bulkImportFileName, setBulkImportFileName] = useState("");
  const [bulkImportedEmployees, setBulkImportedEmployees] = useState<
    BulkImportEmployeeModel[]
  >([]);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [saveSummary, setSaveSummary] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const bulkImportInputRef = useRef<HTMLInputElement | null>(null);

  const handleBulkImportClick = () => {
    bulkImportInputRef.current?.click();
  };

  const handleDownloadSample = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    const csv =
      "Emp ID,First Name,Last Name,Email,Gender,Role,Department,Job Role\r\n" +
      "EMP001,John,Doe,john.doe@example.com,Male,Employee,Engineering,Software Engineer\r\n";
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "employee-bulk-import-sample.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleBulkImportFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaveErrors([]);
    setSaveSummary("");
    setBulkImportFileName(file.name);
    const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!validImportFileExtensions.includes(fileExt)) {
      toast.error("Unsupported file format.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) {
        toast.error("Failed to read file.");
        return;
      }

      try {
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          toast.error("No worksheet found in selected file.");
          return;
        }
        const sheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
        });
        const parsedEmployees = mapRowsToBulkEmployees(rawRows);
        if (parsedEmployees.length === 0) {
          toast.error("No employee rows found in selected file.");
          return;
        }
        setBulkImportedEmployees(parsedEmployees);
        toast.success(`Parsed ${parsedEmployees.length} employees.`);

        // TODO: Wire backend API here.
      } catch (error) {
        toast.error(
          "Invalid template. Required columns: Emp ID, First Name, Last Name, Email, Gender, Role, Department, Job Role.",
        );
      }
    };

    event.target.value = "";
  };

  const handleSave = async () => {
    if (!bulkImportedEmployees.length) {
      toast.error("Please upload and parse a file before saving.");
      return;
    }
    try {
      setIsSaving(true);
      setSaveErrors([]);
      setSaveSummary("");
      const { data } = await bulkImportEmployees({
        employees: bulkImportedEmployees,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to save imported employees.");
      }

      const methodResult = data.methodResult ?? {};
      const createdCount = methodResult.createdCount ?? 0;
      const failedCount = methodResult.failedCount ?? 0;
      const total = methodResult.total ?? bulkImportedEmployees.length;
      setSaveSummary(
        `Saved ${createdCount}/${total} employees. Failed: ${failedCount}.`,
      );

      if (createdCount > 0) {
        onImported?.();
      }

      const resultErrors =
        methodResult.results
          ?.filter((item) => item.status?.toLowerCase() === "failed")
          .map((item) => {
            const id = item.rowNumber
              ? `Row ${item.rowNumber}`
              : item.empId || item.email || "Row";
            return `${id}: ${item.message || "Failed to import."}`;
          }) ?? [];

      if (resultErrors.length > 0) {
        setSaveErrors(resultErrors);
      } else {
        toast.success("Employees imported successfully.");
        handleClose();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save imported employees.";
      setSaveErrors([message]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>Bulk Import Employees</DialogTitle>
      <DialogContent>
        <Box className="d-flex flex-column gap-2">
          <Typography variant="body2">
            Upload Excel/CSV with columns: Emp ID, First Name, Last Name, Email,
            Gender, Role, Department, Job Role.
          </Typography>
          <Typography variant="body2">
            Sample file:{" "}
            <Link
              href="#"
              onClick={handleDownloadSample}
              underline="always"
            >
              employee-bulk-import-sample.csv
            </Link>
          </Typography>
          {bulkImportFileName && (
            <Typography variant="caption">
              Selected file: {bulkImportFileName}
            </Typography>
          )}
          {bulkImportedEmployees.length > 0 && (
            <Typography variant="caption">
              Parsed rows: {bulkImportedEmployees.length}
            </Typography>
          )}
          {saveSummary && <Alert severity="success">{saveSummary}</Alert>}
          {saveErrors.length > 0 && (
            <Alert severity="error">
              {saveErrors.map((errorMessage) => (
                <Typography key={errorMessage} variant="body2">
                  {errorMessage}
                </Typography>
              ))}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <input
          ref={bulkImportInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          hidden
          onChange={handleBulkImportFileChange}
        />
        <Button
          variant="contained"
          startIcon={<UploadFile />}
          onClick={handleBulkImportClick}
        >
          Upload File
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          loading={isSaving}
          disabled={!bulkImportedEmployees.length}
        >
          Save
        </Button>
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
