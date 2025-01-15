import { Typography, Grid, Stack, Container, Card } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedTable } from "../../../modules/components/CustomisedTable";

import { useState } from "react";
import { RolesType } from "../../../../utils/common_types";
import { RoleTableColumnList } from "../../../../utils/constant/Constant";
import { CompanyRoles } from "../../../../utils/constant/Permission";
import { colors } from "../../../modules/theme/MuiTheme";

export const Roles = () => {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.USER_PERMISSION" })}
      </Typography>

      <Card>
        <CustomisedTable
          tabName="Roles"
          rows={CompanyRoles}
          columns={RoleTableColumnList}
          page={0}
          rowsPerPage={10}
        />
      </Card>
    </>
  );
};
