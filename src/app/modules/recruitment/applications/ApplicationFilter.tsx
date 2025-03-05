import { Close } from "@mui/icons-material";
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
import { FC, useEffect, useState } from "react";
import CustomisedButton from "../../components/CustomisedButton";
import { useIntl } from "react-intl";
import CustomisedDatePicker from "../../components/CustomisedDatePicker";
import dayjs, { Dayjs } from "dayjs";
import {
  ApplicationFilterModel,
  JobModal,
} from "../../../../utils/common_types";
import { getAllJobVacancies } from "../services";
import {
  ApplicantApplicationStatus,
  ApplicantStatusConstant,
} from "../../../../utils/constant/Constant";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import {
  setApplicationFilter,
} from "../../../Redux/Reducers/filterSlice";
import { useFormik } from "formik";
import { applicationFilterSchema } from "../../../../utils/Schema/filterValidationSchema";

interface PropsType {
  id?: string;
  open: boolean;
  handleClose: () => void;
  anchorEl: null | Element;
}

export const initialFilterValues :ApplicationFilterModel = {
  filterFrom: null,
  filterTo: null,
  vacancyIds: [],
  activityTypes: [],
  status: [],
  minExperience: "",
  maxExperience: "",
};

export const ApplicationFilter: FC<PropsType> = ({
  id,
  open,
  handleClose,
  anchorEl,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const applicationFilters = useAppSelector(
    (state) => state.filters.application
  );

  const [jobList, setJobList] = useState<JobModal[]>([]);

  const { values, errors, handleSubmit, getFieldProps, setFieldValue } =
    useFormik({
      initialValues: applicationFilters || initialFilterValues,
      enableReinitialize: true,
      validationSchema: applicationFilterSchema,
      onSubmit: (values) => {
        dispatch(setApplicationFilter(values));
        handleClose();
      },
    });
    
  useEffect(() => {
    const getActiveJobs = async () => {
      try {
        const response = await getAllJobVacancies();
        const { success, methodResults } = response.data;
        if (success) {
          setJobList(methodResults);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };
    getActiveJobs();
  }, []);

  return (
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
              {intl.formatMessage({ id: "FILTER" })}
            </Typography>
            <IconButton className="border-0" onClick={handleClose}>
              <Close />{" "}
            </IconButton>
          </Stack>
          <form onSubmit={handleSubmit}>
            <Stack spacing={1.5}>
              <Stack spacing={1}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "FILTER.APPLIED_DATE" })}
                </Typography>
                <Stack spacing={2} direction={"row"}>
                  <CustomisedDatePicker
                    label={intl.formatMessage({ id: "FILTER.FROM" })}
                    value={values.filterFrom && dayjs(values.filterFrom)}
                    maxDate={dayjs()}
                    setValue={(date: Dayjs | null) => {
                      setFieldValue("filterFrom", date);
                    }}
                  />

                  <CustomisedDatePicker
                    label={intl.formatMessage({ id: "FILTER.TO" })}
                    value={values.filterTo && dayjs(values.filterTo)}
                    minDate={dayjs(values.filterFrom)}
                    setValue={(date: Dayjs | null) => {
                      setFieldValue("filterTo", date);
                    }}
                  />
                </Stack>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "FILTER.JOB_TITLE" })}
                </Typography>
                <Autocomplete
                  multiple
                  size="small"
                  id="jobs-dropdown"
                  options={jobList}
                  disableCloseOnSelect
                  value={jobList.filter((job) =>
                    values.vacancyIds.includes(job.jobId)
                  )}
                  onChange={(event, selectedJobs) => {
                    setFieldValue(
                      "vacancyIds",
                      selectedJobs.map((job) => job.jobId)
                    );
                  }}
                  getOptionLabel={(option) => option.title}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Jobs" />
                  )}
                  renderOption={(props, option, state) => {
                    return (
                      <li {...props}>
                        <Checkbox
                          key={option.jobId}
                          checked={state.selected}
                          sx={{ mr: 1 }}
                        />
                        <ListItemText primary={option.title} />
                      </li>
                    );
                  }}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "FILTER.APPLICATION_STATUS" })}
                </Typography>
                <Autocomplete
                  multiple
                  size="small"
                  id="application-status-dropdown"
                  options={ApplicantApplicationStatus}
                  disableCloseOnSelect
                  value={ApplicantApplicationStatus.filter((status) =>
                    values.activityTypes.includes(status.value)
                  )}
                  onChange={(event, value) => {
                    setFieldValue(
                      "activityTypes",
                      value.map((item) => item.value)
                    );
                  }}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Status" />
                  )}
                  renderOption={(props, option, state) => {
                    return (
                      <li {...props}>
                        <Checkbox
                          key={option.id}
                          checked={state.selected}
                          sx={{ mr: 1 }}
                        />
                        <ListItemText primary={option.label} />
                      </li>
                    );
                  }}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "FILTER.STATUS" })}
                </Typography>
                <Autocomplete
                  multiple
                  size="small"
                  id="status-dropdown"
                  options={ApplicantStatusConstant}
                  disableCloseOnSelect
                  value={ApplicantStatusConstant.filter((status) =>
                    values.status.includes(status.value)
                  )}
                  onChange={(event, value) => {
                    setFieldValue(
                      "status",
                      value.map((item) => item.value)
                    );
                  }}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Status" />
                  )}
                  renderOption={(props, option, state) => {
                    return (
                      <li {...props}>
                        <Checkbox
                          key={option.id}
                          checked={state.selected}
                          sx={{ mr: 1 }}
                        />
                        <ListItemText primary={option.label} />
                      </li>
                    );
                  }}
                />
              </Stack>

              <Stack spacing={2}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "FILTER.EXPERIENCE" })}
                </Typography>
                <Stack spacing={1} direction={"row"} useFlexGap>
                  <TextField
                    fullWidth
                    error={Boolean(errors.minExperience)}
                    label={intl.formatMessage({ id: "FILTER.MIN_EXPERIENCE" })}
                    type="number"
                    {...getFieldProps("minExperience")}
                    inputProps={{
                      min: 0,
                    }}
                    onKeyDown={(e) => {
                      const restrictedKeys = ["-", "+", "e"];
                      if (restrictedKeys.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <TextField
                    label={intl.formatMessage({ id: "FILTER.MAX_EXPERIENCE" })}
                    fullWidth
                    type="number"
                    required={ Boolean(values.minExperience) }
                    error={Boolean(errors.maxExperience)}
                    {...getFieldProps("maxExperience")}
                    inputProps={{
                      min: values.minExperience || 0,
                    }}
                    onKeyDown={(e) => {
                      const restrictedKeys = ["-", "+", "e"];
                      if (restrictedKeys.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Stack>
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
                  dispatch(setApplicationFilter(initialFilterValues));
                  handleClose();
                }}
              />
              <CustomisedButton type="submit" label="Apply" />
            </Stack>
          </form>
        </Stack>
      </Box>
    </Popover>
  );
};
