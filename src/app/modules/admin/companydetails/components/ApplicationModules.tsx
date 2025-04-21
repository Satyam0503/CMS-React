import { Grid, Stack, Switch, Typography } from "@mui/material";
import React, { FC } from "react";

import { useIntl } from "react-intl";

export const ApplicationModules: FC = () => {
  const intl = useIntl();

  return (
    <Stack spacing={3} p={4}>
      <Stack>
        <Typography variant="h4" mb={1}>
        {intl.formatMessage({
              id: "COMPANY_DETAILS.TAB.APPLICATIONS",
            })}
          
        </Typography>
        <Typography variant="body2">
          Select which application modules you want to be enabled for your
          company.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems={"center"}>
        <Stack>
          <Switch />
        </Stack>

        <Stack>
          <Typography variant="body1">
            {intl.formatMessage({
              id: "Modules.Dashboard",
            })}
          </Typography>
          <Typography variant="body2">
            A home page, summary of various modules, to give an overview of the
            portal.
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems={"center"}>
        <Stack>
          <Switch />
        </Stack>

        <Stack>
          <Typography variant="body1">
            {intl.formatMessage({
              id: "Modules.Employees",
            })}
          </Typography>
          <Typography variant="body2">
            This module allows you to add employees and their detail in the
            company.
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems={"center"}>
        <Stack>
          <Switch />
        </Stack>

        <Stack>
          <Typography variant="body1">
            {intl.formatMessage({
              id: "Modules.PayRoll",
            })}
          </Typography>
          <Typography variant="body2">
            This module allows to manage leave application and attendance of the
            employee,
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems={"center"}>
        <Stack>
          <Switch />
        </Stack>

        <Stack>
          <Typography variant="body1">
            {intl.formatMessage({
              id: "Modules.Recruitment",
            })}
          </Typography>
          <Typography variant="body2">
            This module allows to add job vacancies, manage received application
            and check previous process logs.
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems={"center"}>
        <Stack>
          <Switch />
        </Stack>

        <Stack>
          <Typography variant="body1">
            {" "}
            {intl.formatMessage({
              id: "Modules.Admin",
            })}
          </Typography>
          <Typography variant="body2">
            Admin module is for assign role and permission based on positions.
            Set theme and company master.
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems={"center"}>
        <Stack>
          <Switch />
        </Stack>

        <Stack>
          <Typography variant="body1">
            {intl.formatMessage({
              id: "Modules.Holidays",
            })}
          </Typography>
          <Typography variant="body2">
            This module allows to add, update and view holiday list of the year.
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems={"center"}>
        <Stack>
          <Switch />
        </Stack>

        <Stack>
          <Typography variant="body1">
            {intl.formatMessage({
              id: "Modules.NoticeBoard",
            })}
          </Typography>
          <Typography variant="body2">
            This module is used to post, edit and view notices.
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
