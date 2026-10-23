import {
  Box,
  Card,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check } from "@mui/icons-material";
import CustomisedButton from "../../../../shared/components/C_Button";
import {
  ModulePermissoinModel,
  PermissionModel,
} from "../../../../../utils/common_types";
import {
  addEditRole,
  changeAppAccess,
  getAllModulePermission,
  getRoleById,
  getRolePermissionsById,
} from "../../adminservices";
import { AddEditRoleModel, RoleModel } from "../../models";
import { flatRolePermissionList } from "../../../../../utils/common";
import { CircularLoader } from "../../../../shared/components/CircularLoader";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { usePageData } from "../../../../Context/PageDataProvider";

import { AppCheckbox, AppSwitch, AppTextField } from "../../../../shared/components/ui";
const validationSchema = Yup.object().shape({
  description: Yup.string().required(),
  title: Yup.string().required(),
});

export const EditPermission = () => {
  const { formatMessage } = useIntl();
  const { setPageTitle } = usePageData();
  const { roleid = "" } = useParams();
  const navigate = useNavigate();
  const [modulePermissionList, setModulePermissionList] = useState<
    ModulePermissoinModel[]
  >([]);
  const [rolePermissionList, setRolePermissionList] = useState<
    PermissionModel[]
  >([]);
  const [currentRoleDetails, setCurrentRoleDetails] = useState<RoleModel>();
  const [isLoading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: currentRoleDetails?.titles ?? "",
      description: currentRoleDetails?.description ?? "",
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (value) => {
      handleRolePermissionUpdate(value);
    },
  });

  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.EDIT_PERMISSION" }));
    getRoleById(roleid)
      .then((res) => {
        const { success, methodResult } = res.data;
        if (success) {
          setCurrentRoleDetails(methodResult);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, [formatMessage, refresh, roleid, setPageTitle]);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const response = await Promise.all([
          getAllModulePermission(),
          getRolePermissionsById(roleid),
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
  }, [roleid]);

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
    roleValues: typeof formik.initialValues
  ) => {
    const payload: AddEditRoleModel = {
      roleId: currentRoleDetails?.rolesId,
      roleTitle: roleValues.title,
      description: roleValues.description,
      hasAppAccess: Boolean(currentRoleDetails?.hasAppAccess),
      rolePermissions: rolePermissionList,
      userRoles: [],
    };
    try {
      const response = await addEditRole(payload);
      const { success } = response.data;
      if (success) {
        navigate("/admin/roles");
      } else {
        toast.error(formatMessage({ id: "TOAST.FAILED.UPDATE_ROLE" }));
      }
    } catch (error) {
      toast.error((error as Error).message || formatMessage({ id: "TOAST.FAILED.UPDATE_ROLE" }));
    }
  };

  const handleAppAccessChange = async (checked: boolean) => {
    if (!currentRoleDetails?.rolesId) {
      return;
    }
    try {
      const res = await changeAppAccess(currentRoleDetails.rolesId, checked);
      if (res.data.success) {
        toast.success(formatMessage({ id: "ROLE.APP_ACCESS.UPDATED" }));
        setRefresh(!refresh);
      } else {
        toast.error(formatMessage({ id: "TOAST.FAILED.UPDATE_ROLE" }));
      }
    } catch (error) {
      toast.error((error as Error).message || formatMessage({ id: "TOAST.FAILED.UPDATE_ROLE" }));
    }
  };

  return (
    <Card sx={{ p: "2rem" }} className="flex-grow-1 d-flex flex-column">
      <form
        onSubmit={formik.handleSubmit}
        className="flex-grow-1 d-flex flex-column gap-5"
      >
        <Stack spacing={2}>
          <AppTextField
            fullWidth
            required
            error={formik.touched.title && Boolean(formik.errors.title)}
            disabled={currentRoleDetails?.isNotEditable}
            label={formatMessage({ id: "ROLE.NAME" })}
            {...formik.getFieldProps("title")}
          />
          <AppTextField
            fullWidth
            required
            multiline
            disabled={currentRoleDetails?.isNotEditable}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            label={formatMessage({ id: "ROLE.DESCRIPTION" })}
            {...formik.getFieldProps("description")}
          />
        </Stack>
        {!currentRoleDetails?.isNotEditable && (
          <Box className="p-5 mb-2" sx={{ border: 1, borderRadius: 1, borderColor: 'text.disabled' }}>
            <Stack
              spacing={2}
              direction={"row"}
              className="align-items-center mb-4"
            >
              <Typography variant="h6">
                {formatMessage(
                  {
                    id: currentRoleDetails?.hasAppAccess
                      ? "ROLE.DISABLE_ACCESS"
                      : "ROLE.ENABLE_ACCESS",
                  },
                  { role: currentRoleDetails?.titles }
                )}{" "}
                :
              </Typography>
              <AppSwitch
                checked={currentRoleDetails?.hasAppAccess}
                onChange={(_, checked) => handleAppAccessChange(checked)}
              />
            </Stack>
            <Typography variant="caption">
              {formatMessage({
                id: currentRoleDetails?.hasAppAccess
                  ? "ROLE.DISABLE_ACCESS_NOTE"
                  : "ROLE.ENABLE_ACCESS_NOTE",
              })}
            </Typography>
          </Box>
        )}
        {isLoading ? (
          <CircularLoader />
        ) : (
          <>
            <Stack spacing={1}>
              <Typography variant="h5">
                {formatMessage({ id: "ROLE.PERMISSION" })}
              </Typography>

              <Box
                component={"div"}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 2,
                }}
              >
                {modulePermissionList.length !== 0 &&
                  modulePermissionList.map((module, index) => {
                    return (
                      <Stack
                        spacing={1}
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: "var(--mui-palette-background-card, var(--mui-palette-background-paper))",
                          backdropFilter: "blur(14px)",
                          border: "1px solid",
                          borderColor: "divider",
                          boxShadow: "0 4px 14px -4px rgba(0, 0, 0, 0.08)",
                          transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            borderColor: "primary.main",
                            boxShadow: "0 10px 22px -6px rgba(0, 0, 0, 0.16)",
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            letterSpacing: "-0.01em",
                            pb: 0.5,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {module.moduleName}
                        </Typography>
                        <FormGroup
                          row
                          sx={{ fontSize: "12.5px" }}
                          className="d-flex flex-row flex-wrap gap-2"
                        >
                          {module.permissions.map((permission) => {
                            return (
                              <FormControlLabel
                                labelPlacement="end"
                                label={permission.permissionName}
                                key={permission.modulePermissionId}
                                disabled={
                                  currentRoleDetails?.isNotEditable ||
                                  !currentRoleDetails?.hasAppAccess
                                }
                                value={permission.modulePermissionId}
                                control={
                                  <AppCheckbox
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
              </Box>
            </Stack>
            <Stack
              direction={"row"}
              spacing={2}
              className="justify-content-end"
            >
              <CustomisedButton
                variant="outlined"
                label={formatMessage({ id: "BUTTON.CANCEL" })}
                handleClick={() => history.back()}
              />
              <CustomisedButton
                loading={formik.isSubmitting}
                disabled={
                  currentRoleDetails?.isNotEditable ||
                  formik.isSubmitting ||
                  !currentRoleDetails?.hasAppAccess
                }
                label={formatMessage({ id: "BUTTON.SAVE" })}
                Icon={<Check />}
                type="submit"
              />
            </Stack>
          </>
        )}
      </form>
    </Card>
  );
};
