import {
  Box,
  Card,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import { Dayjs } from "dayjs";
import { useIntl } from "react-intl";
import { CalendarItemType } from "../models";

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
        <IconButton onClick={decreaseMonth}>
          <KeyboardArrowLeftIcon />
        </IconButton>

        <IconButton onClick={increaseMonth}>
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
      <Box component="div" sx={{ width: "150px" }}>
        <FormControl fullWidth>
          <InputLabel id="calendar-item-type">
            {i({ id: "OCCASION.TYPES.CATEGORY" })}
          </InputLabel>
          <Select
            labelId="calendar-item-type"
            id="item-dropdown"
            value={props.category}
            label={i({ id: "OCCASION.TYPES.CATEGORY" })}
            onChange={(e) => props.handleCategoryChange(e.target.value)}
            size="small"
          >
            <MenuItem value={0}>{i({ id: "OCCASION.TYPES.ALL" })}</MenuItem>
            <MenuItem value={1}>{i({ id: "OCCASION.TYPES.HOLIDAY" })}</MenuItem>
            <MenuItem value={2}>{i({ id: "OCCASION.TYPES.EVENT" })}</MenuItem>
            {/* <MenuItem value={3}>{i({ id: "OCCASION.TYPES.BIRTHDAY" })}</MenuItem>
            <MenuItem value={4}>{i({ id: "OCCASION.TYPES.ANNIVERSARY" })}</MenuItem> */}
          </Select>
        </FormControl>
      </Box>
    </Card>
  );
}
