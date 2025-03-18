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
import { useEffect, useState } from "react";
import { Check } from "@mui/icons-material";
import { colors } from "../../../theme/MuiTheme";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { addEditRole, getAllModulePermission } from "../../adminservices";
import {
  ModulePermissoinModel,
  PermissionModel,
} from "../../../../../utils/common_types";
import { CircularLoader } from "../../../../shared/components/CircularLoader";
import { AddEditRoleModel } from "../../models";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AddPermission = () => {
  const intl = useIntl();
  const [modulePermissionList, setModulePermissionList] = useState<
    ModulePermissoinModel[]
  >([]);
  const [selectedPermission, setSelectedPermission] = useState<
    PermissionModel[]
  >([]);
  const [isLoading, setLoading] = useState(true);
  const [roleDetails, setCurrentRoleDetails] = useState({
    description: "",
    roleTitle: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const getAllPermissions = async () => {
      try {
        const response = await getAllModulePermission();
        const { success, methodResults } = response.data;
        if (success) {
          setModulePermissionList(methodResults);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getAllPermissions();
  }, []);

  const checkUserModulePermission = (modulePermissionId: number) => {
    const hasModulePermission = selectedPermission.findIndex(
      (permission) =>
        permission.modulePermissionId === modulePermissionId &&
        permission.hasAccess
    );
    return hasModulePermission !== -1 ? true : false;
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentRoleDetails({
      ...roleDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handlePermissionChange = (newPermission:PermissionModel,isChecked:boolean)=>{
    const hasPermission = selectedPermission.find(permission=>permission.modulePermissionId === newPermission.modulePermissionId);
    if(hasPermission){
      setSelectedPermission(selectedPermission.filter(permission=> permission.modulePermissionId !==newPermission.modulePermissionId ))
    }
    else{
      setSelectedPermission([...selectedPermission,{...newPermission,hasAccess:isChecked}])
    }
  }

  const handleAddRolePermission = async ()=>{
    const payload: AddEditRoleModel = {
      roleId:null,
      roleTitle:roleDetails.roleTitle,
      description:roleDetails.description,
      rolePermissions:selectedPermission,
      hasAppAccess:selectedPermission.length !==0,
      userRoles:[]
    }
    try {
      const response=  await addEditRole(payload);
      const {success}= response.data;
      if(success){
        toast.success("Successfully added");
        navigate('/admin/permissions');
      }
    } catch (error) {
      toast.error("Request Failed");
    }
  }

  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "ROLES.ADD" })}
      </Typography>
      <Card sx={{ p: "2rem" }} className="flex-grow-1 d-flex flex-column">
        <Stack spacing={2} className="flex-grow-1 d-flex flex-column">
          <Stack spacing={2}>
            <TextField
              fullWidth
              name="roleTitle"
              value={roleDetails.roleTitle}
              label={intl.formatMessage({ id: "ROLE.NAME" })}
              onChange={handleOnChange}
            />
            <TextField
              fullWidth
              name="description"
              value={roleDetails.description}
              label={intl.formatMessage({ id: "INFO.DESCRIPTION" })}
              onChange={handleOnChange}
            />
          </Stack>

          {isLoading ? (
            <CircularLoader />
          ) : (
            <>
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
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
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
                                    labelPlacement="end"
                                    label={permission.permissionName}
                                    key={permission.modulePermissionId}
                                    value={permission.modulePermissionId}
                                    control={
                                      <Checkbox
                                        onChange={(e) => {
                                          handlePermissionChange(
                                            permission,
                                            e.target.checked
                                          );
                                        }}
                                      />
                                    }
                                    checked={checkUserModulePermission(
                                      permission.modulePermissionId
                                    )}
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
              <Stack
                direction={"row"}
                spacing={2}
                className="justify-content-end"
              >
                <CustomisedButton variant="outlined" label="Cancel" />
                <CustomisedButton
                  disabled={selectedPermission.length === 0}
                  label="Save Changes"
                  Icon={<Check />}
                  iconPosition="start"
                  handleClick={handleAddRolePermission}
                />
              </Stack>
            </>
          )}
        </Stack>
      </Card>
    </>
  );
};
