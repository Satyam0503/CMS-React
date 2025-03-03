import { ArrowDownward, Close } from "@mui/icons-material";
import {
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
  ApplicationsFilterType,
  JobModal,
} from "../../../../utils/common_types";
import { getAllJobVacancies } from "../services";
import { applicationStatusMapper } from "../../../../utils/common";
import { ApplicantApplicationStatus } from "../../../../utils/constant/Constant";

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
  const [filters, setFilters] = useState<ApplicationsFilterType>(initialFilterValues);
  const [jobList, setJobList] = useState<JobModal[]>([]);

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

  const handleJobChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFilters({
      ...filters,
      jobTitles: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleStatusChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setFilters({
      ...filters,
      status: value as number[],
    });
  };

  const handleChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const handleResetFilter = ()=>{
    setFilters({
        ...initialFilterValues
    })
  }

  console.log(filters);
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
        <Stack spacing={2} >
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
          <Stack spacing={1} divider={<Divider  />}>
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
                    value={filters.fromDate}
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
                    value={filters.toDate}
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
              <Select
                multiple
                displayEmpty
                id="application-filter"
                value={filters.jobTitles}
                onChange={handleJobChange}
                renderValue={(selectedJob) => {
                  if (selectedJob.length === 0) {
                    return (
                      <Typography variant="body2" sx={{ fontSize: "14px" }}>
                        Select Jobs
                      </Typography>
                    );
                  }
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selectedJob.map((value) => (
                        <Chip
                          key={value}
                          label={
                            jobList.find((job) => job.jobId === value)?.title
                          }
                        />
                      ))}
                    </Box>
                  );
                }}
              >
                {jobList.map((job) => (
                  <MenuItem key={job.jobId} value={job.jobId}>
                    <Checkbox checked={filters.jobTitles.includes(job.jobId)} sx={{marginInlineEnd:1}} />
                    <ListItemText primary={job.title} />
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="body1">
                {intl.formatMessage({ id: "FILTER.STATUS" })}
              </Typography>
              <Autocomplete
                multiple
                disableClearable
                size="small"               
                id="status-dropdown"
                options={ApplicantApplicationStatus}
                disableCloseOnSelect
                getOptionLabel={(option)=>option.label}
                renderInput={(params)=>(
                    <TextField {...params} placeholder="Status" />
                )}
              />


              {/* <Select
                displayEmpty
                multiple
                value={filters.status}
                input={<OutlinedInput/>}
                onChange={handleStatusChange}
                renderValue={(selectedStatus) => {
                  if (selectedStatus.length === 0) {
                    return (
                      <Typography variant="body2" sx={{ fontSize: "14px" }}>
                        Select Status
                      </Typography>
                    );
                  }
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selectedStatus.map((status) => (
                        <Chip
                          key={status}
                          label={applicationStatusMapper[status]}
                          onDelete={handleJobDelete}
                        />
                      ))}
                    </Box>
                  );
                }}
              >
                {ApplicantApplicationStatus.map((status) => (
                  <MenuItem key={status.id} value={status.value}>
                    <Checkbox checked={filters.status.includes(status.value)} sx={{marginInlineEnd:1}}/>
                    <ListItemText primary={status.label} />
                  </MenuItem>
                ))}
              </Select> */}
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
                      min: 0,
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
              handleClick={handleResetFilter}
            />
            <CustomisedButton label="Apply" />
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
};


// const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
// const checkedIcon = <CheckBoxIcon fontSize="small" />;

// export default function CheckboxesTags() {
//   return (
//     <Autocomplete
//       multiple
//       id="checkboxes-tags-demo"
//       options={top100Films}
//       disableCloseOnSelect
//       getOptionLabel={(option) => option.title}
//       renderOption={(props, option, { selected }) => {
//         const { key, ...optionProps } = props;
//         return (
//           <li key={key} {...optionProps}>
//             <Checkbox
//               icon={icon}
//               checkedIcon={checkedIcon}
//               style={{ marginRight: 8 }}
//               checked={selected}
//             />
//             {option.title}
//           </li>
//         );
//       }}
//       style={{ width: 500 }}
//       renderInput={(params) => (
//         <TextField {...params} label="Checkboxes" placeholder="Favorites" />
//       )}
//     />
//   );
// }
