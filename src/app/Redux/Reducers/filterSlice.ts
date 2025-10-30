import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FiltersType } from "../../../utils/common_types";
import {
  clearAllLocalFilter,
  getAppliedFilters,
  setLocalFilter,
} from "../../../utils/common";
import {
  ApplicationFilterModel,
  JobsFilterModel,
  ProcessLogFilterModel,
} from "../../modules/recruitment/models";
import { EmployeeFilterModel } from "../../modules/employees/models";
import { NoticeBoardFilterModel } from "../../modules/noticeboard/models";
import {
  GetHolidayPayloadModel,
  HolidayFilterModel,
} from "../../modules/holidays/models";
import { LeaveRequestsFilterModel } from "../../modules/leaves/model";

const filterSlice = createSlice({
  name: "filters",
  initialState: getAppliedFilters(),
  reducers: {
    setApplicationFilter: (
      state,
      action: PayloadAction<ApplicationFilterModel>
    ) => {
      state.application = action.payload;
      setLocalFilter(state);
    },
    setProcessLogFilter: (
      state,
      action: PayloadAction<ProcessLogFilterModel>
    ) => {
      state.processLog = action.payload;
      setLocalFilter(state);
    },
    setEmployeesFilter: (state, action: PayloadAction<EmployeeFilterModel>) => {
      state.employee = action.payload;
      setLocalFilter(state);
    },
    setHolidayFilter: (state, action: PayloadAction<HolidayFilterModel>) => {
      state.holiday = action.payload;
      setLocalFilter(state);
    },
    setNoticeBoardFilter: (
      state,
      action: PayloadAction<NoticeBoardFilterModel>
    ) => {
      state.noticeBoard = action.payload;
      setLocalFilter(state);
    },
    setJobsFilter: (state, action: PayloadAction<JobsFilterModel>) => {
      state.jobs = action.payload;
      setLocalFilter(state);
    },
    setLeaveRequestFilter: (
      state,
      action: PayloadAction<LeaveRequestsFilterModel>
    ) => {
      state.leaveRequest = action.payload;
      setLocalFilter(state);
    },
    resetAllFilters: (state) => {
      state.application = null;
      state.jobs = null;
      state.processLog = null;
      state.holiday = null;
      state.leaveRequest = null;
      state.noticeBoard = null;
      clearAllLocalFilter();
    },
    resetFilter: (
      state,
      action: PayloadAction<{ page: keyof FiltersType }>
    ) => {
      state[action.payload.page] = null;
      setLocalFilter(state);
    },
  },
});

export const filterReducers = filterSlice.reducer;
export const {
  setApplicationFilter,
  setEmployeesFilter,
  setProcessLogFilter,
  resetFilter,
  resetAllFilters,
  setHolidayFilter,
  setNoticeBoardFilter,
  setJobsFilter,
  setLeaveRequestFilter,
} = filterSlice.actions;
