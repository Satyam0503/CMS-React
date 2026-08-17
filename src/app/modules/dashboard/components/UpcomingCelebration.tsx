import { Stack, Typography, Avatar, Box, Card } from "@mui/material";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { dateFormatter, getOrdinalSuffix } from "../../../../utils/common";
import { CardSkeleton } from "./CardSkeleton";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import { UpcomingCelebration } from "../model";
import { useUpcomingCelebrationsQuery } from "../dashboardQueries";

export const UpComingCelebration = () => {
  const { formatMessage: i } = useIntl();
  const { data: response, isPending: isLoading } = useUpcomingCelebrationsQuery();
  const data: UpcomingCelebration = response?.success
    ? response.methodResult
    : { birthday: [], workAnniversary: [] };

  if (isLoading) {
    return <CardSkeleton />
  }

  return (
    <Card sx={{ p: { xs: 2, sm: 2.5 }, minHeight: 0 }}>
      {
        data.birthday.length == 0 && data.workAnniversary.length == 0 ?
          <Box component="div" sx={{ minHeight: 160, display: "grid", placeItems: "center" }}>
            <Typography className="fs-16">{i({ id: "TITLES.NO_UPCOMING_CELEBRATION" })}</Typography>
          </Box>
          :
          <Stack
            spacing={2.5}
            tabIndex={0}
            aria-label="Upcoming birthdays and work anniversaries"
            sx={{
              maxHeight: { xs: 380, lg: 460 },
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
            {
              data.birthday.length > 0 &&
              <Box>
                <Typography className="fw-bold fs-16 mb-3">{i({ id: "TITLES.UPCOMING_BIRTHDAY" })} 🎂</Typography>
                <Stack >
                  {data.birthday.map((emp) => {
                    return (
                      <Stack
                        key={emp.employeeId}
                        className="justify-content-between flex-row align-items-center p-2 rounded hover-secondary gap-2"
                      >
                        <Stack className="justify-content-between flex-row gap-2" sx={{ minWidth: 0 }}>
                          <Avatar
                            alt={emp.employeeName}
                            src={emp.profileUrl ?? DEFAULT_USER_AVATAR}
                            sx={{
                              width: 48,
                              height: 48,
                              fontSize: "1rem",
                            }}
                          />
                          <Stack spacing={.2} sx={{ justifyContent: "space-evenly" }}>
                            <Typography className="fw-bold" noWrap>{emp.employeeName}</Typography>
                            <Typography className="info rounded fw-bold text-center px-2 fs-12" sx={{ paddingBlock: "1px" }}>
                              {getOrdinalSuffix(emp.ordinal) + " " + i({ id: "TITLES.BIRTHDAY" })}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Typography variant="subtitle2" sx={{ flexShrink: 0, whiteSpace: "nowrap", color: "primary.main" }}>
                          {
                            dayjs().isSame(dayjs(emp.date), "day")
                              ? i({ id: "DATETIME.TODAY" })
                              : dateFormatter(emp.date, "DD MMM YYYY")
                          }
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            }
            {
              data.workAnniversary.length > 0 &&
              <Box>
                <Typography className="fw-bold fs-16 mb-3">{i({ id: "TITLES.UPCOMING_WORK_ANNIVERSARY" })} 🎉</Typography>
                <Stack >
                  {data.workAnniversary.map((emp) => {
                    return (
                      <Stack
                        key={emp.employeeId}
                        className="justify-content-between flex-row align-items-center p-2 rounded hover-secondary gap-2"
                      >
                        <Stack className="justify-content-between flex-row gap-2" sx={{ minWidth: 0 }}>
                          <Avatar
                            alt={emp.employeeName}
                            src={emp.profileUrl ?? DEFAULT_USER_AVATAR}
                            sx={{
                              width: 48,
                              height: 48,
                              fontSize: "1rem",
                            }}
                          />
                          <Stack spacing={.2} sx={{ justifyContent: "space-evenly" }}>
                            <Typography className="fw-bold" noWrap>{emp.employeeName}</Typography>
                            <Typography className="success rounded fw-bold text-center px-2 fs-12 text-nowrap" sx={{ paddingBlock: "1px" }}>
                              {getOrdinalSuffix(emp.ordinal) + " " + i({ id: "TITLES.WORK_ANNIVERSARY" })}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Typography variant="subtitle2" sx={{ flexShrink: 0, whiteSpace: "nowrap", color: "primary.main" }}>
                          {dayjs().isSame(dayjs(emp.date), "day")
                            ? i({ id: "DATETIME.TODAY" })
                            : dateFormatter(emp.date, "DD MMM YYYY")}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            }
          </Stack>
      }
    </Card>
  );
}
