import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Stack,
} from "@mui/material";
import { useEffect } from "react";
import { useFormik } from "formik"
import { leaveRequestFilterValidationSchema } from "../../../../utils/Schema/leaveManagementValidationSchemas"
import { LeaveRequestsFilterModel } from "../model"
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks"
import { resetFilter, setLeaveRequestFilter } from "../../../Redux/Reducers/filterSlice"
import CustomisedDatePicker from "../../../shared/components/C_DatePicker"
import { useIntl } from "react-intl"
import dayjs, { Dayjs } from "dayjs"
import { LeaveRequestStatusTypes, LeaveTypeConstant } from "../../../../utils/constant/Constant"
import CustomisedButton from "../../../shared/components/C_Button"
import { AppSelect } from "../../../shared/components/ui";
import { useDebounce } from "../../../hooks/useDebounce";


export const initialLeaveRequestFilter: LeaveRequestsFilterModel = {
    startDate: null,
    endDate: null,
    status: null,
}

export const LeaveRequestFilter = () => {
    const dispatch = useAppDispatch();
    const { formatMessage: i } = useIntl();
    const appliedLeaveRequestFilter = useAppSelector(state => state.filters.leaveRequest);
    const { values, errors, getFieldProps, setFieldValue, resetForm } =
        useFormik({
            initialValues: appliedLeaveRequestFilter ?? initialLeaveRequestFilter,
            enableReinitialize: true,
            validationSchema: leaveRequestFilterValidationSchema,
            onSubmit: (values) => {
                // console.log(values);
                
                dispatch(setLeaveRequestFilter(values));
            },
        });

    const debouncedValues = useDebounce(values, 500);

    useEffect(() => {
        // only dispatch when validation passes
        if (Object.keys(errors).length === 0) {
            const statusValue = (debouncedValues.status as unknown) === "" ? null : debouncedValues.status;
            dispatch(
                setLeaveRequestFilter({
                    startDate: debouncedValues.startDate ?? null,
                    endDate: debouncedValues.endDate ?? null,
                    status: statusValue ?? null,
                })
            );
        }
    }, [debouncedValues, errors, dispatch]);

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
        <Box component="div" className="leave-request-filter" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" }, gap: 1.5, alignItems: "end" }}>
            <Box component="div" className="filter-fields" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: 1.25, minWidth: 0 }}>
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
            <Stack direction="row" className="gap-2" sx={{ width: { xs: "100%", md: "auto" } }}>
                <CustomisedButton
                    variant="outlined"
                    size="large"
                    className="mt-2"
                    label={i({ id: "BUTTON.CLEAR" })}
                    handleClick={handleResetFilter}
                    sx={{ width: { xs: "100%", md: "auto" }, minWidth: { md: 96 } }}
                />
            </Stack>
        </Box>
    )

}
