import { FC } from "react"
import { FilterComponent } from "../../../../shared/components/FilterComponent"
import { FilterComponentProps } from "../../../../../utils/common_types"
import { useFormik } from "formik";
import { Autocomplete, Checkbox, ListItemText, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { JobType } from "../../../../../utils/constant/Constant";
import { resetFilter, setJobsFilter } from "../../../../Redux/Reducers/filterSlice";
import { JobFilterValidationSchema } from "../../../../../utils/Schema/filterValidationSchema";
import { JobsFilterModel } from "../../models";

export const jobStatusDecoder: { [index: number]: boolean } = {
    1: true,
    0: false,
}

export const initialJobFilter: JobsFilterModel = {
    jobTypes: [],
    status: null
}

export const JobFilter: FC<FilterComponentProps> = (props) => {
    const jobFilters = useAppSelector(state => state.filters.jobs);
    const { formatMessage: i } = useIntl();
    const dispatch = useAppDispatch();
    const { values, handleSubmit, setFieldValue } = useFormik({
        initialValues: jobFilters ?? initialJobFilter,
        enableReinitialize: true,
        validationSchema: JobFilterValidationSchema,
        onSubmit: (value) => {
            dispatch(setJobsFilter(value))
            props.handleClose();
        },
    });
    return (
        <FilterComponent {...props}>
            <form onSubmit={handleSubmit}>
                <Stack spacing={1}>
                    <Stack>
                        <Stack>
                            <Typography variant="caption">
                                {i({ id: "STATUS" })}
                            </Typography>
                        </Stack>
                        <Select value={values.status ?? ""} onChange={(e) => {
                            const value = Number(e.target.value);
                            setFieldValue("status", value);
                        }}>
                            <MenuItem value={1}>{i({ id: "ACTIVE" })}</MenuItem>
                            <MenuItem value={0}>{i({ id: "INACTIVE" })}</MenuItem>
                        </Select>
                    </Stack>
                    <Stack >
                        <Typography variant="caption">
                            {i({ id: "JOB.JOB_TYPES" })}
                        </Typography>
                        <Autocomplete
                            multiple
                            size="small"
                            id="job-Types-dropdown"
                            options={JobType}
                            disableCloseOnSelect
                            value={JobType.filter((type) =>
                                values.jobTypes.includes(type.value)
                            )}
                            onChange={(event, value) => {
                                setFieldValue(
                                    "jobTypes",
                                    value.map((item) => item.value)
                                );
                            }}
                            getOptionLabel={(option) => i({ id: option.label })}
                            renderInput={(params) => (
                                <TextField {...params} placeholder={i({ id: "JOB.JOB_TYPES" })} />
                            )}
                            renderOption={(props, option, state) => {
                                return (
                                    <li {...props}>
                                        <Checkbox
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
                            dispatch(resetFilter({ page: "jobs" }));
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
}