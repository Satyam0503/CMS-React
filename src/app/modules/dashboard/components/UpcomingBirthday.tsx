import { Stack, Typography, Avatar, Box, Link } from "@mui/material";
import { useIntl } from "react-intl";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { dateFormatter } from "../../../../utils/common";
import { CustomCard } from "../../../shared/components/CustomCard";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { getAllEmployees } from "../../employees/employeeServices";

const isSameDate = (date: Dayjs) => {
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
  const intl = useIntl();
  const [employees, setEmployees] = useState<GetAllEmployeeResponseModel[]>([]);

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
    })();
  }, [])

  return (
    <>
      <CustomCard label={intl.formatMessage({ id: "MENU.BIRTHDAY" })}>
        <Stack
          sx={{
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          {!employees.length ? (
            <Box
              component={"div"}
              sx={{ flexGrow: 1, alignContent: "center", textAlign: "center" }}
            >
              <Typography variant="h5">No Employees</Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {getUpcomingBirthDays(employees).slice(0, 3).map((emp) => {
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
                        src={emp.fullProfileUrl ?? ""}
                        sx={{
                          width: 45,
                          height: 45,
                          fontSize: "1rem",
                        }}
                      />
                      <Stack>
                        <Typography variant="body1">{emp.fullName}</Typography>
                        <Typography variant="body2">{emp.jobRole}</Typography>
                      </Stack>
                    </Stack>

                    <Typography variant="subtitle2">
                      {!isSameDate(dayjs(emp.dateOfBirth))
                        ? dateFormatter(emp.birthDayThisYear, "DD MMM YYYY")
                        : intl.formatMessage({ id: "Date.Today" })}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          )}
          <Stack>
            <Link href="employeeperformance" underline="always">
              {"See more"}
            </Link>
          </Stack>
        </Stack>
      </CustomCard>
    </>
  );
}
