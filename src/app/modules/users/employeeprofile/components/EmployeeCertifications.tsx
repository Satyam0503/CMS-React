import { CalendarToday, LocalActivity } from "@mui/icons-material";
import { Card, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { UserCertificationModel } from "../../../../../utils/common_types";
import { useIntl } from "react-intl";
import { colors } from "../../../theme/MuiTheme";
import { dateFormatter } from "../../../../../utils/common";
import { getEmployeeCertifications } from "../../userservices";
import { ProfileProps } from "../../models";

export const EmployeeCertification:FC<ProfileProps> = ({employeeId}) => {
  const intl = useIntl();
  const [employeeCertifications,setEmployeeCertifications]= useState<UserCertificationModel[]>([]);
  useEffect(() => {
    getEmployeeCertifications(employeeId)
      .then((response) => {
        const { success, methodResults } = response.data;
        if (success) {
          setEmployeeCertifications(methodResults);
        }
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, []);

  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h5" flexWrap={"wrap"} sx={{ mb: 2 }}>
        {intl.formatMessage({ id: "PROFILE.CERTIFICATION" })}
      </Typography>

      <Stack spacing={{ xs: 0.5, sm: 1 }}>
        {employeeCertifications.length === 0 ? (
          <Typography variant="body2" flexWrap={"wrap"}>
            {intl.formatMessage({ id: "ADD.CERTIFICATION" })}
          </Typography>
        ) : (
          employeeCertifications.map((certification) => (
            <Stack
              key={certification.certificationId}
              direction="row"
              display={"flex"}
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
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: colors.alpha.secondary[100],
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                  }}
                >
                  <Stack color={colors.alpha.secondary[500]}>
                    <LocalActivity />
                  </Stack>
                </Stack>

                <Stack>
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    color={colors.alpha.neutral[800]}
                  >
                    {certification.certificationTitle}
                  </Typography>
                  <Stack
                    direction={{ sx: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ sm: "flex-end" }}
                  >
                    <Typography
                      variant="caption"
                      display={"block"}
                      fontWeight={500}
                    >
                      {certification.organisationName},{certification.mode}
                    </Typography>
                    <Typography variant="body2">
                      <CalendarToday
                        sx={{
                          height: "1rem",
                          width: "inherit",
                          mb: 0.4,
                          mr: 0.5,
                        }}
                      />

                      {dateFormatter(certification.startDate, "MMM YYYY")}
                      {" - "}
                      {dateFormatter(certification.endDate, "MMM YYYY")}
                    </Typography>
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
