import { Box, Card, Divider, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { IntlShape, useIntl } from "react-intl";

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
import { deleteEmployeeWorkHistory, getWorkHistory } from "../userservices";
import { useParams } from "react-router-dom";
import { dateFormatter, hasModuleFeaturePermission } from "../../../../utils/common";
import dayjs, { Dayjs } from "dayjs";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";
import { toast } from "react-toastify";
import { useAppSelector } from "../../../Redux/hooks";
import { ModulesName, Permission } from "../../../../utils/enums";
import { ListSkeleton } from "../about/components/ListSkeleton";


const countTotalExperience = (fromDate: Dayjs | null, toDate: Dayjs | null, intl: IntlShape) => {
  if (!toDate) {
    toDate = dayjs();
  }
  const totalMonths = dayjs(toDate).diff(fromDate, "months") + 1;

  if (totalMonths <= 0) {
    return "";
  }
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return intl.formatMessage({ id: "PROFILE.PI.EXPERIENCE_TEXT" }, { years, months });
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
  const intl = useIntl();
  const { formatMessage: i } = intl;
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [workHistoryList, setWorkHistoryList] = useState<WorkHistoryModel[]>([]);
  const [initialWorkHistoryValue, setInitialWorkHistoryValue] = useState<WorkHistoryModel>(initialValues);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [isEdit, setEdit] = useState(false);
  const employeeId = useParams().employeeid;
  const userModulesPermissions = useAppSelector(state => state.user.userData?.modulePermission) || [];
  const hasEditPermission = !employeeId || hasModuleFeaturePermission(ModulesName.Employees, Permission.Create, userModulesPermissions);
  const [isLoading, setLoading] = useState(true);

  const handleClose = () => {
    setOpen(false);
    setEdit(false);
    setInitialWorkHistoryValue(initialValues);
  }

  const handleConfirmationClose = () => {
    setSelectedWorkId(null);
  }
  const handleRefresh = () => {
    setRefresh(!refresh);
  }

  const handleWorkHistoryEdit = (item: WorkHistoryModel) => {
    setInitialWorkHistoryValue(item)
    setEdit(true);
    setOpen(true);
  }

  const handleWorkHistoryDelete = async (res: string) => {
    if (res == "ok" && selectedWorkId) {
      try {
        const { data } = await deleteEmployeeWorkHistory(selectedWorkId, employeeId);
        if (!data.success) {
          toast.success(i({ id: "TOAST.FAILED.DELETE" }))
        }
        toast.success(i({ id: "TOAST.SUCCESS.DELETE" }))
        handleRefresh();
        handleConfirmationClose();
      } catch (error) {
        console.log(i({ id: "TOAST.SUCCESS.DELETE" }));
      }
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getWorkHistory(employeeId ?? "");
        if (data.success) {
          setWorkHistoryList(data.methodResults);
        }
      } catch {
        console.log("failed to fetch Work History");
      }
      finally {
        setLoading(false);
      }
    })();
  }, [employeeId, refresh])

  if (isLoading) {
    return <ListSkeleton />
  }

  return (
    <>
      <Card sx={{ p: 2 }}>
        <Stack
          direction="row"
          className="justify-content-between mb-4"
        >
          <Typography variant="h5">
            {i({ id: "WORKHISTORY.TITLE" })}
          </Typography>
          {
            hasEditPermission &&
            <CustomIconButton icon={<Add />} tooltip={i({ id: "BUTTON.ADD" })} handleClick={() => setOpen(true)} />
          }
        </Stack>
        <Stack spacing={2.5}>
          {
            workHistoryList.length > 0 ?
              workHistoryList.map(item =>
                <Stack
                  key={item.workHistoryId}
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
                        width: 58,
                        height: 58,
                        bgcolor: "primary.lighter",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                      }}
                    >
                      <Business className="fs-32" color="primary" />
                    </Stack>

                    <Stack>
                      <Typography >
                        {item.organisationName}
                      </Typography>
                      <Stack>
                        <Stack direction="row" spacing={1} >
                          <Typography variant="body1">
                            {item.jobRole}
                          </Typography>
                          <Divider orientation="vertical" variant="middle" flexItem sx={{ borderColor: "text.primary" }} />
                          <Stack direction="row" className="align-items-center gap-1">
                            <LocationOn className="fs-16" />
                            <Typography > {item.jobLocation}</Typography>
                          </Stack>
                        </Stack>
                        <Stack direction="row" className="align-items-center gap-1">
                          <CalendarToday className="fs-12" />
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {dateFormatter(item.startDate, "MMM YYYY")}
                            {" - "}
                            {item.endDate ? dateFormatter(item.endDate, "MMM YYYY") : i({ id: "WORKING.CURRENT" })}
                            {" | "}
                            {countTotalExperience(item.startDate, item.endDate, intl)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack direction="row"
                    sx={{
                      gap: .5,
                      alignItems: "center",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      visibility: "hidden",
                      transition: "visibility 0.3s ease-in-out",
                    }}
                  >
                    {
                      hasEditPermission &&
                      <>
                        <CustomIconButton icon={<Edit />} tooltip={i({ id: "BUTTON.EDIT" })} handleClick={() => handleWorkHistoryEdit(item)} />
                        <CustomIconButton icon={<DeleteOutline />} tooltip={i({ id: "BUTTON.DELETE" })} handleClick={() => setSelectedWorkId(item.workHistoryId)} />
                      </>
                    }
                  </Stack>
                </Stack>
              )
              :
              <Box component="div" className="text-center align-content-center" sx={{ height: 200 }}>
                <Typography variant="h6">{i({ id: "WORKHISTORY.NONE" })}</Typography>
              </Box>
          }
        </Stack>
      </Card>
      {
        open && <AddUpdateWorkHistory refresh={handleRefresh} isEdit={isEdit} initialValues={initialWorkHistoryValue} open={open} handleClose={handleClose} />
      }
      {
        selectedWorkId &&
        <ConfirmationModal
          open={true}
          title={i({ id: "CONFIRMATION.TITLE.DELETE_WORK_HISTORY" })}
          content={i({ id: "CONFIRMATION.CONTENT.DELETE_WORK_HISTORY" })}
          handleClose={handleConfirmationClose}
          handleConfirmation={handleWorkHistoryDelete}
        />
      }
    </>
  );
};
