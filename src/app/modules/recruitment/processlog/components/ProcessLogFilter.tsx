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
import { useFormik } from "formik";
import { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { processLogInitialFilter } from "../ProcessLog";
import { processLogFilterSchema } from "../../../../../utils/Schema/filterValidationSchema";
import CustomisedDatePicker from "../../../../shared/components/CustomisedDatePicker";
import dayjs, { Dayjs } from "dayjs";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { resetFilter, setProcessLogFilter } from "../../../../Redux/Reducers/filterSlice";
import { CommentActionCategory } from "../../../../../utils/constant/Constant";
import { JobModal } from "../../models";
import { getAllJobVacancies } from "../../services";

interface Props {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  handleClose: () => void;
}

const ProcessLogFilter: FC<Props> = ({ open, anchorEl, handleClose }) => {
  const intl = useIntl();
  const processLogFilters = useAppSelector((state) => state.filters.processLog);
  const dispatch = useAppDispatch();
  const [jobList, setJobList] = useState<JobModal[]>([]);
  const { values, handleSubmit, setFieldValue, initialValues } = useFormik({
    initialValues: processLogFilters ?? processLogInitialFilter,
    enableReinitialize: true,
    validationSchema: processLogFilterSchema,
    onSubmit: (value) => {
      dispatch(setProcessLogFilter(value))
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
      open={open}
      anchorEl={anchorEl}
      elevation={10}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            maxWidth: 450
          }
        }
      }}
    >
      <Box component={"div"} sx={{ padding: "1.5rem" }}>
        <Stack spacing={2}>
          <Stack
            direction={"row"}
            className="justify-content-between align-items-center"
          >
            <Typography variant="h6">
              {intl.formatMessage({ id: "FILTER" })}
            </Typography>
            <IconButton className="border-0" onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Stack>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "FILTER.APPLIED_DATE" })}
                </Typography>

                <Stack spacing={2} direction={"row"}>
                  <CustomisedDatePicker
                    label={intl.formatMessage({ id: "FILTER.FROM" })}
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
                    label={intl.formatMessage({ id: "FILTER.TO" })}
                    value={
                      Boolean(values.filterTo) ? dayjs(values.filterTo) : null
                    }
                    minDate={dayjs(values.filterFrom)}
                    maxDate={dayjs()}
                    setValue={(date: Dayjs | null) => {
                      setFieldValue(
                        "filterTo",
                        date?.startOf("day").toISOString()
                      );
                    }}
                  />
                </Stack>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "FILTER.JOB_TITLE" })}
                </Typography>
                <Autocomplete
                  size="small"
                  id="jobs-dropdown"
                  options={jobList}
                  value={jobList.find(job => job.title === values.jobRole) ?? null}
                  onChange={(event, selectedJobs) => {
                    setFieldValue("jobRole", selectedJobs?.title);
                  }}
                  getOptionLabel={(option) => option.title}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Jobs" />
                  )}
                />
              </Stack>

              <Stack spacing={1}>
                <Typography variant="body1">
                  {intl.formatMessage({ id: "FILTER.ACTION_CATEGORY" })}
                </Typography>
                <Autocomplete
                  multiple
                  size="small"
                  id="action-category"
                  options={CommentActionCategory}
                  disableCloseOnSelect
                  value={CommentActionCategory.filter((action) =>
                    values.activityCategory.includes(action.value)
                  )}
                  onChange={(event, value) => {
                    setFieldValue(
                      "activityCategory",
                      value.map((item) => item.value)
                    );
                  }}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={intl.formatMessage({
                        id: "FILTER.CATEGORY",
                      })}
                    />
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
            </Stack>
            <Stack
              direction={"row"}
              spacing={2}
              sx={{ justifyContent: "flex-end", marginBlockStart: 2 }}
            >
              <CustomisedButton
                label={intl.formatMessage({ id: "BUTTON.RESET" })}
                variant="outlined"
                handleClick={() => {
                  dispatch(resetFilter({ page: "processLog" }));
                  handleClose();
                }}
              />
              <CustomisedButton
                type="submit"
                label={intl.formatMessage({ id: "BUTTON.APPLY" })}
              />
            </Stack>
          </form>
        </Stack>
      </Box>
    </Popover>
  );
};

export { ProcessLogFilter };
