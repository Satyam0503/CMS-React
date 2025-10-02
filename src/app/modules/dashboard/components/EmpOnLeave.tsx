import { Stack, Typography, Link, Box, Avatar } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomCard } from "../../../shared/components/CustomCard";
import { useEffect, useState } from "react";
import { LeaveRequestModel, LeaveRequestsFilter } from "../../leaves/model";
import dayjs from "dayjs";
import { LEAVE_REQUEST_STATUS } from "../../../../utils/enums";
import { getAllLeaveRequest } from "../../leaves/leaveServices";
import { dateFormatter } from "../../../../utils/common";
import { CardSkeleton } from "./CardSkeleton";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";

export default function EmpOnLeave() {
  const { formatMessage: i } = useIntl();
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequestModel[]>([]);
  const [isLoading, setLoading] = useState(true);
  const { currentLanguage } = useAppLang();
  const defaultLanguage = useAppSelector(state => state.user.userData?.defaultLanguage!);

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      const payload: LeaveRequestsFilter = {
        pageNo: 1,
        pageSize: 20,
        startDate: dayjs().startOf("day"),
        status: [LEAVE_REQUEST_STATUS.APPROVED]
      }
      try {
        const { data } = await getAllLeaveRequest(payload);
        if (data.success) {
          data.methodResults.sort((date1, date2) => dayjs(date1.startDate).diff(dayjs(date2.startDate)))
          setLeaveRequest(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
      finally {
        setLoading(false);
      }
    }
    fetchLeaveRequest();
  }, []);

  if (isLoading) {
    return <CardSkeleton />
  }
  return (
    <>
      <CustomCard label={i({ id: "TITLES.EMP_ON_LEAVE" })}>
        <Stack className="flex-grow-1 justify-content-between mt-4 gap-2" >
          {!leaveRequest.length ? (
            <Box component="div" className="flex-grow-1 align-content-center text-center">
              <Typography variant="h5">{i({ id: "MESSAGE.NO_EMPLOYEE_ON_LEAVE" })}</Typography>
            </Box>
          ) : (
            <Stack className="gap-3">
              {leaveRequest.slice(0, 5).map((leave) => {
                return (
                  <Stack
                    key={leave.leaveRequestId}
                    className="justify-content-between flex-row align-items-center"
                  >
                    <Stack className="justify-content-between flex-row gap-2  align-items-center" >
                      <Avatar
                        alt={leave.employeeName}
                        src={leave.profileUrl ?? DEFAULT_USER_AVATAR}
                        sx={{
                          width: 45,
                          height: 45,
                          fontSize: "1rem",
                        }}
                      />
                      <Stack>
                        <Typography variant="body1">{leave.employeeName}</Typography>
                        {
                          leave.jobRole &&
                          <Typography variant="body2">{leave.jobRole[currentLanguage] || leave.jobRole[defaultLanguage]}</Typography>
                        }
                      </Stack>
                    </Stack>

                    <Typography variant="subtitle2">
                      {
                        `${dayjs().isSame(leave.startDate, "day") ? i({ id: "DATETIME.TODAY" }) : dateFormatter(leave.startDate, "DD MMM")} - ${!leave.isHalfDay ? dateFormatter(leave.endDate, "DD MMM") : "H"}`
                      }
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Stack>
      </CustomCard>
    </>
  );
}
