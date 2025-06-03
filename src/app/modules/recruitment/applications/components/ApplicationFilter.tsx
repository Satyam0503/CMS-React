import { ArrowDropDown, ArrowDropUp, Close } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Checkbox,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { FormattedMessage, useIntl } from "react-intl";
import CustomisedDatePicker from "../../../../shared/components/CustomisedDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { getAllJobVacancies } from "../../services";
import {
  ApplicantApplicationStatus,
  ApplicantStatusConstant,
  TimePeriodOptions,
} from "../../../../../utils/constant/Constant";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { setApplicationFilter } from "../../../../Redux/Reducers/filterSlice";
import { useFormik } from "formik";
import { applicationFilterSchema } from "../../../../../utils/Schema/filterValidationSchema";
import { addCurrentTimeToDate, blockInvalidCharOnNumberField } from "../../../../../utils/common";
import { ApplicationFilterModel, JobModal } from "../../models";
import { FilterComponent } from "../../../../shared/components/FilterComponent";

interface PropsType {
  id?: string;
  open: boolean;
  handleClose: () => void;
  anchorEl: null | Element;
}

export const initialFilterValues: ApplicationFilterModel = {
  filterFrom: null,
  filterTo: null,
  vacancyIds: [],
  activityTypes: [],
  status: [],
  minExperience: "",
  maxExperience: "",
};

export const ApplicationFilter: FC<PropsType> = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useAppDispatch();
  const [optionAnchorEl, setOptionAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const applicationFilters = useAppSelector(
    (state) => state.filters.application
  );
  const [jobList, setJobList] = useState<JobModal[]>([]);
  const isTimeOptionOpen = Boolean(optionAnchorEl);

  const { values, errors, handleSubmit, getFieldProps, setFieldValue } =
    useFormik({
      initialValues: applicationFilters || initialFilterValues,
      enableReinitialize: true,
      validationSchema: applicationFilterSchema,
      onSubmit: (values) => {
        dispatch(setApplicationFilter(values));
        props.handleClose();
      },
    });

  useEffect(() => {
    const getActiveJobs = async () => {
      try {
        const response = await getAllJobVacancies(null, true);
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

  const handleTimeOptionMenuClose = () => {
    setOptionAnchorEl(null);
  };
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setOptionAnchorEl(event.currentTarget);
  };

  const handleTimePeriodChange = (
    index: number,
    filters: ApplicationFilterModel,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const currentFilters = Object.assign({}, filters);
    const selectedTimePeriod = TimePeriodOptions[index];
    const updatedFromDate = dayjs()
      .startOf("day")
      .subtract(selectedTimePeriod.value, "day")
      .toISOString();
    const updatedToDate = dayjs(Date.now()).toISOString();
    currentFilters.filterFrom = updatedFromDate;
    currentFilters.filterTo = updatedToDate;
    dispatch(setApplicationFilter(currentFilters));
    handleTimeOptionMenuClose();
    props.handleClose();
  };

  return (
    <FilterComponent {...props}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Stack>
            <Stack
              direction={"row"}
              sx={{ justifyContent: "space-between" }}
            >
              <Typography variant="body1">
                {formatMessage({ id: "FILTER.APPLIED_DATE" })}
              </Typography>
              <Stack
                direction={"row"}
                sx={{ alignItems: "center" }}
                onClick={handleClick}
              >
                <Typography variant="body2" sx={{ cursor: "pointer" }}>
                  from Date - to date
                </Typography>
                {isTimeOptionOpen ? <ArrowDropUp /> : <ArrowDropDown />}
              </Stack>
              <Menu
                id="time-period-option"
                anchorEl={optionAnchorEl}
                open={isTimeOptionOpen}
                onClose={handleTimeOptionMenuClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                {TimePeriodOptions.map((option, index) => (
                  <MenuItem
                    key={option.id}
                    onClick={() => {
                      handleTimePeriodChange(index, values, setFieldValue);
                    }}
                  >
                    {formatMessage({ id: option.name })}
                  </MenuItem>
                ))}
              </Menu>
            </Stack>

            <Stack spacing={2} direction={"row"}>
              <CustomisedDatePicker
                label={formatMessage({ id: "FILTER.FROM" })}
                value={
                  Boolean(values.filterFrom)
                    ? dayjs(values.filterFrom)
                    : null
                }
                maxDate={dayjs()}
                setValue={(date: Dayjs | null) => {
                  setFieldValue(
                    "filterFrom",
                    date?.startOf("day").toISOString()
                  );
                }}
              />
              <CustomisedDatePicker
                label={formatMessage({ id: "FILTER.TO" })}
                value={
                  Boolean(values.filterTo) ? dayjs(values.filterTo) : null
                }
                minDate={dayjs(values.filterFrom)}
                maxDate={dayjs()}
                setValue={(date: Dayjs | null) => {
                  setFieldValue("filterTo", addCurrentTimeToDate(date));
                }}
              />
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="body1">
              {formatMessage({ id: "FILTER.JOB_TITLE" })}
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
              {formatMessage({ id: "FILTER.APPLICATION_STATUS" })}
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
              getOptionLabel={(option) => formatMessage({ id: option.label })}
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
                    <ListItemText primary={formatMessage({ id: option.label })} />
                  </li>
                );
              }}
            />
          </Stack>
          <Stack spacing={1}>
            <Typography variant="body1">
              {formatMessage({ id: "FILTER.STATUS" })}
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
                <TextField {...params} placeholder="Applicant Status" />
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
              {formatMessage({ id: "FILTER.EXPERIENCE" })}
            </Typography>
            <Stack spacing={1} direction={"row"} useFlexGap>
              <TextField
                fullWidth
                error={Boolean(errors.minExperience)}
                label={formatMessage({ id: "FILTER.MIN_EXPERIENCE" })}
                type="number"
                {...getFieldProps("minExperience")}
                inputProps={{
                  min: 0,
                }}
                onKeyDown={(e) => {
                  blockInvalidCharOnNumberField(e);
                }}
                onWheel={(e) => {
                  (e.target as HTMLInputElement).blur();
                }}
              />
              <TextField
                label={formatMessage({ id: "FILTER.MAX_EXPERIENCE" })}
                fullWidth
                type="number"
                required={Boolean(values.minExperience)}
                error={Boolean(errors.maxExperience)}
                {...getFieldProps("maxExperience")}
                inputProps={{
                  min: values.minExperience || 0,
                }}
                onKeyDown={(e) => {
                  blockInvalidCharOnNumberField(e);
                }}
                onWheel={(e) => {
                  (e.target as HTMLInputElement).blur();
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
              props.handleClose();
            }}
          />
          <CustomisedButton type="submit" label="Apply" />
        </Stack>
      </form>
    </FilterComponent>
  );
};
