import { Download, UploadFile } from "@mui/icons-material";
import { Alert, Button, Link, Stack, Tooltip, Typography } from "@mui/material"
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import * as XLSX from "xlsx";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { PayRollDataModel, PayRollRequestModel } from "../models";
import { uploadEmpPayRollData } from "../services";
import { sanitizeHtmlContent } from "../../../../utils/common";
import { payrollActionButtonSx } from "./payrollActionButtonSx";

const ValidFileExtension = ["xlsx", "xls"];
// Bonus, LTA, Other Allowance, Health Insurance, EPF, ESIC are optional - default to 0 if omitted
const requiredHeaders = ["Income Tax", "Basic Pay", "Employee Id", "HRA", "Loss of Pay", "Loss of Pay Days", "Paid Days", "Paid Date"];
// currency columns only - "Paid Days"/"Loss of Pay Days" are day counts, not money amounts
const moneyHeaders = ["Basic Pay", "Bonus", "HRA", "LTA", "Other Allowance", "Loss of Pay", "Income Tax", "Health Insurance", "EPF", "ESIC"];
const SAMPLE_FILE_URL = "/payroll-upload-sample.xlsx";

type KeyMappingType = {
    [index: string]: keyof PayRollDataModel;
};

type PropsType = {
    handlePageRefresh: () => void;
}

const keyMapper: KeyMappingType = {
    "Basic Pay": "basicPay",
    "Bonus": "bonus",
    "Employee Id": "employeeId",
    "Paid Date": "paidDate",
    "Loss of Pay": "lossOfPay",
    "Loss of Pay Days": "lossOfPayDays",
    "Other Allowance": "otherAllowance",
    "Paid Days": "paidDays",
    "HRA": "hra",
    "LTA": "lta",
    "Health Insurance": "healthInsurance",
    "Income Tax": "incomeTax",
    "EPF": "epf",
    "ESIC": "esic",
}

// case/whitespace-insensitive comparison, so "Loss Of Pay" and "loss of pay " both match "Loss of Pay"
const normalizeHeader = (value: unknown) =>
    typeof value === "string" ? value.replace(/\s+/g, " ").trim().toLowerCase() : "";

const normalizedKeyMapper: Record<string, keyof PayRollDataModel> = Object.fromEntries(
    Object.entries(keyMapper).map(([header, field]) => [normalizeHeader(header), field])
);

const readWorkSheetObject = (sheetName: string, workBook: XLSX.WorkBook | null) => {
    if (!(sheetName && workBook)) {
        return "";
    }
    const workSheet = workBook.Sheets[sheetName];
    return XLSX.utils.sheet_to_html(workSheet);
}

type HeaderValidationResult = {
    rowIndex: number;
    missingHeaders: string[];
};

// scans every row for one that contains all required headers (case-insensitive,
// extra columns like "Employee Name" are ignored); reports the closest match's
// missing headers so the UI can tell the user exactly what to fix before submitting.
// This is UX only - the backend re-validates independently so a direct API call
// (e.g. via Postman) can't bypass this check.
const validateHeaderRow = (sheet: XLSX.WorkSheet): HeaderValidationResult => {
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
    let best: HeaderValidationResult = { rowIndex: 0, missingHeaders: requiredHeaders };

    for (let i = 0; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (!row || row.length === 0) continue;
        const normalizedCells = row.map(normalizeHeader).filter(Boolean);
        if (normalizedCells.length === 0) continue;

        const missingHeaders = requiredHeaders.filter(
            header => !normalizedCells.includes(normalizeHeader(header))
        );

        if (missingHeaders.length === 0) {
            return { rowIndex: i, missingHeaders: [] };
        }
        if (missingHeaders.length < best.missingHeaders.length) {
            best = { rowIndex: i, missingHeaders };
        }
    }
    return best;
}

// rounds every money column's values to 2 decimal places in place, so the preview table
// and the submitted payload both reflect the same rounded numbers (fixes values like
// 416.6666666 coming from Excel formulas); backend re-rounds independently on save too
const roundSheetMoneyColumns = (sheet: XLSX.WorkSheet, headerRowIndex: number) => {
    const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
    const moneyColumns: number[] = [];

    for (let col = range.s.c; col <= range.e.c; col++) {
        const headerCell = sheet[XLSX.utils.encode_cell({ r: headerRowIndex, c: col })];
        if (headerCell && moneyHeaders.some(header => normalizeHeader(header) === normalizeHeader(headerCell.v))) {
            moneyColumns.push(col);
        }
    }

    if (moneyColumns.length === 0) return;

    for (let row = headerRowIndex + 1; row <= range.e.r; row++) {
        for (const col of moneyColumns) {
            const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
            if (cell && cell.t === "n" && typeof cell.v === "number") {
                const rounded = Math.round(cell.v * 100) / 100;
                cell.v = rounded;
                cell.w = rounded.toFixed(2);
            }
        }
    }
}

