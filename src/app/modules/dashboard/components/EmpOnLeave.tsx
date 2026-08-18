import { Stack, Typography, Box, Avatar } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomCard } from "../../../shared/components/C_Card";
import { useEffect, useState } from "react";
import { GetLeaveRequestPayLoad, LeaveRequestModel } from "../../leaves/model";
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
  const defaultLanguage = useAppSelector(
    (state) => state.user.userData?.defaultLanguage ?? ""
  );

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      const payload: GetLeaveRequestPayLoad = {
        pageNo: 1,
        pageSize: 20,
        startDate: dayjs().startOf("day"),
        status: LEAVE_REQUEST_STATUS.APPROVED,
        endDate: null,
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
      <CustomCard
        label={i({ id: "TITLES.EMP_ON_LEAVE" })}
        applyMinHeight={false}
      >
        <Stack className="mt-3" spacing={1.25}>
          {!leaveRequest.length ? (
            <Box component="div" sx={{ minHeight: 112, display: "grid", placeItems: "center" }}>
              <Typography className="text-center">{i({ id: "MESSAGE.NO_EMPLOYEE_ON_LEAVE" })}</Typography>
            </Box>
          ) : (
            <Stack
              spacing={1.25}
              tabIndex={0}
              aria-label="Employees currently on leave"
              sx={{
                maxHeight: 270,
                overflowY: "auto",
                pr: 0.75,
                mr: -0.75,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { width: 0 },
                "&:hover, &:focus, &:focus-within": {
                  scrollbarWidth: "thin",
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "color-mix(in srgb, var(--mui-palette-primary-main) 42%, transparent)",
                    borderRadius: 99,
                  },
                },
              }}
            >
              {leaveRequest.map((leave) => {
                return (
                  <Stack
                    key={leave.leaveRequestId}
                    className="justify-content-between flex-row align-items-center gap-2 p-1 rounded hover-secondary"
                  >
                    <Stack className="justify-content-between flex-row gap-2 align-items-center" sx={{ minWidth: 0 }}>
                      <Avatar
                        alt={leave.employeeName}
                        src={leave.profileUrl ?? DEFAULT_USER_AVATAR}
                        sx={{
                          width: 45,
                          height: 45,
                          fontSize: 20,
                          backgroundColor: "secondary.main",
                        }}
                      />
                      <Stack sx={{ minWidth: 0 }}>
                        <Typography variant="body1" noWrap>{leave.employeeName}</Typography>
                        {
                          leave.jobRole &&
                          <Typography variant="body2">{leave.jobRole[currentLanguage] || leave.jobRole[defaultLanguage]}</Typography>
                        }
                      </Stack>
                    </Stack>

                    <Typography variant="subtitle2" sx={{ flexShrink: 0, whiteSpace: "nowrap", color: "primary.main" }}>
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
