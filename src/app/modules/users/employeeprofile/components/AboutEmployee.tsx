import { Card, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { getEmployeeSummary } from "../../userservices";
import { UserSummaryModel } from "../../../../../utils/common_types";
import { ProfileProps } from "../../models";

export const AboutEmployee: FC<ProfileProps> = ({ employeeId }) => {
  const [ aboutEmployee , setAboutEmployee] = useState<UserSummaryModel>();
  const intl = useIntl();
  useEffect(() => {
    getEmployeeSummary(employeeId)
      .then((response) => {
        const { success, methodResult, statusCode } = response.data;
        if (success && statusCode === 200) {
          setAboutEmployee(methodResult)
        }
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, []);

  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {intl.formatMessage({ id: "INFO.SUMMARY" })}
      </Typography>

      <Typography variant="body1">
        {aboutEmployee ? aboutEmployee.summary : "NA"}
      </Typography>
    </Card>
  );
};
