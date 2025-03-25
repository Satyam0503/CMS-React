import {
  Typography,
  Stack,
  Card,
} from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { RoleTableColumnList } from "../../../../utils/constant/Constant";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useNavigate } from "react-router-dom";
import { Add } from "@mui/icons-material";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useEffect, useState } from "react";
import { RoleModel } from "../models";
import { getAllRoles } from "../adminservices";
import { useAppSelector } from "../../../Redux/hooks";
import { checkPermissionForModulesFeatureAccess } from "../../../../utils/common";

export const Roles = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [roleList, setRoleList] = useState<RoleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const userModulePermission = useAppSelector(
    (state) => state.user.userData?.modulePermission
  )!;
  const hasAccess = checkPermissionForModulesFeatureAccess(
    ModulesName.Permissions,
    Permission.Create,
    userModulePermission
  );
  useEffect(() => {
    getAllRoles()
      .then((res) => {
        const { success, methodResults } = res.data;
        if (success) {
          setRoleList(methodResults);
        }
      })
      .catch((err) => {
        console.log("Error:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Stack
        direction={"row"}
        className="justify-content-between align-items-center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">
          {intl.formatMessage({ id: "PAGE.PERMISSION" })}
        </Typography>
        {hasAccess && (
          <CustomisedButton
            label={intl.formatMessage({ id: "ADMIN.ADD_ROLE" })}
            handleClick={() => {
              navigate("/admin/addrole");
            }}
            Icon={<Add />}
          />
        )}
      </Stack>

      <Card sx={{ p: "2rem" }}>
        <CustomisedTable
          tabName={ModulesName.Permissions}
          keyName="rolesId"
          rows={roleList}
          loading={loading}
          columns={RoleTableColumnList}
          page={0}
          rowsPerPage={10}
        />
      </Card>
    </>
  );
};