// map excel data to payload, matching each sheet column to its target field
// regardless of header casing/whitespace; unrecognised columns are ignored
const mapExcelRowtoPayLoad = (row: Record<string, unknown>): PayRollDataModel => {
    const mappedRow: Partial<PayRollDataModel> = {};

    for (const [cellHeader, value] of Object.entries(row)) {
        const targetKey = normalizedKeyMapper[normalizeHeader(cellHeader)];
        if (targetKey === "paidDate") {
            // a blank cell comes through as the sheet_to_json defval (0), not "" - treat that as
            // still-missing rather than converting it into the epoch date via dayjs(0), so the
            // backend's required-field check catches it instead of silently saving a bogus date
            if (value) {
                mappedRow.paidDate = dayjs(value as string | Date);
            }
        } else if (targetKey) {
            mappedRow[targetKey] = value as never;
        }
    }
    return mappedRow as PayRollDataModel;
};

export const UploadPayRollData = ({ handlePageRefresh }: PropsType) => {
    const { formatMessage: i } = useIntl();
    const [workBookData, setWorkBookData] = useState<XLSX.WorkBook | null>(null);
    const [open, setOpen] = useState(false);
    const [__html, setHTML] = useState("");
    const [selectedWorkSheet, setSelectedWorkSheet] = useState<string | null>(null);
    const [paymonth, setPayMonth] = useState<Dayjs | null>(null);
    const [missingHeaders, setMissingHeaders] = useState<string[]>([]);
    const [serverErrors, setServerErrors] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null)

    const handleCloseModal = () => {
        if (isUploading) {
            return;
        }
        setOpen(false);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        setWorkBookData(null);
        setSelectedWorkSheet(null);
        setPayMonth(null);
        setMissingHeaders([]);
        setServerErrors([]);
    }

    const validateWorkSheet = (sheetName: string, workBook: XLSX.WorkBook | null) => {
        if (!(sheetName && workBook)) {
            setMissingHeaders([]);
            return;
        }
        const sheet = workBook.Sheets[sheetName];
        const { rowIndex, missingHeaders } = validateHeaderRow(sheet);
        if (missingHeaders.length === 0) {
            roundSheetMoneyColumns(sheet, rowIndex);
        }
        setMissingHeaders(missingHeaders);
    }

    const handleWorkSheetChange = (sheetName: string) => {
        if (sheetName === selectedWorkSheet) {
            return;
        }
        setSelectedWorkSheet(sheetName);
        setServerErrors([]);
        validateWorkSheet(sheetName, workBookData);
        setHTML(readWorkSheetObject(sheetName, workBookData));
    }


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (fileList && fileList[0]) {
            const fileExt = fileList[0].name.split(".").pop()!;
            if (!ValidFileExtension.includes(fileExt)) {
                toast.error(i({ id: "VALIDATION_ERR.INVALID_FILE_TYPE" }))
                return;
            }
            // read file content
            const reader = new FileReader();
            reader.readAsArrayBuffer(fileList[0]);

            // handle Load event
            reader.onload = (e) => {
                const data = e.target?.result;
                if (data) {
                    const workBook = XLSX.read(data, { cellDates: true });
                    setWorkBookData(workBook)
                    if (workBook.SheetNames.length > 0) {
                        setSelectedWorkSheet(workBook.SheetNames[0]);
                        setServerErrors([]);
                        validateWorkSheet(workBook.SheetNames[0], workBook);
                        setHTML(readWorkSheetObject(workBook.SheetNames[0], workBook));
                        setOpen(true);
                    }
                }
            }
        }
    }


    const mapSheetDataToJson = (headerRowIndex: number) => {
        // create payload
        const payload: PayRollDataModel[] = [];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(workBookData!.Sheets[selectedWorkSheet!], { range: headerRowIndex, defval: 0 });
        if (jsonData.length === 0) return payload;
        return jsonData.map(row => mapExcelRowtoPayLoad(row));
    }

    const handleUpdate = async () => {
        if (paymonth === null) {
            toast.error(i({ id: "TOAST.FAILED.SELECT_PAY_MONTH" }))
            return;
        }
        if (!selectedWorkSheet) {
            return;
        }
        setServerErrors([]);
        const { rowIndex, missingHeaders } = validateHeaderRow(workBookData!.Sheets[selectedWorkSheet]);
        if (missingHeaders.length > 0) {
            setMissingHeaders(missingHeaders);
            return;
        }
        const jsonData = mapSheetDataToJson(rowIndex);
        if (jsonData.length === 0) {
            return;
        }
        const payload: PayRollRequestModel = {
            payMonth: paymonth,
            payData: jsonData
        }
        try {
            setIsUploading(true);
            // frontend check above is UX only (fast feedback + avoids a round trip);
            // the backend independently re-validates the same rules so a direct API
            // call (e.g. via Postman) bypassing this UI still gets rejected
            const { data } = await uploadEmpPayRollData(payload);
            if (data.success) {
                toast.success(i({ id: "TOAST.SUCCESS.DATA_UPLOADED" }));
                setIsUploading(false);
                handleCloseModal();
                handlePageRefresh();
            } else if (data.methodResults?.length) {
                setServerErrors(data.methodResults);
            } else {
                toast.error(data.message || i({ id: "ERROR.500" }))
            }
        } catch (error) {
            toast.error(i({ id: "ERROR.500" }))
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <>
            <Stack direction="row" spacing={1} className="align-items-center">
                <Tooltip title={i({ id: "PAYROLL.IMPORT_EXCEL" })} arrow placement="top">
                    <Button variant="outlined" component="label" role="button" aria-label={i({ id: "PAYROLL.IMPORT_EXCEL" })} sx={payrollActionButtonSx}>
                        <UploadFile fontSize="small" />
                        <input
                            hidden
                            ref={inputRef}
                            name="excel"
                            type="file"
                            accept=".xlsx,.xls"
                            id="payrollImport"
                            onChange={handleFileChange}
                        />
                    </Button>
                </Tooltip>
                <Tooltip title={i({ id: "PAYROLL.DOWNLOAD_SAMPLE_FILE" })} arrow placement="top">
                    <Button component="a" href={SAMPLE_FILE_URL} download variant="outlined" aria-label={i({ id: "PAYROLL.DOWNLOAD_SAMPLE_FILE" })} sx={payrollActionButtonSx}>
                        <Download fontSize="small" />
                    </Button>
                </Tooltip>
            </Stack>
            {
                open && <CustomisedModal open={true} handleClose={handleCloseModal}
                    title={i({ id: "PAYROLL.UPLOAD_EXCEL_DATA" })}
                    allowMaximize
                >
                    <Stack spacing={2}>
                        <Stack>
                            <Typography variant="h6">{i({ id: "PAYROLL.SELECT_SPREADSHEET" })}</Typography>
                            <Stack className="overflow-x-scroll flex-row gap-2 justify-content-start py-2 position-sticky top-0">
                                {
                                    workBookData?.SheetNames.map((sheet, index) =>
                                        <Button key={index} variant={selectedWorkSheet === sheet ? "contained" : "outlined"} onClick={() => handleWorkSheetChange(sheet)}>{sheet}</Button>
                                    )
                                }
                            </Stack>
                        </Stack>
                        <CustomisedDatePicker
                            views={["month", "year"]}
                            label={i({ id: "PAYROLL.SELECT_PAY_MONTH" })}
                            value={paymonth}
                            setValue={(date: Dayjs | null) => {
                                setPayMonth(date);
                            }}
                            maxDate={dayjs().subtract(1, "month")}
                        />
                        {
                            missingHeaders.length > 0 &&
                            <Alert severity="error">
                                <Typography variant="body2" className="fw-bold">{i({ id: "PAYROLL.MISSING_COLUMNS_TITLE" })}</Typography>
                                <Typography variant="body2">{missingHeaders.join(", ")}</Typography>
                                <Typography variant="body2">
                                    {i({ id: "PAYROLL.MISSING_COLUMNS_HINT" })}{" "}
                                    <Link href={SAMPLE_FILE_URL} download>{i({ id: "PAYROLL.DOWNLOAD_SAMPLE_FILE" })}</Link>
                                </Typography>
                            </Alert>
                        }
                        {
                            missingHeaders.length === 0 && serverErrors.length > 0 &&
                            <Alert severity="error">
                                <Typography variant="body2" className="fw-bold">{i({ id: "PAYROLL.UPLOAD_ERRORS_TITLE" })}</Typography>
                                {
                                    serverErrors.map((errorMessage, index) =>
                                        <Typography key={index} variant="body2">{errorMessage}</Typography>
                                    )
                                }
                            </Alert>
                        }
                        <Stack spacing={1}>
                            <Typography className="fs-16" >{i({ id: "PAYROLL.EXCEL_PREVIEW" })}</Typography>
                            <Stack className="overflow-x-scroll excel-table">
                                <div dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(__html) }}></div>
                            </Stack>
                        </Stack>
                        <Stack direction="row" className="justify-content-end gap-2">
                            <CustomisedButton variant="outlined" label={i({ id: "BUTTON.CANCEL" })} handleClick={handleCloseModal} disabled={isUploading} />
                            <CustomisedButton label={i({ id: "BUTTON.UPDATE" })} handleClick={handleUpdate} disabled={missingHeaders.length > 0} loading={isUploading} />
                        </Stack>
                    </Stack>
                </CustomisedModal>
            }
        </>

    )
}
