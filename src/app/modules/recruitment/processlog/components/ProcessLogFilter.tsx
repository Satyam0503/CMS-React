import {
  Autocomplete,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { processLogInitialFilter } from "../ProcessLog";
import { processLogFilterSchema } from "../../../../../utils/Schema/filterValidationSchema";
import CustomisedDatePicker from "../../../../shared/components/C_DatePicker";
import dayjs, { Dayjs } from "dayjs";
import CustomisedButton from "../../../../shared/components/C_Button";
import { resetFilter, setProcessLogFilter } from "../../../../Redux/Reducers/filterSlice";
import { CommentActionCategory } from "../../../../../utils/constant/Constant";
import { JobModal } from "../../models";
import { getAllJobVacancies } from "../../services";
import { FilterComponent } from "../../../../shared/components/FilterComponent";
import { FilterComponentProps } from "../../../../../utils/common_types";
import { getVacancyPayload } from "../../jobs/Jobs";

import { AppCheckbox, AppTextField } from "../../../../shared/components/ui";
const ProcessLogFilter: FC<FilterComponentProps> = (props) => {
  const { formatMessage: i } = useIntl();
  const processLogFilters = useAppSelector((state) => state.filters.processLog);
  const dispatch = useAppDispatch();
  const [jobList, setJobList] = useState<JobModal[]>([]);
  const { values, handleSubmit, setFieldValue } = useFormik({
    initialValues: processLogFilters ?? processLogInitialFilter,
    enableReinitialize: true,
    validationSchema: processLogFilterSchema,
    onSubmit: (value) => {
      dispatch(setProcessLogFilter(value))
      props.handleClose();
    },
  });

  useEffect(() => {
    const getActiveJobs = async () => {
      try {
        const response = await getAllJobVacancies({ ...getVacancyPayload, status: null });
        const { success, methodResults } = response.data;
        if (success) {
          setJobList(methodResults);
        }
      } catch (error) {
        console.error((error instanceof Error) ? error.message : error);
      }
    };
    getActiveJobs();
  }, []);

  return (
    <FilterComponent {...props}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={1}>
          <Stack>
            <Typography variant="caption">
              {i({ id: "APPLICATION.APPLIED_DATE" })}
            </Typography>

            <Stack direction="row" spacing={1}>
              <CustomisedDatePicker
                label={i({ id: "FROM" })}
                value={
                  values.filterFrom
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
                label={i({ id: "TO" })}
                value={
                  values.filterTo ? dayjs(values.filterTo) : null
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

          <Stack>
            <Typography variant="caption">
              {i({ id: "JOB.JOB_TITLE" })}
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
                <AppTextField {...params} placeholder={i({ id: "JOB.JOB_TITLE" })} />
              )}
            />
          </Stack>

          <Stack>
            <Typography variant="caption">
              {i({ id: "COMMENT.ACTION_CATEGORY" })}
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
              getOptionLabel={(option) => i({ id: option.label })}
              renderInput={(params) => (
                <AppTextField
                  {...params}
                  placeholder={i({
                    id: "COMMENT.ACTION_CATEGORY",
                  })}
                />
              )}
              renderOption={(props, option, state) => {
                return (
                  <li {...props}>
                    <AppCheckbox
                      key={option.id}
                      checked={state.selected}
                      sx={{ mr: 1 }}
                    />
                    <ListItemText primary={i({ id: option.label })} />
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
            label={i({ id: "BUTTON.RESET" })}
            variant="outlined"
            handleClick={() => {
              dispatch(resetFilter({ page: "processLog" }));
              props.handleClose();
            }}
          />
          <CustomisedButton
            type="submit"
            label={i({ id: "BUTTON.APPLY" })}
          />
        </Stack>
      </form>
    </FilterComponent>
  );
};

export { ProcessLogFilter };
