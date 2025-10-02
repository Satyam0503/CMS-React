import { Stack, Typography, Avatar, Box, Link } from "@mui/material";
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

export default function UpcomingBirthday() {
  const { formatMessage: i } = useIntl();
  const [employees, setEmployees] = useState<GetAllEmployeeResponseModel[]>([]);
  const [isLoading, setLoading] = useState(true);
  const { currentLanguage } = useAppLang();
  const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage!);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllEmployees(null);
        if (data.success) {
          setEmployees(data.methodResults);
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
    <>
      <CustomCard label={i({ id: "TITLES.UPCOMING_BIRTHDAY" })}>
        <Stack className="flex-grow-1 justify-content-between mt-4" >
          {!employees.length ? (
            <Box component="div" className="flex-grow-1 align-content-center text-center"
            >
              <Typography variant="h5"> {i({ id: "MESSAGE.NO_EMPLOYEE" })}</Typography>
            </Box>
          ) : (
            <Stack className="gap-3">
              {getUpcomingBirthDays(employees).slice(0, 3).map((emp) => {
                return (
                  <Stack
                    key={emp.userId}
                    className="justify-content-between flex-row align-items-center"
                  >
                    <Stack className="justify-content-between flex-row gap-2  align-items-center" >
                      <Avatar
                        alt={emp.fullName}
                        src={emp.fullProfileUrl ?? DEFAULT_USER_AVATAR}
                        sx={{
                          width: 45,
                          height: 45,
                          fontSize: "1rem",
                        }}
                      />
                      <Stack>
                        <Typography variant="body1">{emp.fullName}</Typography>
                        <Typography variant="body2">
                          {
                            emp.jobRole == null ? i({ id: "NOT_AVAILABLE" }) : emp.jobRole[currentLanguage] || emp.jobRole[defaultLang]
                          }
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="subtitle2">
                      {!isSameDate(dayjs(emp.dateOfBirth))
                        ? dateFormatter(emp.birthDayThisYear, "DD MMM YYYY")
                        : i({ id: "DATETIME.TODAY" })}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Stack>
      </CustomCard >
    </>
  );
}
