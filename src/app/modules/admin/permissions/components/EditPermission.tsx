import {
  Box,
  Card,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check } from "@mui/icons-material";
import { colors } from "../../../theme/MuiTheme";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import {
  ModulePermissoinModel,
} from "../../../../../utils/common_types";
import { getAllModulePermission } from "../../adminservices";
import { useAppSelector } from "../../../../Redux/hooks";
import { flatUserModulePermissions } from "../../../../../utils/common";
import { RoleModel } from "../../models";

export const EditPermission = () => {
  const intl = useIntl();
  const state = useLocation().state as RoleModel| null;
  const navigate = useNavigate();
  const [modulePermissionList, setModulePermissionList] = useState<
    ModulePermissoinModel[]
  >([]);
  const userModulePermission = useAppSelector(
    (state) => state.user.userPermissions
  );
  const flatPermissions = flatUserModulePermissions(userModulePermission);

  const checkUserModulePermission = (modulePermissionId: number) => {    
    const hasModulePermission = flatPermissions.findIndex((permission) => (
      permission.modulePermissionId === modulePermissionId
    ));   
    return hasModulePermission !== -1 ? true : false;
  };

  useEffect(() => {
    if (!state) {
      navigate("/error/404", { replace: true });
    }
  }, []);

  useEffect(() => {
    getAllModulePermission()
      .then((res) => {
        const { success, methodResults } = res.data;
        if (success) {
          setModulePermissionList(methodResults);
        }
      })
      .catch((err) => {
        console.log("Error:", err.message);
      });
  }, []);

  
  return (
    <>
      <Stack position={"sticky"}>
        <Typography variant="h4" mb={3}>
          {intl.formatMessage({ id: "ROLES.EDIT_AND_PERMISSION" })}
        </Typography>
      </Stack>
      <Card sx={{ p: "2rem" }}>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <TextField
              variant="standard"
              label="Role Name"
              fullWidth
              sx={{
                "& .MuiInput-underline:before": {
                  borderBottomColor: "gray", // default border color
                },
                "& .MuiInput-underline:focus": {
                  borderBottomColor: colors.alpha.primary, // change border color on focus
                },
              }}
            />
            <TextField variant="standard" label="Description" fullWidth />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="h5">
              {intl.formatMessage({ id: "ADMIN.PERMISSION" })}
            </Typography>
            <Box
              component={"div"}
              sx={{
                border: "1px solid",
                borderColor: colors.alpha.neutral[200],
                borderRadius: 1,
                p: 2,
              }}
            >
              {modulePermissionList.length !== 0 && (
                <Stack spacing={2} divider={<Divider />}>
                  {modulePermissionList.map((module, index) => {
                    return (
                      <Stack spacing={0.5} key={index}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {module.moduleName}
                        </Typography>
                        <FormGroup
                          row
                          sx={{ paddingInlineStart: 2, fontSize: "12px" }}
                          className="d-flex flex-row gap-2"
                        >
                          {module.permissions.map((permission) => {
                            return (
                              <FormControlLabel
                                key={permission.modulePermissionId}
                                disabled={state?.isNotEditable }
                                value={permission.modulePermissionId}
                                control={
                                  <Checkbox
                                    onChange={(e) => {
                                      console.log(e.target.value);
                                    }}
                                  />
                                }
                                checked={checkUserModulePermission(permission.modulePermissionId)}
                                label={permission.permissionName}
                                labelPlacement="end"
                              />
                            );
                          })}
                        </FormGroup>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Stack>
          <Stack direction={"row"} spacing={2} className="justify-content-end">
            <CustomisedButton variant="outlined" label="Cancel" />
            <CustomisedButton
              disabled={state?.isNotEditable}
              label="Save Changes"
              Icon={<Check />}
              iconPosition="start"
            />
          </Stack>
        </Stack>
      </Card>
    </>
  );
};
