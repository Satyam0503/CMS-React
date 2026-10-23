import { alpha, Stack, Typography, Box, Avatar } from "@mui/material";
import { CheckCircleOutlineRounded } from "@mui/icons-material";
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
import { useIsDark } from "../../theme/useIsDark";

export default function EmpOnLeave() {
  const isDark = useIsDark();
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
        <Stack className="mt-1" spacing={1.25}>
          {!leaveRequest.length ? (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                p: 1.5,
                borderRadius: "12px",
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.04)"
                  : "rgba(255, 255, 255, 0.65)",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: isDark
                  ? "none"
                  : "0 2px 6px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "8px",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: (theme) => alpha(theme.palette.success.main, 0.12),
                  border: "1px solid",
                  borderColor: (theme) => alpha(theme.palette.success.main, 0.28),
                  color: "success.main",
                  flexShrink: 0,
                }}
              >
                <CheckCircleOutlineRounded sx={{ fontSize: 20 }} />
              </Box>
              <Stack sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "text.primary" }}>
                  Full Team Available
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "text.secondary" }}>
                  {i({ id: "MESSAGE.NO_EMPLOYEE_ON_LEAVE" })}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Stack
              spacing={1.25}
              tabIndex={0}
              aria-label="Employees currently on leave"
              sx={{
                maxHeight: 270,
                overflowY: "auto",
                pr: 0.5,
                "&::-webkit-scrollbar": {
                  width: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#CBD5E1",
                  borderRadius: "999px",
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
