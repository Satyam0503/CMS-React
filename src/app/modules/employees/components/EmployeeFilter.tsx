import { EmployeeFilterModel } from "../models";
import { DepartmentModel } from "../../dashboard/model";
import { FC, useEffect, useState } from "react";
import { Close } from "@mui/icons-material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { setEmployeesFilter } from "../../../Redux/Reducers/filterSlice";
import { getAllDepartmentInfo } from "../../dashboard/dashboardservices";
import { useFormik } from "formik";
import { departmentFilterSchema } from "../../../../utils/Schema/filterValidationSchema";

import {
  Autocomplete,
  Box,
  Checkbox,
  IconButton,
  ListItemText,
  Popover,
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
import { FormattedMessage, useIntl } from "react-intl";

export const initialFilterValues: EmployeeFilterModel = {
  departmentId: [],
};

export const EmployeeFilter: FC<PropsType> = ({
  id,
  open,
  handleClose,
  anchorEl,
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useAppDispatch();
  const [deptList, setDeptList] = useState<DepartmentModel[]>([]);
  const departmentFilters = useAppSelector(
    (state) => state.filters.employee
   );
  const { values, errors, handleSubmit, getFieldProps, setFieldValue } =
    useFormik({
      initialValues: departmentFilters || initialFilterValues,
      enableReinitialize: true,
      validationSchema: departmentFilterSchema,
      onSubmit: (values) => {
        dispatch(setEmployeesFilter(values));
        handleClose();
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
    <>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        elevation={10}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box component={"div"} sx={{ padding: "1.5rem" }}>
          <Stack spacing={2}>
            <Stack
              direction={"row"}
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography variant="h6">
                {formatMessage({ id: "FILTER" })}
              </Typography>
              <IconButton className="border-0" onClick={handleClose}>
                <Close />{" "}
              </IconButton>
            </Stack>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Stack spacing={1}>
                  <Typography variant="body1">
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
                    onChange={(event, selectedDept) => {
                      setFieldValue(
                        "departmentId",
                        selectedDept.map((dept) => dept.departmentId)
                      );
                    }}
                    getOptionLabel={(option) => option.titles[0].label}
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
                          <ListItemText primary={option.titles[0].label} />
                        </li>
                      );
                    }}
                  />
                </Stack>
              </Stack>
              <Stack
                direction={"row"}
                spacing={2}
                sx={{ justifyContent: "flex-end", marginBlockStart: 2 }}
              >
                <CustomisedButton
                  label="Reset"
                  variant="outlined"
                  handleClick={() => {
                    dispatch(setEmployeesFilter(initialFilterValues));
                    handleClose();
                  }}
                />
                <CustomisedButton type="submit" label="Apply" />
              </Stack>
            </form>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};
