import {
  Box,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { Check } from "@mui/icons-material";
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
import { useFormik } from "formik";
import * as Yup from "yup";
import { usePageData } from "../../../../Context/PageDataProvider";

const initialValues = {
  description: "",
  roleTitle: "",
};
const validationSchema = Yup.object().shape({
  description: Yup.string().required(),
  roleTitle: Yup.string().required(),
});

export const AddPermission = () => {
  const { formatMessage } = useIntl();
  const { setPageTitle } = usePageData();
  const [modulePermissionList, setModulePermissionList] = useState<
    ModulePermissoinModel[]
  >([]);
  const [selectedPermission, setSelectedPermission] = useState<
    PermissionModel[]
  >([]);
  const [isLoading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.ADD_ROLE" }));
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

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleAddRolePermission(values);
    },
  });

  const checkUserModulePermission = (modulePermissionId: number) => {
    const hasModulePermission = selectedPermission.findIndex(
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
    const hasPermission = selectedPermission.find(
      (permission) =>
        permission.modulePermissionId === newPermission.modulePermissionId
    );
    if (hasPermission) {
      setSelectedPermission(
        selectedPermission.filter(
          (permission) =>
            permission.modulePermissionId !== newPermission.modulePermissionId
        )
      );
    } else {
      setSelectedPermission([
        ...selectedPermission,
        {
          ...newPermission,
          hasAccess: isChecked,
          rolePermissionId: "",
          rolesId: "",
        },
      ]);
    }
  };

  const handleAddRolePermission = async (roleValues: typeof initialValues) => {
    const payload: AddEditRoleModel = {
      roleId: "",
      roleTitle: roleValues.roleTitle,
      description: roleValues.description,
      rolePermissions: selectedPermission,
      hasAppAccess: selectedPermission.length !== 0,
      userRoles: [],
    };
    try {
      const response = await addEditRole(payload);
      const { success, message } = response.data;
      if (success) {
        navigate("/admin/roles");
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };
  const handleReset = () => {
    formik.resetForm();
    setSelectedPermission([]);
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
            label={formatMessage({ id: "ROLE.NAME" })}
            error={formik.touched.roleTitle && Boolean(formik.errors.roleTitle)}
            {...formik.getFieldProps("roleTitle")}
          />
          <TextField
            fullWidth
            required
            multiline
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            label={formatMessage({ id: "ROLE.DESCRIPTION" })}
            {...formik.getFieldProps("description")}
          />
        </Stack>
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
                  border: "1px solid grey",

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
                label={formatMessage({ id: "BUTTON.RESET" })}
                handleClick={handleReset}
              />
              <CustomisedButton
                loading={formik.isSubmitting}
                type="submit"
                disabled={formik.isSubmitting}
                label={formatMessage({ id: "BUTTON.SAVE" })}
                Icon={<Check />}
              />
            </Stack>
          </>
        )}
      </form>
    </Card>
  );
};
