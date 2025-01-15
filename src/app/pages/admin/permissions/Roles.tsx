import { Typography, Grid, Stack, Container } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedTable } from "../../../modules/components/CustomisedTable";

import { useState } from "react";
import { RolesType } from "../../../../utils/common_types";
import { RoleTableColumnList } from "../../../../utils/constant/Constant";
import { CompanyRoles } from "../../../../utils/constant/Permission";

export const Roles = () => {
  const intl = useIntl();
  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        {intl.formatMessage({ id: "MENU.USER_PERMISSION" })}
      </Typography>
      <CustomisedTable
        tabName="Roles"
        rows={CompanyRoles}
        columns={RoleTableColumnList}
        page={0}
        rowsPerPage={10}
      />
    </Stack>
  );
};
