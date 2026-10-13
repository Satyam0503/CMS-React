import type { Theme } from "@mui/material/styles";

export const ATTENDANCE_EMPLOYEE_COLUMN_WIDTH = 200;
export const ATTENDANCE_DATE_COLUMN_WIDTH = 85;
export const ATTENDANCE_GRID_MAX_HEIGHT = "68vh";

export const buildAttendanceGridScrollContainerSx = (theme: Theme) => ({
  width: "100%",
  overflowX: "auto",
  overflowY: "auto",
  maxHeight: ATTENDANCE_GRID_MAX_HEIGHT,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
  boxSizing: "border-box",
  scrollbarWidth: "thin",
  scrollbarColor: `${theme.palette.primary.light} ${theme.palette.action.hover}`,
  "&::-webkit-scrollbar": {
    height: 12,
    width: 10,
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 8,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.primary.light,
    borderRadius: 8,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: theme.palette.primary.main,
  },
  "& .MuiDataGrid-root": {
    border: "none",
  },
  "& .MuiDataGrid-columnHeaders": {
    position: "sticky",
    top: 0,
    zIndex: 6,
    backgroundColor: theme.palette.background.default,
  },
  "& .MuiDataGrid-columnHeader[data-field='name']": {
    position: "sticky",
    left: 0,
    top: 0,
    zIndex: 8,
    backgroundColor: theme.palette.background.default,
    boxShadow: "4px 0 10px rgba(15, 23, 42, 0.10)",
  },
  "& .MuiDataGrid-cell[data-field='name']": {
    position: "sticky",
    left: 0,
    zIndex: 4,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "4px 0 10px rgba(15, 23, 42, 0.10)",
  },
  "& .attendance-employee-header, & .attendance-employee-cell": {
    position: "sticky",
    left: 0,
    zIndex: 5,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "4px 0 10px rgba(15, 23, 42, 0.10)",
  },
  "& .attendance-employee-header": {
    zIndex: 9,
    backgroundColor: theme.palette.background.default,
  },
  "& .MuiDataGrid-cell": {
    borderBottom: "1px solid",
    borderBottomColor: "divider",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "transparent",
  },
  "& .MuiDataGrid-virtualScroller": {
    overflowX: "auto",
    overflowY: "auto",
  },
});
