import { Card, Stack, Typography } from "@mui/material";
import { CalendarToday, School } from "@mui/icons-material";
import { UserEducationModel } from "../../../../../utils/common_types";
import { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { dateFormatter } from "../../../../../utils/common";
import { getEmployeeEducations } from "../../userservices";
import { colors } from "../../../theme/MuiTheme";
import { ProfileProps } from "../../models";

export const EmployeeEducation:FC<ProfileProps>  = ({employeeId}) => {
  const intl = useIntl();
  const [employeeEducations, setEmployeeEducations] = useState<
    UserEducationModel[]
  >([]);

  useEffect(() => {
    getEmployeeEducations(employeeId)
      .then((response) => {
        const { success, methodResults } = response.data;
        if (success) {
          setEmployeeEducations(methodResults);
        }
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, []);

  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {intl.formatMessage({ id: "PROFILE.EDUCATION" })}
      </Typography>

      <Stack spacing={{ xs: 0.5, sm: 1 }}>
        {employeeEducations.length === 0 ? (
          <Typography variant="body2">
            {intl.formatMessage({ id: "ADD.EDUCATION" })}
          </Typography>
        ) : (
          employeeEducations.map((education) => (
            <Stack
              key={education.educationId}
              direction="row"
              justifyContent={"space-between"}
              alignItems={"center"}
              spacing={1}
              sx={{
                "&:hover .MuiStack-root": {
                  visibility: "visible",
                },
              }}
            >
              <Stack direction="row" alignItems={"center"} spacing={1}>
                <Stack
                  color={colors.alpha.primary[500]}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: colors.alpha.primary[100],
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                  }}
                >
                  <School />
                </Stack>
                <Stack>
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    flexWrap={"wrap"}
                  >
                    {education.educationTitle}
                  </Typography>
                  <Stack
                    direction={{ sx: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ sm: "flex-end" }}
                  >
                    <Stack>
                      <Typography
                        variant="caption"
                        display={"block"}
                        fontWeight={600}
                      >
                        {education.collegeName}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography variant="body2">
                        <CalendarToday
                          sx={{
                            height: "1rem",
                            width: "inherit",
                            mb: 0.5,
                            mr: 0.5,
                          }}
                        />
                        {dateFormatter(education.startDate, "MMM YYYY")} -{" "}
                        {dateFormatter(education.endDate, "MMM YYYY")}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          ))
        )}
      </Stack>
    </Card>
  );
};
