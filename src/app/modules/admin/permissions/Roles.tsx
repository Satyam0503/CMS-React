import {
  Typography,
  Grid,
  Stack,
  Container,
  Card,
  Link,
  Button,
} from "@mui/material";
import { useIntl } from "react-intl";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { CompanyRoles } from "../../../../utils/constant/Permission";
import { RoleTableColumnList } from "../../../../utils/constant/Constant";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { Add, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const Roles = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const goToAddPermission = () => {
    navigate("/admin/addpermission");
  };
  return (
    <>
      <Grid container justifyContent={"space-between"}>
        <Stack>
          <Typography variant="h4" mb={3}>
            {intl.formatMessage({ id: "MENU.USER_PERMISSION" })}
          </Typography>
        </Stack>
        <Stack>
          <CustomisedButton
            label="Add Permissions"
            handleClick={goToAddPermission}
          />
        </Stack>
      </Grid>

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
