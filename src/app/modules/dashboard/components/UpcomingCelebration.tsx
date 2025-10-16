import { Stack, Typography, Avatar, Box, Link, Card } from "@mui/material";
import { useIntl } from "react-intl";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { dateFormatter } from "../../../../utils/common";
import { CustomCard } from "../../../shared/components/CustomCard";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { getAllEmployees } from "../../employees/employeeServices";
import { CardSkeleton } from "./CardSkeleton";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";
import { DEFAULT_USER_AVATAR } from "../../../../utils/constant/Constant";
import { UpcomingCelebration } from "../model";
import { getUpcomingCelebration } from "../dashboardservices";

export const isSameDate = (date: Dayjs) => {
  const currentDateofMonth = dayjs().date();
  const currentMonth = dayjs().month();
  if (currentDateofMonth === date.date() && currentMonth === date.month()) {
    return true;
  } else {
    return false;
  }
};

const getUpcomingBirthDays = (empList: GetAllEmployeeResponseModel[]) => {
  const sortedEmployee = empList.filter(emp => emp.dateOfBirth != null)
    .map((emp) => {
      let birthDayThisYear = dayjs(emp.dateOfBirth).set("year", dayjs().get("year"));
      if (birthDayThisYear.isBefore(dayjs(), "day")) {
        birthDayThisYear = birthDayThisYear.add(1, "year");
      }
      return {
        ...emp,
        birthDayThisYear,
      };
    })
    .sort((emp1, emp2) => {
      return emp1?.birthDayThisYear.diff(emp2?.birthDayThisYear);
    });
  return sortedEmployee
}

export const UpComingCelebration = () => {
  const { formatMessage: i } = useIntl();
  const [data, setData] = useState<UpcomingCelebration>({ birthday: [], workAnniversary: [] });
  const [isLoading, setLoading] = useState(true);
  const { currentLanguage } = useAppLang();
  const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage!);

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
                        <Stack className="justify-content-between flex-row gap-2  align-items-center" >
                          <Avatar
                            alt={emp.employeeName}
                            src={emp.profileUrl ?? DEFAULT_USER_AVATAR}
                            sx={{
                              width: 45,
                              height: 45,
                              fontSize: "1rem",
                            }}
                          />
                          <Stack>
                            <Typography variant="body1">{emp.employeeName}</Typography>
                            <Typography variant="body2">
                              {
                                emp.jobRole == null ? i({ id: "NOT_AVAILABLE" }) : emp.jobRole[currentLanguage] || emp.jobRole[defaultLang]
                              }
                            </Typography>
                          </Stack>
                        </Stack>
                        <Typography variant="subtitle2">
                          {!isSameDate(dayjs(emp.date))
                            ? dateFormatter(emp.date, "DD MMM YYYY")
                            : i({ id: "DATETIME.TODAY" })}
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
                        className="justify-content-between flex-row align-items-center p-2 rounded hover-secondary"
                      >
                        <Stack className="justify-content-between flex-row gap-2  align-items-center" >
                          <Avatar
                            alt={emp.employeeName}
                            src={emp.profileUrl ?? DEFAULT_USER_AVATAR}
                            sx={{
                              width: 45,
                              height: 45,
                              fontSize: "1rem",
                            }}
                          />
                          <Stack>
                            <Typography variant="body1">{emp.employeeName}</Typography>
                            <Typography variant="body2">
                              {
                                emp.jobRole == null ? i({ id: "NOT_AVAILABLE" }) : emp.jobRole[currentLanguage] || emp.jobRole[defaultLang]
                              }
                            </Typography>
                          </Stack>
                        </Stack>
                        <Typography variant="subtitle2">
                          {!isSameDate(dayjs(emp.date))
                            ? dateFormatter(emp.date, "DD MMM YYYY")
                            : i({ id: "DATETIME.TODAY" })}
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
