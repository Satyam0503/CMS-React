import {
  Box,
  Card,
  FormControl,
  MenuItem,
  Typography,
  Button,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useIntl } from "react-intl";
import { CalendarItemType } from "../models";
import { CALENDAR_ITEM } from "../../../../utils/enums";

import { AppIconButton, AppSelect } from "../../../shared/components/ui";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
type Props = {
  selectedDate: Dayjs | null;
  handleSelectedDateChange: (date: Dayjs | null) => void;
  category: CalendarItemType;
  handleCategoryChange: (category: CalendarItemType) => void;
  onImport?: () => void;
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
    <Card className="calendar-header" elevation={0}>
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
        <Box component="div" className="calendar-navigation">
          <AppIconButton onClick={decreaseMonth}>
            <KeyboardArrowLeftIcon />
          </AppIconButton>
          <AppIconButton onClick={increaseMonth}>
            <KeyboardArrowRightIcon />
          </AppIconButton>
          <Button
            size="small"
            variant="outlined"
            className="calendar-today-button"
            onClick={() => props.handleSelectedDateChange(dayjs())}
          >
            Today
          </Button>
        </Box>
      </Box>
      <Box component="div" className="calendar-filter">
        <Box className="calendar-filter-select">
          <Typography component="label" htmlFor="item-dropdown" className="calendar-filter-label">
            {i({ id: "OCCASION.TYPES.CATEGORY" })}
          </Typography>
          <FormControl fullWidth size="small">
          <AppSelect
            labelId="calendar-item-type"
            id="item-dropdown"
            value={props.category}
            inputProps={{ "aria-label": i({ id: "OCCASION.TYPES.CATEGORY" }) }}
            onChange={(e) => props.handleCategoryChange(Number(e.target.value) as CalendarItemType)}
          >
            <MenuItem value={0}>{i({ id: "OCCASION.TYPES.ALL" })}</MenuItem>
            <MenuItem value={CALENDAR_ITEM.HOLIDAY}>{i({ id: "OCCASION.TYPES.HOLIDAY" })}</MenuItem>
            <MenuItem value={CALENDAR_ITEM.EVENT}>{i({ id: "OCCASION.TYPES.EVENT" })}</MenuItem>
            <MenuItem value={CALENDAR_ITEM.BIRTHDAY}>{i({ id: "OCCASION.TYPES.BIRTHDAY" })}</MenuItem>
            <MenuItem value={CALENDAR_ITEM.ANNIVERSARY}>{i({ id: "OCCASION.TYPES.ANNIVERSARY" })}</MenuItem>
            </AppSelect>
          </FormControl>
        </Box>
        {props.onImport && <Button variant="outlined" startIcon={<UploadFileOutlinedIcon />} onClick={props.onImport} className="calendar-import-button">Import year</Button>}
      </Box>
    </Card >
  )
}
