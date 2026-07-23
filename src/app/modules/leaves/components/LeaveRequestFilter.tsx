import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Stack,
} from "@mui/material";
import { useFormik } from "formik"
import { leaveRequestFilterValidationSchema } from "../../../../utils/Schema/leaveManagementValidationSchemas"
import { LeaveRequestsFilterModel } from "../model"
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks"
import { resetFilter, setLeaveRequestFilter } from "../../../Redux/Reducers/filterSlice"
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker"
import { useIntl } from "react-intl"
import dayjs, { Dayjs } from "dayjs"
import { LeaveRequestStatusTypes, LeaveTypeConstant } from "../../../../utils/constant/Constant"
import CustomisedButton from "../../../shared/components/CustomisedButton"
import { AppSelect } from "../../../shared/components/ui";


export const initialLeaveRequestFilter: LeaveRequestsFilterModel = {
    startDate: null,
    endDate: null,
    status: null,
}

export const LeaveRequestFilter = () => {
    const dispatch = useAppDispatch();
    const { formatMessage: i } = useIntl();
    const appliedLeaveRequestFilter = useAppSelector(state => state.filters.leaveRequest);
    const { values, errors, handleSubmit, getFieldProps, setFieldValue, resetForm } =
        useFormik({
            initialValues: appliedLeaveRequestFilter ?? initialLeaveRequestFilter,
            enableReinitialize: true,
            validationSchema: leaveRequestFilterValidationSchema,
            onSubmit: (values) => {
                // console.log(values);
                
                dispatch(setLeaveRequestFilter(values));
            },
        });

    const handleResetFilter = () => {
        if (!appliedLeaveRequestFilter) {
            resetForm();
        }
        dispatch(resetFilter({
            page: "leaveRequest"
        }));
    }

    // console.log(errors);
    
    return (
        <form onSubmit={handleSubmit} className="leave-request-filter">
            <Box component="div" className="filter-fields">
                <FormControl className="mt-2" fullWidth>
                    <InputLabel id="leave-request-status" >{i({ id: "LEAVE.APPROVAL_STATUS" })}</InputLabel>
                    <AppSelect
                        labelId="leave-request-status"
                        label={i({ id: "LEAVE.APPROVAL_STATUS" })}
                        size="small"
                        {...getFieldProps("status")}
                        value={values.status ?? ""}
                    >
                        {
                            LeaveRequestStatusTypes.map(type => {
                                return <MenuItem value={type.value} key={type.id}>{i({ id: type.label })}</MenuItem>
                            })
                        }
                    </AppSelect>
                </FormControl>
                <CustomisedDatePicker
                    label={i({ id: "FORM.START_DATE" })}
                    value={Boolean(values.startDate)
                        ? dayjs(values.startDate)
                        : null
                    }
                    setValue={(date: Dayjs | null) => {
                        setFieldValue(
                            "startDate",
                            date?.startOf("day").toISOString()
                        );
                    }}
                />
                <CustomisedDatePicker
                    label={i({ id: "FORM.END_DATE" })}
                    value={Boolean(values.endDate)
                        ? dayjs(values.endDate)
                        : null
                    }
                    minDate={Boolean(values.startDate) ? dayjs(values.startDate) : undefined}
                    setValue={(date: Dayjs | null) => {
                        setFieldValue(
                            "endDate",
                            date?.startOf("day").toISOString()
                        );
                    }}
                />
            </Box>
            <Stack direction="row" className="gap-2" >
                <CustomisedButton
                    type="submit"
                    size="large"
                    className="mt-2"
                    label={i({ id: "BUTTON.FILTER", defaultMessage: "Filter" })}
                />
                <CustomisedButton
                    variant="outlined"
                    size="large"
                    className="mt-2"
                    label={i({ id: "BUTTON.CLEAR" })}
                    handleClick={handleResetFilter}
                />
            </Stack>
        </form>
    )

}