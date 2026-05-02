import { Add } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material"
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

const ValidFileExtension = ["xlsx", "xls"];
const requiredHeaders = ["Income Tax", "Basic Pay", "Bonus", "Employee Id", "HRA", "Health Insurance", "LTA", "Loss of Pay", "Loss of Pay Days", "Other Allowance", "Paid Days"];

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
    "Loss of Pay": "lossOfPay",
    "Loss of Pay Days": "lossOfPayDays",
    "Other Allowance": "otherAllowance",
    "Paid Days": "paidDays",
    "HRA": "hra",
    "LTA": "lta",
    "Health Insurance": "healthInsurance",
    "Income Tax": "incomeTax",
}

const readWorkSheetObject = (sheetName: string, workBook: XLSX.WorkBook | null) => {
    if (!(sheetName && workBook)) {
        return "";
    }
    const workSheet = workBook.Sheets[sheetName];
    return XLSX.utils.sheet_to_html(workSheet);
}


const detectHeaderRow = (sheet: XLSX.WorkSheet) => {
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    for (let i = 0; i < sheetData.length; i++) {
        const row = sheetData[i] as unknown[];
        // Check if the row contains string values (likely column headers)
        if (row && row.length > 0 && Object.values(row).every(cell => typeof cell === 'string' && cell.trim() !== '')) {
            const isValidHeaders = (row as string[]).every(cell => requiredHeaders.includes(cell));
            if (isValidHeaders) {
                return i;
            }
        }
    }
    throw new Error();
}

// map excel data to payload 
const mapExcelRowtoPayLoad = (row: any): PayRollDataModel => {
    const mappedRow: Partial<PayRollDataModel> = {};

    for (const [sourceKey, targetKey] of Object.entries(keyMapper)) {
        mappedRow[targetKey as keyof PayRollDataModel] = row[sourceKey];
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
    const inputRef = useRef<HTMLInputElement>(null)

    const handleCloseModal = () => {
        setOpen(false);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        setWorkBookData(null);
        setSelectedWorkSheet(null);
        setPayMonth(null);
    }

    const handleWorkSheetChange = (sheetName: string) => {
        if (sheetName === selectedWorkSheet) {
            return;
        }
        setSelectedWorkSheet(sheetName);
        setHTML(readWorkSheetObject(sheetName, workBookData));
    }


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (fileList && fileList[0]) {
            const fileExt = fileList[0].name.split(".").pop()!;
            if (!ValidFileExtension.includes(fileExt)) {
                toast.error("VALIDATION_ERR.INVALID_FILE_TYPE")
                return;
            }
            // read file content
            const reader = new FileReader();
            reader.readAsArrayBuffer(fileList[0]);

            // handle Load event
            reader.onload = (e) => {
                const data = e.target?.result;
                if (data) {
                    const workBook = XLSX.read(data);
                    setWorkBookData(workBook)
                    if (workBook.SheetNames.length > 0) {
                        setSelectedWorkSheet(workBook.SheetNames[0]);
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
        const jsonData = XLSX.utils.sheet_to_json(workBookData!.Sheets[selectedWorkSheet!], { range: headerRowIndex, defval: 0 });
        if (jsonData.length === 0) return payload;
        return jsonData.map(row => mapExcelRowtoPayLoad(row));
    }

    const handleUpdate = async () => {
        try {
            if (paymonth === null) {
                toast.error(i({ id: "TOAST.FAILED.SELECT_PAY_MONTH" }))
                return;
            }
            if (selectedWorkSheet) {
                const headerRow = detectHeaderRow(workBookData!.Sheets[selectedWorkSheet]);
                const jsonData = mapSheetDataToJson(headerRow);
                if (jsonData.length === 0) {
                    return;
                }
                const payload: PayRollRequestModel = {
                    payMonth: paymonth,
                    payData: jsonData
                }
                const { data } = await uploadEmpPayRollData(payload);
                if (data.success) {
                    toast.success(i({ id: "TOAST.SUCCESS.DATA_UPLOADED" }));
                    handleCloseModal();
                    handlePageRefresh();
                } else {
                    toast.error(i({ id: "ERROR.500" }))
                }
            }
        } catch (error) {
            toast.error(i({ id: "VALIDATION_ERR.REQ_ALL_COLUMN" }))
        }
    }

    return (
        <>
            <Button variant="contained" component="label" role="button" aria-label="import excel" >
                <Add />
                {i({ id: "PAYROLL.IMPORT_EXCEL" })}
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
            {
                open && <CustomisedModal open={true} handleClose={handleCloseModal}
                    title={i({ id: "PAYROLL.UPLOAD_EXCEL_DATA" })}
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
                        <Stack spacing={1}>
                            <Typography className="fs-16" >{i({ id: "PAYROLL.EXCEL_PREVIEW" })}</Typography>
                            <Stack className="overflow-x-scroll excel-table">
                                <div dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(__html) }}></div>
                            </Stack>
                        </Stack>
                        <Stack direction="row" className="justify-content-end gap-2">
                            <CustomisedButton variant="outlined" label={i({ id: "BUTTON.CANCEL" })} handleClick={handleCloseModal} />
                            <CustomisedButton label={i({ id: "BUTTON.UPDATE" })} handleClick={handleUpdate} />
                        </Stack>
                    </Stack>
                </CustomisedModal>
            }
        </>

    )
}