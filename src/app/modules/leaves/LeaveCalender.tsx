import {
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Input,
  InputBase,
} from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";
import IconStat from "../components/IconStat";
import { colors } from "../theme/MuiTheme";
import {
  CalendarToday,
  Home,
  HourglassBottom,
  HourglassTop,
  WorkOff,
} from "@mui/icons-material";

export const LeaveCalender: FC = () => {
  const intl = useIntl();

  return (
    <FormControl sx={{ minWidth: 120 }}>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        defaultValue={19}
        renderValue={(value) => {
          if (value === 19) return "Today";
          if (value === 20) return "This Week";
          if (value === 21) return "This Month";
          if (value === 22) return "This Year";

          return "";
        }}
      >
        <MenuItem value={19}>Today</MenuItem>
        <MenuItem value={20}>This Week</MenuItem>
        <MenuItem value={21}>This Month</MenuItem>
        <MenuItem value={22}>This Year</MenuItem>
      </Select>

      {/* <InputBase
          // startAdornment={
          //   <InputAdornment position="start">
          //     <CalendarToday />
          //   </InputAdornment>
          // }
          sx={{ width: "100%", mt: 2 }}
        /> */}
    </FormControl>
  );
};
