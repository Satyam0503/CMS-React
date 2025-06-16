import { Card, Grid, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";

import { useIntl } from "react-intl";
import {
  Add,
  Business,
  CalendarToday,
  DeleteOutline,
  Edit,
  LocationOn,
} from "@mui/icons-material";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { AddUpdateWorkHistory } from "./components/AddUpdateWorkHistory";
import { WorkHistoryModel } from "../models";
import { getWorkHistory } from "../userservices";
import { useParams } from "react-router-dom";
import { dateFormatter } from "../../../../utils/common";
import dayjs, { Dayjs } from "dayjs";


const countTotalExperience = (fromDate: Dayjs | null, toDate: Dayjs | null) => {
  if (!toDate) {
    toDate = dayjs();
  }
  const totalMonths = dayjs(toDate).diff(fromDate, "months");
  console.log(totalMonths);

  if (totalMonths <= 0) {
    return "";
  }
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [];

  if (years > 0) {
    parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  }
  return parts.length > 0 ? parts.join(' ') : '0 months';
}

const initialValues: WorkHistoryModel = {
  workHistoryId: "",
  userId: "",
  organisationName: "",
  startDate: null,
  endDate: null,
  jobLocation: "",
  jobRole: "",
};


export const WorkHistory = () => {
  const { formatMessage } = useIntl();
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [workHistoryList, setWorkHistoryList] = useState<WorkHistoryModel[]>([]);
  const [initialWorkHistoryValue, setInitialWorkHistoryValue] = useState<WorkHistoryModel>(initialValues);
  const [isEdit, setEdit] = useState(false);
  const employeeId = useParams().employeeid;


  const handleClose = () => {
    setOpen(false);
    setEdit(false);
    setInitialWorkHistoryValue(initialValues);
  }
  const handleRefresh = () => {
    setRefresh(!refresh);
  }
  const handleEdit = (item: WorkHistoryModel) => {
    setOpen(true);
    setInitialWorkHistoryValue(item)
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getWorkHistory(employeeId ?? "");
        if (data.success) {
          setWorkHistoryList(data.methodResults);
        }
        else {
          console.log("failed to fetch Work History");
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [refresh])

  return (
    <>
      <Card sx={{ p: 2, }}>
        <Stack
          direction={"row"}
          className="justify-content-between"
        >
          <Typography variant="h5">
            {formatMessage({ id: "MENU.WORK_HISTORY" })}
          </Typography>
          <CustomIconButton icon={<Add />} tooltip={formatMessage({ id: "BUTTON.ADD" })} handleClick={() => setOpen(true)} />
        </Stack>
        <Stack spacing={2} sx={{ my: 1 }} >
          {
            workHistoryList.length > 0 ?
              workHistoryList.map(item =>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    "&:hover .MuiStack-root": {
                      visibility: "visible",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} className="align-items-center">
                    <Stack
                      sx={{
                        minWidth: 52,
                        height: 52,
                        bgcolor: "primary.lighter",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                      }}
                    >
                      <Business fontSize="large" color="primary" />
                    </Stack>

                    <Stack>
                      <Typography variant="body1">
                        {item.organisationName}
                      </Typography>
                      <Typography variant="body2">
                        {item.jobRole}
                      </Typography>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={{ xs: 0.5, sm: 2 }}
                      >
                        <Stack direction="row" className="align-items-center">
                          <LocationOn fontSize="small" className="mx-1" />
                          <Typography variant="body2" className="fw-bold"> {item.jobLocation}</Typography>
                        </Stack>
                        <Stack direction="row" >
                          <CalendarToday fontSize="small" className="mx-1" />
                          <Typography variant="body2" sx={{ color: "text.primary" }}>
                            {dateFormatter(item.startDate, "MMM YYYY")}
                            {" - "}
                            {item.endDate ? dateFormatter(item.endDate, "MMM YYYY") : formatMessage({ id: "WORKING.CURRENT" })}
                            {" "}
                            ({countTotalExperience(item.startDate, item.endDate)})
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack
                    direction={"row"}
                    sx={{
                      gap: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      visibility: "hidden",
                      transition: "visibility 0.3s ease-in-out",
                    }}
                  >
                    <CustomIconButton icon={<Edit />} tooltip="Edit" handleClick={() => handleEdit(item)} />
                    <CustomIconButton icon={<DeleteOutline />} tooltip="Delete" handleClick={() => setEdit(true)} />
                  </Stack>
                </Stack>
              )
              :
              <Typography>No Working History</Typography>
          }
        </Stack>
      </Card>
      {
        open && <AddUpdateWorkHistory refresh={handleRefresh} isEdit={isEdit} initialValues={initialWorkHistoryValue} open={open} handleClose={handleClose} />
      }
    </>
  );
};
