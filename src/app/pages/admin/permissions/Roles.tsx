import { Typography, Grid, Stack, Container } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedTable } from "../../../modules/components/CustomisedTable";
import { CompanyRoles } from "../../../../Permission";
import { RoleTableColumnList } from "../../../../Constant";
import { useState } from "react";
import { RolePermissions } from "./RolePermissions";
import { RolesType } from "../../../../utils/common_types";

export const Roles = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [seletedRole, setSelectedRole] = useState<RolesType | null>(null);
  const intl = useIntl();

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRole(null);
  };
  const handleRolePermissionEdit = (role: RolesType) => {
    console.log(role);
    if (role) {
      setModalOpen(true);
      setSelectedRole(role);
    }
  };
  return (
    <Stack direction={"column"} spacing={2}>
      <Stack>
        <Typography variant="h4" my={2}>
          {intl.formatMessage({ id: "MENU.USER_PERMISSION" })}
        </Typography>
      </Stack>
      <CustomisedTable
        tabName="Roles"
        rows={CompanyRoles}
        columns={RoleTableColumnList}
        page={0}
        rowsPerPage={10}
        handleEdit={handleRolePermissionEdit}
      />
      {isModalOpen && seletedRole && (
        <RolePermissions
          open={isModalOpen}
          handleClose={handleCloseModal}
          role={seletedRole}
        />
      )}
    </Stack>
  );
};
