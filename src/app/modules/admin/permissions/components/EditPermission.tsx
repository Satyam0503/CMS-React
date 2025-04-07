import {
  Box,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check } from "@mui/icons-material";
import { colors } from "../../../theme/MuiTheme";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import {
  ModulePermissoinModel,
  PermissionModel,
} from "../../../../../utils/common_types";
import {
  addEditRole,
  getAllModulePermission,
  getRolePermissionsById,
} from "../../adminservices";
import { AddEditRoleModel, RoleModel } from "../../models";
import { flatRolePermissionList } from "../../../../../utils/common";
import { CircularLoader } from "../../../../shared/components/CircularLoader";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { usePageData } from "../../../../../_themes/layout/core";

const validationSchema = Yup.object().shape({
  description: Yup.string().required(),
  titles: Yup.string().required(),
});

export const EditPermission = () => {
  const intl = useIntl();
  const { setPageTitle } = usePageData();
  const param = useParams();
  const state = useLocation().state as RoleModel | null;
  const navigate = useNavigate();
  const [modulePermissionList, setModulePermissionList] = useState<
    ModulePermissoinModel[]
  >([]);
  const [rolePermissionList, setRolePermissionList] = useState<
    PermissionModel[]
  >([]);
  const [currentRoleDetails, setCurrentRoleDetails] = useState({description: "", titles: "", });
  const [isLoading, setLoading] = useState(true);

  const formik = useFormik({
    initialValues: currentRoleDetails,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (value) => {
      handleRolePermissionUpdate(value);
    },
  });

  console.log(param);
  
  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.EDIT_PERMISSION" }));
    if (!state || Object.keys(state).length === 0) {
      navigate("/error/404", { replace: true });
    } else {
      setCurrentRoleDetails({
        ...currentRoleDetails,
        description: state.description,
        titles: state.titles,
      });
    }
  }, []);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const response = await Promise.all([
          getAllModulePermission(),
          getRolePermissionsById(state?.rolesId!),
        ]);
        setModulePermissionList(response[0].data.methodResults);
        setRolePermissionList(
          flatRolePermissionList(response[1].data.methodResults)
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getPermissions();
  }, []);

  const checkUserModulePermission = (modulePermissionId: number) => {
    const hasModulePermission = rolePermissionList.findIndex(
      (permission) =>
        permission.modulePermissionId === modulePermissionId &&
        permission.hasAccess
    );
    return hasModulePermission !== -1 ? true : false;
  };

  const handlePermissionChange = (
    newPermission: PermissionModel,
    isChecked: boolean
  ) => {
    const hasPermission = rolePermissionList.find(
      (permission) =>
        permission.modulePermissionId === newPermission.modulePermissionId
    );
    if (hasPermission) {
      const filteredRolePermission = rolePermissionList.map((permission) => {
        if (
          permission.modulePermissionId === newPermission.modulePermissionId
        ) {
          return { ...permission, hasAccess: isChecked };
        }
        return permission;
      });
      setRolePermissionList(filteredRolePermission);
    } else {
      setRolePermissionList([
        ...rolePermissionList,
        {
          ...newPermission,
          hasAccess: isChecked,
          rolePermissionId: "",
          rolesId: "",
        },
      ]);
    }
  };

  const handleRolePermissionUpdate = async (
    roleValues: typeof currentRoleDetails
  ) => {
    const payload: AddEditRoleModel = {
      roleId: state?.rolesId,
      roleTitle: roleValues.titles,
      description: roleValues.description,
      hasAppAccess: rolePermissionList.length !== 0,
      rolePermissions: rolePermissionList,
      userRoles: [],
    };
    try {
      const response = await addEditRole(payload);
      const { success, message } = response.data;
      if (success) {
        toast.success(message);
        navigate("/admin/permissions");
      }
    } catch (error) {
      toast.error("Failed To Update Permission");
    }
  };

  return (
    <Card sx={{ p: "2rem" }} className="flex-grow-1 d-flex flex-column">
      <form
        onSubmit={formik.handleSubmit}
        className="flex-grow-1 d-flex flex-column gap-4"
      >
        <Stack spacing={2}>
          <TextField
            fullWidth
            required
            error={formik.touched.titles && Boolean(formik.errors.titles)}
            disabled={state?.isNotEditable}
            label={intl.formatMessage({ id: "ROLE.NAME" })}
            {...formik.getFieldProps("titles")}
          />
          <TextField
            fullWidth
            required
            multiline
            disabled={state?.isNotEditable}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            label={intl.formatMessage({ id: "INFO.DESCRIPTION" })}
            {...formik.getFieldProps("description")}
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
              <Box className="p-5 shadow-sm">
                <Stack
                  spacing={2}
                  direction={"row"}
                  className="align-items-center mb-4"
                >
                  <Typography variant="h6">
                    {intl.formatMessage({ id: "ADMIN.APP_ACCESS" })} :
                  </Typography>
                  {/* <Switch  checked={state?.hasAppAccess} onChange={()=>handleChnage}/> */}
                </Stack>
                <Typography>
                    {intl.formatMessage({ id: "ADMIN.APP_ACCESS_INSTRUCTION" })}
                </Typography>
              </Box>
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
                                  labelPlacement="end"
                                  label={permission.permissionName}
                                  key={permission.modulePermissionId}
                                  disabled={state?.isNotEditable}
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
              <CustomisedButton
                variant="outlined"
                label={intl.formatMessage({ id: "BUTTON.RESET" })}
              />
              <CustomisedButton
                loading={formik.isSubmitting}
                disabled={state?.isNotEditable || formik.isSubmitting}
                label={intl.formatMessage({ id: "BUTTON.SAVE" })}
                Icon={<Check />}
                iconPosition="start"
                type="submit"
              />
            </Stack>
          </>
        )}
      </form>
    </Card>
  );
};
