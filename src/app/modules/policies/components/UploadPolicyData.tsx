import { Add } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import dayjs, { Dayjs } from "dayjs";
import React, { useRef, useState } from "react";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

export default function UploadPolicyData() {
  const { formatMessage: i } = useIntl();
  const ValidFileExtension = ["docx", "doc", "txt"];
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  // const [workBookData, setWorkBookData] = useState<XLSX.WorkBook | null>(null);

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const fileList = e.target.files;
  //   if (fileList && fileList[0]) {
  //     const fileExt = fileList[0].name.split(".").pop()!;
  //     if (!ValidFileExtension.includes(fileExt)) {
  //       toast.error("VALIDATION_ERR.INVALID_FILE_TYPE");
  //       return;
  //     }
  //     // read file content
  //     const reader = new FileReader();
  //     reader.readAsArrayBuffer(fileList[0]);

  //     // handle Load event
  //     reader.onload = (e) => {
  //       const data = e.target?.result;
  //       if (data) {
  //         const workBook = XLSX.read(data);
  //         setWorkBookData(workBook);
  //         if (workBook.SheetNames.length > 0) {
  //           setSelectedWorkSheet(workBook.SheetNames[0]);
  //           setHTML(readWorkSheetObject(workBook.SheetNames[0], workBook));
  //           setOpen(true);
  //         }
  //       }
  //     };
  //   }
  // };

  const handleCloseModal = () => {
    setOpen(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    // setWorkBookData(null);
    // setSelectedWorkSheet(null);
    // setPayMonth(null);
  };

  return (
    <>
      <Button
        variant="contained"
        component="label"
        role="button"
        aria-label="import excel"
      >
        <CreateNewFolderIcon />
        {i({ id: "POLICIES.CREATE_FOLDER" })}
        <input
          hidden
          ref={inputRef}
          name="excel"
          type="file"
          accept=".docx,.doc ,.txt"
          id="payrollImport"
          // onChange={handleFileChange}
        />
      </Button>
      {open && (
        <CustomisedModal
          open={true}
          handleClose={handleCloseModal}
          title={i({ id: "PAYROLL.UPLOAD_EXCEL_DATA" })}
        >
          <Stack spacing={2}>
            <Stack>
              <Typography variant="h6">
                {i({ id: "PAYROLL.SELECT_SPREADSHEET" })}
              </Typography>
              <Stack className="overflow-x-scroll flex-row gap-2 justify-content-start py-2 position-sticky top-0">
                {/* {workBookData?.SheetNames.map((sheet, index) => (
                  <Button
                    key={index}
                    variant={
                      selectedWorkSheet === sheet ? "contained" : "outlined"
                    }
                    onClick={() => handleWorkSheetChange(sheet)}
                  >
                    {sheet}
                  </Button>
                ))} */}
              </Stack>
            </Stack>
            {/* <CustomisedDatePicker
              views={["month", "year"]}
              label={i({ id: "PAYROLL.SELECT_PAY_MONTH" })}
              value={paymonth}
              setValue={(date: Dayjs | null) => {
                setPayMonth(date);
              }}
              maxDate={dayjs().subtract(1, "month")}
            /> */}
            <Stack spacing={1}>
              <Typography className="fs-16">
                {i({ id: "PAYROLL.EXCEL_PREVIEW" })}
              </Typography>
              <Stack className="overflow-x-scroll excel-table">
                {/* <div dangerouslySetInnerHTML={{ __html }}></div> */}
              </Stack>
            </Stack>
            <Stack direction="row" className="justify-content-end gap-2">
              <CustomisedButton
                variant="outlined"
                label={i({ id: "BUTTON.CANCEL" })}
                handleClick={handleCloseModal}
              />
              <CustomisedButton
                label={i({ id: "BUTTON.UPDATE" })}
                // handleClick={handleUpdate}
              />
            </Stack>
          </Stack>
        </CustomisedModal>
      )}
    </>
  );
}
