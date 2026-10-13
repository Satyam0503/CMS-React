import {
  FC } from "react";
import { HolidayFilterModel } from "../models";
import { useIntl } from "react-intl";
import { useAppDispatch,
  useAppSelector } from "../../../Redux/hooks";
import { useFormik } from "formik";
import { holidayFilterValidationSchema } from "../../../../utils/Schema/filterValidationSchema";
import { setHolidayFilter } from "../../../Redux/Reducers/filterSlice";
import { FilterComponent } from "../../../shared/components/FilterComponent";
import { Autocomplete,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import { HolidayTypes } from "../../../../utils/constant/Constant";
import CustomisedButton from "../../../shared/components/C_Button";
import dayjs, { Dayjs } from "dayjs";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";

import { AppCheckbox, AppTextField } from "../../../shared/components/ui";
interface PropsType {
    id?: string;
    open: boolean;
    handleClose: () => void;
    anchorEl: null | Element;
}

export const initialFilterValues: HolidayFilterModel = {
    occasionType: [],
    date: null,
}

export const HolidayFilter: FC<PropsType> = (props) => {
    const { formatMessage } = useIntl();
    const dispatch = useAppDispatch();
    const appliedHolFilters = useAppSelector(state => state.filters.holiday);
    const { values, handleSubmit, setFieldValue, setFieldTouched } =
        useFormik({
            initialValues: appliedHolFilters || initialFilterValues,
            enableReinitialize: true,
            validationSchema: holidayFilterValidationSchema,
            onSubmit: (values) => {
                dispatch(setHolidayFilter(values));
                props.handleClose();
            },
        });

    return (
        <FilterComponent {...props}>
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Typography variant="body1">
                        {formatMessage({ id: "HOLIDAY.NAME" })}
                    </Typography>
                    <Autocomplete
                        multiple
                        size="small"
                        id="holidayType-dropdown"
                        options={HolidayTypes}
                        disableCloseOnSelect
                        value={HolidayTypes.filter((hol) =>
                            values.occasionType.includes(hol.id)
                        )}
                        onChange={(_, selectedHolidayType) => {
                            setFieldValue(
                                "holidayType",
                                selectedHolidayType.map((hol) => hol.id)
                            );
                        }}
                        getOptionLabel={(option) => formatMessage({ id: option.label })}
                        renderInput={(params) => (
                            <AppTextField {...params} placeholder="HolidayType" />
                        )}
                        renderOption={(props, option, state) => {
                            return (
                                <li {...props}>
                                    <AppCheckbox
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
                <Stack className="mt-2">
                    <Typography variant="body1">
                        {formatMessage({ id: "HOLIDAY.DATE" })}
                    </Typography>
                    <CustomisedDatePicker
                        label={formatMessage({ id: "HOLIDAY.DATE" })}
                        value={values.date ? dayjs(values.date) : null}
                        setValue={(newDate: Dayjs | null) => {
                            setFieldValue("date", newDate?.format("YYYY-MM-DD"));
                            setFieldTouched("date", true);
                        }}
                    />
                </Stack>
                <Stack
                    direction={"row"}
                    spacing={2}
                    sx={{ justifyContent: "flex-end", marginBlockStart: 2 }}
                >
                    <CustomisedButton
                        label={formatMessage({ id: "BUTTON.RESET" })}
                        variant="outlined"
                        handleClick={() => {
                            dispatch(setHolidayFilter(initialFilterValues));
                            props.handleClose();
                        }}
                    />
                    <CustomisedButton
                        type="submit"
                        label={formatMessage({ id: "BUTTON.APPLY" })}
                    />
                </Stack>

            </form>
        </FilterComponent>
    )

}