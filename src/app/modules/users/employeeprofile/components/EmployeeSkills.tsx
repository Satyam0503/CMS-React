import { Card, Chip, Stack, Typography } from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";

interface Props {
    employeeSkills:string;
}

export const EmployeeSkills:FC<Props> = ({employeeSkills}) => {
  const intl = useIntl();
  const skills = employeeSkills.trim().length === 0 ? [] : employeeSkills.split(",");

  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h5" sx={{mb:2}}>
        {intl.formatMessage({ id: "PROFILE.SKILLS" })}
      </Typography>

      <Stack direction="row" gap={1} flexWrap={"wrap"}>
        {skills?.length === 0 ? (
          <Typography variant="body2">
            {intl.formatMessage({ id: "ADD.SKILLS" })}
          </Typography>
        ) : (
          skills?.map((skill, index) => <Chip key={index} label={skill} />)
        )}
      </Stack>
    </Card>
  );
};
