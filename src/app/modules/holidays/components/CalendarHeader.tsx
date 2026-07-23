import {
  Box,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import { Dayjs } from "dayjs";
import { useIntl } from "react-intl";
import { CalendarItemType } from "../models";
import { CALENDAR_ITEM } from "../../../../utils/enums";

import { AppIconButton, AppSelect } from "../../../shared/components/ui";
type Props = {
  selectedDate: Dayjs | null;
  handleSelectedDateChange: (date: Dayjs | null) => void;
  category: CalendarItemType;
  handleCategoryChange: (category: CalendarItemType) => void;
};

export default function CalendarHeader(props: Props) {
  const { formatMessage: i } = useIntl();

  const increaseMonth = () => {
    if (props.selectedDate)
      props.handleSelectedDateChange(props.selectedDate.add(1, "month"));
  };
  const decreaseMonth = () => {
    if (props.selectedDate)
      props.handleSelectedDateChange(props.selectedDate.subtract(1, "month"));
  };
  return (
    <Card className="calendar-header">
      <Box component="div" className="calendar-controls">
        <Box component="div" className="reset-padding">
          <CustomisedDatePicker
            value={props.selectedDate}
            views={["year", "month", "day"]}
            setValue={props.handleSelectedDateChange}
            className="calendar-input"
            format="DD MMMM YYYY"
          />
        </Box>
        <AppIconButton onClick={decreaseMonth}>
          <KeyboardArrowLeftIcon />
        </AppIconButton>

        <AppIconButton
          onClick={increaseMonth}
        >
          <KeyboardArrowRightIcon />
        </AppIconButton>
      </Box>
      <Box component='div' sx={{ width: '150px' }} >
        <FormControl fullWidth>
          <InputLabel id="calendar-item-type">{i({ id: "OCCASION.TYPES.CATEGORY" })}</InputLabel>
          <AppSelect
            labelId="calendar-item-type"
            id="item-dropdown"
            value={props.category}
            label={i({ id: "OCCASION.TYPES.CATEGORY" })}
            onChange={(e) => props.handleCategoryChange(e.target.value)}
            size='small'
          >
            <MenuItem value={0}>{i({ id: "OCCASION.TYPES.ALL" })}</MenuItem>
            <MenuItem value={CALENDAR_ITEM.HOLIDAY}>{i({ id: "OCCASION.TYPES.HOLIDAY" })}</MenuItem>
            <MenuItem value={CALENDAR_ITEM.EVENT}>{i({ id: "OCCASION.TYPES.EVENT" })}</MenuItem>
            <MenuItem value={CALENDAR_ITEM.BIRTHDAY}>{i({ id: "OCCASION.TYPES.BIRTHDAY" })}</MenuItem>
            <MenuItem value={CALENDAR_ITEM.ANNIVERSARY}>{i({ id: "OCCASION.TYPES.ANNIVERSARY" })}</MenuItem>
          </AppSelect>
        </FormControl>
      </Box>
    </Card >
  )
}
