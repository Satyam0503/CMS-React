import { Stack, Typography, Avatar, Box, Card } from "@mui/material";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { dateFormatter, getOrdinalSuffix } from "../../../../utils/common";
import { CardSkeleton } from "./CardSkeleton";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import { UpcomingCelebration } from "../model";
import { getUpcomingCelebration } from "../dashboardservices";

export const UpComingCelebration = () => {
  const { formatMessage: i } = useIntl();
  const [data, setData] = useState<UpcomingCelebration>({ birthday: [], workAnniversary: [] });
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getUpcomingCelebration();
        if (data.success) {
          setData(data.methodResult);
        }
      } catch (error) {
        console.log(error);
      }
      finally {
        setLoading(false);
      }
    })();
  }, [])

  if (isLoading) {
    return <CardSkeleton />
  }

  return (
    <Card className="p-4" sx={{ minHeight: 280 }}>
      {
        data.birthday.length == 0 && data.workAnniversary.length == 0 ?
          <Box component="div" className="h-100 align-content-center text-center">
            <Typography className="fs-16">{i({ id: "TITLES.NO_UPCOMING_CELEBRATION" })}</Typography>
          </Box>
          :
          <Stack spacing={2.5}>
            {
              data.birthday.length > 0 &&
              <Box>
                <Typography className="fw-bold fs-16 mb-3">{i({ id: "TITLES.UPCOMING_BIRTHDAY" })} 🎂</Typography>
                <Stack >
                  {data.birthday.map((emp) => {
                    return (
                      <Stack
                        key={emp.employeeId}
                        className="justify-content-between flex-row align-items-center p-2 rounded hover-secondary"
                      >
                        <Stack className="justify-content-between flex-row gap-2" >
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
                            <Typography className="fw-bold">{emp.employeeName}</Typography>
                            <Typography className="info rounded fw-bold text-center px-2 fs-12" sx={{ paddingBlock: "1px" }}>
                              {getOrdinalSuffix(emp.ordinal) + " " + i({ id: "TITLES.BIRTHDAY" })}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Typography variant="subtitle2" >
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
                        <Stack className="justify-content-between flex-row gap-2 " >
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
                            <Typography className="fw-bold">{emp.employeeName}</Typography>
                            <Typography className="success rounded fw-bold text-center px-2 fs-12 text-nowrap" sx={{ paddingBlock: "1px" }}>
                              {getOrdinalSuffix(emp.ordinal) + " " + i({ id: "TITLES.WORK_ANNIVERSARY" })}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Typography variant="subtitle2" >
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
