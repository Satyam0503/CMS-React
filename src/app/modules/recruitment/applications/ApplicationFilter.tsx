import { ArrowDownward, Close } from "@mui/icons-material";
import {
  Autocomplete,
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Popover,
  Select,
  SelectChangeEvent,
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
import { ApplicantApplicationStatus } from "../../../../utils/constant/Constant";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import {
  resetFilter,
  setApplicationFilter,
} from "../../../Redux/Reducers/filterSlice";


interface PropsType {
  id?: string;
  open: boolean;
  handleClose: () => void;
  anchorEl: null | Element;
}

const initialFilterValues = {
  fromDate: null,
  toDate: null,
  jobTitles: [],
  status: [],
  minExperience: 0,
  maxExperience: 0,
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
  const [filters, setFilters] = useState<ApplicationFilterModel>(
    applicationFilters || initialFilterValues
  );
  const [jobList, setJobList] = useState<JobModal[]>([]);

  // const {values}= useFormik({
  //   initialValues:filters,
  //   validationSchema:applicationFilter,
  //   onSubmit:(values)=>{
  //     console.log(values);
  //   }
  // })

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

  useEffect(() => {
    setFilters(applicationFilters || initialFilterValues);
  }, [applicationFilters]);

  const handleChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const handleFilterStatusChange = (
    values: typeof ApplicantApplicationStatus
  ) => {
    setFilters({
      ...filters,
      status: values.map((item) => item.value),
    });
  };

  const handleJobChange = (values: typeof jobList) => {
    setFilters({
      ...filters,
      jobTitles: values.map((job) => job.jobId),
    });
  };

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
            <Stack spacing={1} divider={<Divider />}>
              <Stack spacing={1}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "FILTER.APPLIED_DATE" })}
                </Typography>
                <Stack spacing={1} direction={"row"} useFlexGap>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      {intl.formatMessage({ id: "FILTER.FROM" })}
                    </Typography>
                    <CustomisedDatePicker
                      value={filters.fromDate && dayjs(filters.fromDate)}
                      setValue={(date: Dayjs | null) => {
                        setFilters({ ...filters, fromDate: date });
                      }}
                    />
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      {intl.formatMessage({ id: "FILTER.TO" })}
                    </Typography>
                    <CustomisedDatePicker
                      value={filters.toDate && dayjs(filters.toDate)}
                      setValue={(date: Dayjs | null) => {
                        setFilters({ ...filters, toDate: date });
                      }}
                    />
                  </Stack>
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
                    filters.jobTitles.includes(job.jobId)
                  )}
                  onChange={(event, value) => {
                    handleJobChange(value);
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
                  {intl.formatMessage({ id: "FILTER.STATUS" })}
                </Typography>
                <Autocomplete
                  multiple
                  size="small"
                  id="status-dropdown"
                  options={ApplicantApplicationStatus}
                  disableCloseOnSelect
                  value={ApplicantApplicationStatus.filter((status) =>
                    filters.status.includes(status.value)
                  )}
                  onChange={(event, value) => {
                    handleFilterStatusChange(value);
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
                  {intl.formatMessage({ id: "FILTER.EXPERIENCE" })}
                </Typography>
                <Stack spacing={1} direction={"row"} useFlexGap>
                  <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {intl.formatMessage({ id: "FILTER.MIN_EXPERIENCE" })}
                    </Typography>
                    <TextField
                      fullWidth
                      value={filters.minExperience}
                      name="minExperience"
                      type="number"
                      onChange={handleChangeEvent}
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
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      {intl.formatMessage({ id: "FILTER.MAX_EXPERIENCE" })}
                    </Typography>
                    <TextField
                      fullWidth
                      value={filters.maxExperience}
                      name="maxExperience"
                      type="number"
                      onChange={handleChangeEvent}
                      inputProps={{
                        min: filters.minExperience,
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
            </Stack>
            <Stack
              direction={"row"}
              spacing={2}
              sx={{ justifyContent: "flex-end" }}
            >
              <CustomisedButton
                label="Reset"
                variant="outlined"
                handleClick={() => {
                  dispatch(resetFilter({ page: "application" }));
                }}
              />
              <CustomisedButton
                label="Apply"
                handleClick={() => {
                  dispatch(setApplicationFilter(filters));
                  handleClose();
                }}
              />
            </Stack>
        </Stack>
      </Box>
    </Popover>
  );
};
