import {
  EmployeeFilterModel } from "../models";
import { FC,
  useEffect,
  useState } from "react";
import CustomisedButton from "../../../shared/components/C_Button";
import { useAppDispatch,
  useAppSelector } from "../../../Redux/hooks";
import { setEmployeesFilter } from "../../../Redux/Reducers/filterSlice";
import { getDirectoryDepartments } from "../employeeServices";
import { useFormik } from "formik";

import {
  Autocomplete,
  Chip,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import { useIntl } from "react-intl";
import { employeeFilterValidationSchema } from "../../../../utils/Schema/filterValidationSchema";
import { Gender } from "../../../../utils/constant/Constant";
import { FilterComponent } from "../../../shared/components/FilterComponent";
import { FilterComponentProps } from "../../../../utils/common_types";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { DepartmentResponseModel } from "../../dashboard/model";
import { LANGUAGE } from "../../../../utils/enums";
import { canAccessHrManagement } from "../../../../utils/common";

import { AppCheckbox, AppTextField } from "../../../shared/components/ui";
export const initialFilterValues: EmployeeFilterModel = {
  departmentId: [],
  gender: [],
  employmentStatus: "Active",
};

const employmentStatusOptions = [
  { value: "Active", label: "Active" },
  { value: "NoticePeriod", label: "Notice period" },
  { value: "ExEmployees", label: "Ex-employees" },
] as const;

export const EmployeeFilter: FC<FilterComponentProps> = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useAppDispatch();
  const [deptList, setDeptList] = useState<DepartmentResponseModel[]>([]);
  const [departmentLoadFailed, setDepartmentLoadFailed] = useState(false);
  const appliedEmpFilters = useAppSelector(state => state.filters.employee);
  const { values, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: appliedEmpFilters || initialFilterValues,
      enableReinitialize: true,
      validationSchema: employeeFilterValidationSchema,
      onSubmit: (values) => {
        dispatch(setEmployeesFilter(values));
        props.handleClose();
      },
    });
  const { currentLanguage } = useAppLang();
  const defaultLanguage = useAppSelector(state => state.user.userData?.defaultLanguage) ?? LANGUAGE.ENGLISH;
  const canFilterEmploymentStatus = canAccessHrManagement(
    useAppSelector((state) => state.user.userData?.roleType),
  );

  useEffect(() => {
    const getAllDepartments = async () => {
      try {
        const response = await getDirectoryDepartments();
        const { success, methodResults } = response.data;
        if (success) {
          setDeptList(methodResults);
          setDepartmentLoadFailed(false);
        } else {
          setDepartmentLoadFailed(true);
        }
      } catch (error) {
        // An empty list is a valid tenant state.  Authorization/network failures are
        // deliberately visible to the user rather than being mistaken for no departments.
        console.error("Unable to load Employee Directory departments.", error);
        setDepartmentLoadFailed(true);
      }
    };
    getAllDepartments();
  }, []);


  return (
    <FilterComponent {...props}>
      <form onSubmit={handleSubmit}>
        <Stack>
          <Typography variant="caption">
            {formatMessage({ id: "FORM.DEPARTMENT" })}
          </Typography>
          <Autocomplete
            multiple
            size="small"
            id="jobs-dropdown"
            options={deptList}
            disableCloseOnSelect
            value={deptList.filter((dept) =>
              values.departmentId.includes(dept.departmentId)
            )}
            onChange={(_, selectedDept) => {
              setFieldValue(
                "departmentId",
                selectedDept.map((dept) => dept.departmentId)
              );
            }}
            getOptionLabel={(option) => option.label[currentLanguage] || option.label[defaultLanguage]}
            renderInput={(params) => (
              <AppTextField {...params} placeholder={formatMessage({ id: "FORM.DEPARTMENT" })} />
            )}
            renderOption={(props, option, state) => {
              return (
                <li {...props}>
                  <AppCheckbox
                    key={option.departmentId}
                    checked={state.selected}
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary={option.label[currentLanguage] || option.label[defaultLanguage]} />
                </li>
              );
            }}
          />
          {departmentLoadFailed && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
              Unable to load departments. Please refresh and try again.
            </Typography>
          )}
        </Stack>
        <Stack sx={{ mt: 1 }}>
          <Typography variant="caption">
            {formatMessage({ id: "FORM.GENDER" })}
          </Typography>
          <Autocomplete
            multiple
            size="small"
            id="gender-dropdown"
            options={Gender}
            disableCloseOnSelect
            value={Gender.filter((item) =>
              values.gender.includes(item.value)
            )}
            onChange={(_, selectedGender) => {
              setFieldValue(
                "gender",
                selectedGender.map((item) => item.value)
              );
            }}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <AppTextField {...params} placeholder={formatMessage({ id: "FORM.GENDER" })} />
            )}
            renderOption={(props, option, state) => {
              return (
                <li {...props}>
                  <AppCheckbox
                    key={option.id}
                    checked={state.selected}
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary={formatMessage({ id: option.label })} />
                </li>
              );
            }}
            // renderTags={(value, getTagProps) => (
            //   value.map((option, index: number) => {
            //     const { key, ...tagProps } = getTagProps({ index });
            //     return (
            //       <Chip label={formatMessage({ id: option.label })} size="small" key={key} {...tagProps} />
            //     );
            //   })
            // )}
            renderValue={(value, getItemsProps) => (
              value.map((option, index) => {
                const { key, ...itemProps } = getItemsProps({ index })
                return (
                  <Chip label={formatMessage({ id: option.label })} size="small" key={key} {...itemProps} />
                );
              })
            )}
          />
        </Stack>
        {canFilterEmploymentStatus && (
          <Stack sx={{ mt: 1 }}>
            <Typography variant="caption">Employment status</Typography>
            <Autocomplete
              size="small"
              id="employment-status-dropdown"
              options={employmentStatusOptions}
              value={employmentStatusOptions.find(
                (option) => option.value === (values.employmentStatus ?? "Active"),
              ) ?? employmentStatusOptions[0]}
              onChange={(_, selectedStatus) => {
                setFieldValue("employmentStatus", selectedStatus?.value ?? "Active");
              }}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <AppTextField {...params} placeholder="Employment status" />
              )}
            />
          </Stack>
        )}

        <Stack
          direction={"row"}
          spacing={2}
          sx={{ justifyContent: "flex-end", marginBlockStart: 2 }}
        >
          <CustomisedButton
            label={formatMessage({ id: "BUTTON.RESET" })}
            variant="outlined"
            handleClick={() => {
              dispatch(setEmployeesFilter(initialFilterValues));
              props.handleClose();
            }}
          />
          <CustomisedButton type="submit" label={formatMessage({ id: "BUTTON.APPLY" })} />
        </Stack>
      </form>
    </FilterComponent>
  );
};
