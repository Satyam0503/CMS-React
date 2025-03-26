import { Stack, Typography, Avatar, Box } from "@mui/material";
import { useIntl } from "react-intl";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { dateFormatter } from "../../../../utils/common";
import { colors } from "../../theme/MuiTheme";
import { CustomCard } from "../../../shared/components/CustomCard";
import { EmployeeModel } from "../../../../utils/common_types";
interface PropsType {
  employees: EmployeeModel[];
}
export default function UpcomingBirthday({ employees }: PropsType) {
  const intl = useIntl();
  const [employeeList, setEmployeeList] = useState<EmployeeModel[]>([]);

  const getUpcomingBirthDays = useCallback(() => {
    const sortedEmployee = employees
      .map((emp) => {
        let birthDayThisYear = dayjs(emp.dateOfBirth).set(
          "year",
          dayjs().get("year")
        );
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
    return sortedEmployee;
  }, [employees]);

  useEffect(() => {
    if (employees.length) {
      setEmployeeList(getUpcomingBirthDays());
    }
  }, [employees]);

  const isSameDate = (date: Dayjs) => {
    const currentDateofMonth = dayjs().date();
    const currentMonth = dayjs().month();
    if (currentDateofMonth === date.date() && currentMonth === date.month()) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <>
      <CustomCard label={intl.formatMessage({ id: "MENU.BIRTHDAY" })}>
        {!employees.length ? (
          <Box
            component={"div"}
            sx={{ flexGrow: 1, alignContent: "center", textAlign: "center" }}
          >
            <Typography variant="h5" sx={{color:colors.alpha.neutral[400]}}>No Employees</Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {employeeList.slice(0, 5).map((emp) => {
              return (
                <Stack
                  key={emp.userId}
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Stack
                    direction="row"
                    sx={{ alignItems: "center" }}
                    spacing={1}
                  >
                    <Avatar
                      alt="User Profile"
                      src={emp.fullProfileUrl}
                      sx={{
                        width: 45,
                        height: 45,
                        fontSize: "1rem",
                      }}
                    >
                      {emp.firstName.charAt(0)}
                    </Avatar>
                    <Stack>
                      <Typography variant="body1">{`${emp.firstName} ${emp.lastName}`}</Typography>
                      <Typography variant="body2">{emp.jobRole}</Typography>
                    </Stack>
                  </Stack>

                  <Typography
                    variant="subtitle2"
                    color={colors.alpha.primary[500]}
                  >
                    {!isSameDate(dayjs(emp.dateOfBirth))
                      ? dateFormatter(emp.birthDayThisYear!, "DD MMM YYYY")
                      : "Today"}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        )}
      </CustomCard>
    </>
  );
}
