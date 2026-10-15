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
    <Card
      className="calendar-header"
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        flexWrap: { xs: "wrap", md: "nowrap" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: { xs: 1, sm: 1 },
        p: { xs: 1, sm: "10px 14px" },
        minHeight: { xs: "auto", sm: 56 },
        borderRadius: "12px",
        width: "100%",
        boxSizing: "border-box",
        overflow: "visible",
      }}
    >
      <Box
        component="div"
        className="calendar-controls"
        style={{ flexWrap: "nowrap" }}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "nowrap",
          gap: { xs: 0.35, sm: 0.5 },
          minWidth: 0,
          flexShrink: 0,
          width: { xs: "100%", sm: "auto" },
          justifyContent: { xs: "space-between", sm: "flex-start" },
        }}
      >
        <Box
          component="div"
          className="reset-padding"
          sx={{
            width: { xs: "auto", sm: 155, md: 165 },
            minWidth: { xs: 120, sm: 145 },
            flex: { xs: "1 1 auto", sm: "0 0 155px", md: "0 0 165px" },
          }}
        >
          <CustomisedDatePicker
            value={props.selectedDate}
            views={["year", "month", "day"]}
            setValue={props.handleSelectedDateChange}
            className="calendar-input"
            format="DD MMMM YYYY"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 32,
                minHeight: 32,
                borderRadius: "8px",
              },
              "& .MuiInputBase-input": {
                py: "4px",
                px: "8px",
                fontSize: "0.8rem",
              },
              "& .MuiInputAdornment-root .MuiIconButton-root": {
                p: "3px",
              },
            }}
          />
        </Box>
        <Box
          component="div"
          className="calendar-navigation"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.25,
            flexShrink: 0,
          }}
        >
          <AppIconButton onClick={decreaseMonth} size="small" sx={{ p: 0.5, width: 28, height: 28 }}>
            <KeyboardArrowLeftIcon sx={{ fontSize: "1.1rem" }} />
          </AppIconButton>
          <AppIconButton onClick={increaseMonth} size="small" sx={{ p: 0.5, width: 28, height: 28 }}>
            <KeyboardArrowRightIcon sx={{ fontSize: "1.1rem" }} />
          </AppIconButton>
          <Button
            size="small"
            variant="outlined"
            className="calendar-today-button"
            onClick={() => props.handleSelectedDateChange(dayjs())}
            sx={{
              height: 32,
              minHeight: 32,
              px: 1,
              minWidth: "auto",
              whiteSpace: "nowrap",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            Today
          </Button>
        </Box>
      </Box>
      <Box
        component="div"
        className="calendar-filter"
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: { xs: 0.5, sm: 0.75 },
          flexShrink: 0,
          width: { xs: "100%", sm: "auto" },
          justifyContent: { xs: "space-between", sm: "flex-end" },
        }}
      >
        <Box
          className="calendar-filter-select"
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 0.5,
            flex: { xs: "1 1 auto", sm: "0 0 auto" },
          }}
        >
          <Typography
            component="label"
            htmlFor="item-dropdown"
            className="calendar-filter-label"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "text.secondary",
              whiteSpace: "nowrap",
            }}
          >
            {i({ id: "OCCASION.TYPES.CATEGORY" })}:
          </Typography>
          <FormControl size="small" sx={{ width: { xs: "100%", sm: 110, md: 115 }, minWidth: 90 }}>
            <AppSelect
              labelId="calendar-item-type"
              id="item-dropdown"
              value={props.category}
              inputProps={{ "aria-label": i({ id: "OCCASION.TYPES.CATEGORY" }) }}
              onChange={(e) => props.handleCategoryChange(Number(e.target.value) as CalendarItemType)}
              sx={{
                height: 32,
                borderRadius: "8px",
                "& .MuiSelect-select": {
                  py: "4px",
                  px: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                },
              }}
            >
              <MenuItem value={0}>{i({ id: "OCCASION.TYPES.ALL" })}</MenuItem>
              <MenuItem value={CALENDAR_ITEM.HOLIDAY}>{i({ id: "OCCASION.TYPES.HOLIDAY" })}</MenuItem>
              <MenuItem value={CALENDAR_ITEM.EVENT}>{i({ id: "OCCASION.TYPES.EVENT" })}</MenuItem>
              <MenuItem value={CALENDAR_ITEM.BIRTHDAY}>{i({ id: "OCCASION.TYPES.BIRTHDAY" })}</MenuItem>
              <MenuItem value={CALENDAR_ITEM.ANNIVERSARY}>{i({ id: "OCCASION.TYPES.ANNIVERSARY" })}</MenuItem>
            </AppSelect>
          </FormControl>
        </Box>
        {props.onImport && (
          <Button
            variant="outlined"
            startIcon={<UploadFileOutlinedIcon sx={{ fontSize: "1rem" }} />}
            onClick={props.onImport}
            className="calendar-import-button"
            sx={{
              height: 32,
              minHeight: 32,
              whiteSpace: "nowrap",
              flexShrink: 0,
              minWidth: "auto",
              px: { xs: 1, sm: 1.25 },
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            Import year
          </Button>
        )}
      </Box>
    </Card>
  )
}
