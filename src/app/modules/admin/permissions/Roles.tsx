import { Card } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedTable } from "../../../shared/components/C_Table";
import { RoleTableColumnList } from "../../../../utils/constant/Constant";
import CustomisedButton from "../../../shared/components/C_Button";
import { useNavigate } from "react-router-dom";
import { Add } from "@mui/icons-material";
import { ModulesName } from "../../../../utils/enums";
import { useEffect, useState } from "react";
import { RoleModel } from "../models";
import { getAllRoles } from "../adminservices";
import { usePageData } from "../../../Context/PageDataProvider";

export const Roles = () => {
  const intl = useIntl();
  const { setPageTitle } = usePageData();
  const navigate = useNavigate();
  const [roleList, setRoleList] = useState<RoleModel[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.PERMISSION" }));
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
  }, [intl, setPageTitle]);

  return (
    <>
      <Card sx={{ p: "2rem" }} className="d-flex flex-column flex-grow-1">
        <CustomisedButton
          label={intl.formatMessage({ id: "ROLE.ADD_ROLE" })}
          handleClick={() => {
            navigate("/admin/roles/add");
          }}
          Icon={<Add />}
          className="align-self-end mb-4"
        />
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
