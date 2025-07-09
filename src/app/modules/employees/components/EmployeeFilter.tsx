import { EmployeeFilterModel } from "../models";
import { DepartmentModel } from "../../dashboard/model";
import { FC, useEffect, useState } from "react";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { setEmployeesFilter } from "../../../Redux/Reducers/filterSlice";
import { getAllDepartmentInfo } from "../../dashboard/dashboardservices";
import { useFormik } from "formik";

import {
  Autocomplete,
  Checkbox,
  Chip,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

interface PropsType {
  id?: string;
  open: boolean;
  handleClose: () => void;
  anchorEl: null | Element;
}
import { useIntl } from "react-intl";
import { employeeFilterValidationSchema } from "../../../../utils/Schema/filterValidationSchema";
import { Gender } from "../../../../utils/constant/Constant";
import { FilterComponent } from "../../../shared/components/FilterComponent";

export const initialFilterValues: EmployeeFilterModel = {
  departmentId: [],
  gender: [],
};

export const EmployeeFilter: FC<PropsType> = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useAppDispatch();
  const [deptList, setDeptList] = useState<DepartmentModel[]>([]);
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

  useEffect(() => {
    const getAllDepartments = async () => {
      try {
        const response = await getAllDepartmentInfo();
        const { success, methodResults } = response.data;
        if (success) {
          setDeptList(methodResults);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };
    getAllDepartments();
  }, []);


  return (
    <FilterComponent {...props}>
      <form onSubmit={handleSubmit}>
        <Stack>
          <Typography variant="caption">
            {formatMessage({ id: "FILTER.DEPT_TITLE" })}
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
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField {...params} placeholder="Departments" />
            )}
            renderOption={(props, option, state) => {
              return (
                <li {...props}>
                  <Checkbox
                    key={option.departmentId}
                    checked={state.selected}
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary={option.label} />
                </li>
              );
            }}
          />
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
              <TextField {...params} placeholder={formatMessage({ id: "FORM.GENDER" })} />
            )}
            renderOption={(props, option, state) => {
              return (
                <li {...props}>
                  <Checkbox
                    key={option.id}
                    checked={state.selected}
                    sx={{ mr: 1 }}
                  />
                  <ListItemText primary={formatMessage({ id: option.label })} />
                </li>
              );
            }}
            renderTags={(value, getTagProps) => (
              value.map((option, index: number) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip label={formatMessage({ id: option.label })} size="small" key={key} {...tagProps} />
                );
              })
            )}
          />
        </Stack>

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
