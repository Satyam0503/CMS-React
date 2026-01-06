import { useEffect, useState } from "react";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { useIntl } from "react-intl";
import { Grid, Stack } from "@mui/system";
import { Formik } from "formik";
import { policySchema } from "../../../../utils/Schema/policySchema";
import { AddPolicyModel } from "../models";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  ListItemText,
  Switch,
  TextField,
} from "@mui/material";
import { getAllDepartments, getAllRoles } from "../../admin/adminservices";
import { DepartmentModel, RoleModel } from "../../admin/models";
import { useAppSelector } from "../../../Redux/hooks";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { addPolicy, updatePolicy } from "../policyServices";
import { toast } from "react-toastify";
import { getCustomStatusCodesErrorMessage } from "../../../../utils/common";

type Props = {
  open: boolean;
  handleClose: () => void;
  initialValues: AddPolicyModel;
  isEdit: boolean;
  handleRefresh: () => void;
};

export default function AddNewPolicyForm(props: Props) {
  const { formatMessage: i } = useIntl();
  const [roleList, setRoleList] = useState<RoleModel[]>([]);
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);

  const currentLanguage = useAppSelector(
    (state) => state.user.userData?.defaultLanguage!
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
      });

    const getAllDeps = async () => {
      try {
        const response = await getAllDepartments();
        const { success, methodResults } = response.data;
        if (success) {
          setDepartmentList(methodResults);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAllDeps();
  }, []);

  const handleAddEditPolicy = async (
    values: AddPolicyModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      if (!props.isEdit) {
        const { data } = await addPolicy(values);
        if (data.success) {
          toast.success(i({ id: "TOAST.SUCCESS.CREATED" }));
          props.handleClose();
          props.handleRefresh();
        } else {
          toast.error(
            i({ id: getCustomStatusCodesErrorMessage(data.statusCode) })
          );
        }
      } else {
        const { data } = await updatePolicy(values);
        if (data.success) {
          toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
          props.handleClose();
          props.handleRefresh();
        } else {
          toast.error(
            i({ id: getCustomStatusCodesErrorMessage(data.statusCode) })
          );
        }
      }
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomisedModal
      open={props.open}
      handleClose={props.handleClose}
      title={i({ id: "POLICIES.ADD_POLICY" })}
    >
      <Formik
        initialValues={props.initialValues}
        validationSchema={policySchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddEditPolicy(values, setSubmitting);
        }}
      >
        {({ values, setFieldValue, handleSubmit, ...formik }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextInput
                    required={true}
                    label={i({ id: "POLICIES.POLICY_NAME" })}
                    type="text"
                    name="policyName"
                    placeholder={i({ id: "POLICIES.POLICY_NAME" })}
                  />
                </Grid>
                <Grid size={12}>
                  <TextInput
                    required={true}
                    multiline={true}
                    label={i({ id: "POLICIES.POLICY_DESCRIPTION" })}
                    type="text"
                    name="description"
                    placeholder={i({ id: "POLICIES.POLICY_DESCRIPTION" })}
                  />
                </Grid>
                <Grid size={12}>
                  <Autocomplete
                    multiple
                    size="small"
                    id="departments"
                    options={departmentList}
                    disableCloseOnSelect
                    value={departmentList.filter(
                      (department) =>
                        values.departments &&
                        values.departments.includes(department.departmentId!)
                    )}
                    onChange={(event, value) => {
                      setFieldValue(
                        "departments",
                        value.map((item) => item.departmentId)
                      );
                    }}
                    getOptionLabel={(option) => {
                      return option.titles["en"];
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={i({
                          id: "TITLES.DEPARTMENT",
                        })}
                      />
                    )}
                    renderOption={(props, option, state) => {
                      return (
                        <li {...props} key={option.departmentId}>
                          <Checkbox
                            // key={option.id}
                            checked={state.selected}
                            sx={{ mr: 1 }}
                          />
                          <ListItemText
                            primary={option.titles[currentLanguage]}
                          />
                        </li>
                      );
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <Autocomplete
                    multiple
                    size="small"
                    id="roles"
                    options={roleList}
                    disableCloseOnSelect
                    value={roleList.filter(
                      (role) =>
                        values.roles && values.roles.includes(role.rolesId!)
                    )}
                    onChange={(event, value) => {
                      setFieldValue(
                        "roles",
                        value.map((item) => item.rolesId)
                      );
                    }}
                    getOptionLabel={(option) => {
                      return option.titles;
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={i({ id: "TITLES.ROLES" })}
                      />
                    )}
                    renderOption={(props, option, state) => {
                      return (
                        <li {...props} key={option.rolesId}>
                          <Checkbox
                            // key={option.id}
                            checked={state.selected}
                            sx={{ mr: 1 }}
                          />
                          <ListItemText primary={option.titles} />
                        </li>
                      );
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  <FormControlLabel
                    labelPlacement="start"
                    control={
                      <Switch
                        onChange={(e, checked) => {
                          setFieldValue("isActive", checked);
                        }}
                        checked={values.isActive}
                      />
                    }
                    label={i({ id: "ACTIVE" })}
                    sx={{
                      margin: "0",
                      gap: "10px",
                    }}
                  />
                </Grid>
              </Grid>
              <Stack className="flex-row justify-content-end gap-2 mt-4">
                <CustomisedButton
                  variant="outlined"
                  label={i({ id: "BUTTON.CANCEL" })}
                  handleClick={props.handleClose}
                />
                <CustomisedButton
                  type="submit"
                  disabled={!formik.isValid || formik.isSubmitting}
                  variant="contained"
                  label={i({
                    id: props.isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD",
                  })}
                  loading={formik.isSubmitting}
                />
              </Stack>
            </form>
          );
        }}
      </Formik>
    </CustomisedModal>
  );
}
