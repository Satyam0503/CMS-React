import {
  FC,
  useState } from "react";
import { FilterComponent } from "../../../shared/components/FilterComponent"
import CustomisedButton from "../../../shared/components/C_Button";
import { useIntl } from "react-intl";
import { Autocomplete,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { NoticeTypes, TimePeriodOptions } from "../../../../utils/constant/Constant";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { NoticeBoardFilterModel } from "../models";
import { useFormik } from "formik";
import { noticeBoardFilterSchema } from "../../../../utils/Schema/filterValidationSchema";
import { addCurrentTimeToDate, initialNoticeFilter } from "../../../../utils/common";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { setNoticeBoardFilter } from "../../../Redux/Reducers/filterSlice";
import { FilterComponentProps } from "../../../../utils/common_types";


import { AppCheckbox, AppTextField } from "../../../shared/components/ui";
export const NoticeBoardFilter: FC<FilterComponentProps> = (props) => {
    const { formatMessage } = useIntl();
    const [optionAnchorEl, setOptionAnchorEl] = useState<null | HTMLElement>(null);
    const isTimeOptionOpen = Boolean(optionAnchorEl);
    const noticeBoardFilter = useAppSelector(state => state.filters.noticeBoard);
    const dispatch = useAppDispatch();

    const { values, handleSubmit, setFieldValue } =
        useFormik({
            initialValues: noticeBoardFilter ?? initialNoticeFilter,
            enableReinitialize: true,
            validationSchema: noticeBoardFilterSchema,
            onSubmit: (values) => {
                dispatch(setNoticeBoardFilter(values));
                props.handleClose();
            },
        });

    const handleTimeOptionMenuClose = () => {
        setOptionAnchorEl(null);
    };
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setOptionAnchorEl(event.currentTarget);
    };

    const handleTimePeriodChange = (
        index: number,
        filters: NoticeBoardFilterModel,
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
        dispatch(setNoticeBoardFilter(currentFilters));
        handleTimeOptionMenuClose();
        props.handleClose();
    };

    return <FilterComponent {...props}>
        <form onSubmit={handleSubmit} >
            <Stack>
                <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", alignItems: "flex-end" }}
                >
                    <Typography variant="caption">
                        {formatMessage({ id: "NOTICE.POSTED_DATE" })}
                    </Typography>
                    <Stack
                        direction="row"
                        sx={{ alignItems: "center" }}
                        onClick={handleClick}
                    >
                        <Typography variant="body2" sx={{ cursor: "pointer" }}>
                            {formatMessage({ id: "DATETIME.FROM_TO_DATE" })}
                        </Typography>
                        {isTimeOptionOpen ? <ArrowDropUp /> : <ArrowDropDown />}
                    </Stack>
                    <Menu
                        id="time-period-option"
                        anchorEl={optionAnchorEl}
                        open={isTimeOptionOpen}
                        onClose={handleTimeOptionMenuClose}
                        slotProps={{
                            list: {
                                "aria-labelledby": "basic-button",
                            }
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
                                    handleTimePeriodChange(index, values,);
                                }}
                            >
                                {formatMessage({ id: option.name })}
                            </MenuItem>
                        ))}
                    </Menu>
                </Stack>

                <Stack className="gap-1">
                    <CustomisedDatePicker
                        label={formatMessage({ id: "FROM" })}
                        value={values.filterFrom ? dayjs(values.filterFrom) : null}
                        maxDate={dayjs()}
                        setValue={(date: Dayjs | null) => {
                            setFieldValue(
                                "filterFrom",
                                date?.startOf("day").toISOString()
                            );
                        }}
                    />
                    <CustomisedDatePicker
                        label={formatMessage({ id: "TO" })}
                        value={values.filterTo ? dayjs(values.filterTo) : null}
                        minDate={dayjs(values.filterFrom)}
                        maxDate={dayjs()}
                        setValue={(date: Dayjs | null) => {
                            setFieldValue("filterTo", addCurrentTimeToDate(date));
                        }}
                    />
                </Stack>
            </Stack>
            <Stack className="mt-2">
                <Typography variant="caption">
                    {formatMessage({ id: "NOTICE.TYPE" })}
                </Typography>
                <Autocomplete
                    multiple
                    size="small"
                    id="notice-type-dropdown"
                    options={NoticeTypes}
                    disableCloseOnSelect
                    value={NoticeTypes.filter((type) =>
                        values.noticeType.includes(type.value)
                    )}
                    onChange={(_, selectedNoticeType) => {
                        setFieldValue(
                            "noticeType",
                            selectedNoticeType.map((type) => type.value)
                        );
                    }}
                    getOptionLabel={(option) => formatMessage({ id: option.label })}
                    renderInput={(params) => (
                        <AppTextField {...params} placeholder={formatMessage({ id: "NOTICE.TYPE" })} />
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
            <Stack
                direction={"row"}
                spacing={2}
                sx={{ justifyContent: "flex-end", marginBlockStart: 2 }}
            >
                <CustomisedButton
                    label={formatMessage({ id: "BUTTON.RESET" })}
                    variant="outlined"
                    handleClick={() => {
                        dispatch(setNoticeBoardFilter(initialNoticeFilter));
                        props.handleClose();
                    }}
                />
                <CustomisedButton type="submit" label={formatMessage({ id: "BUTTON.APPLY" })} />
            </Stack>
        </form>
    </FilterComponent>
}