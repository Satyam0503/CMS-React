import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FiltersType,
} from "../../../utils/common_types";
import { clearAllLocalFilter, getAppliedFilters, setLocalFilter } from "../../../utils/common";
import { ApplicationFilterModel, ProcessLogFilterModel } from "../../modules/recruitment/models";
import { EmployeeFilterModel } from "../../modules/employees/models"
import { actions } from "react-table";

const filterSlice = createSlice({
  name: "filters",
  initialState: getAppliedFilters(),
  reducers: {
    setApplicationFilter: (
      state,
      action: PayloadAction<ApplicationFilterModel>
    ) => {
      state.application= action.payload;
      setLocalFilter(state);
    },
    setProcessLogFilter:(state,action:PayloadAction<ProcessLogFilterModel> )=>{
      state.processLog = action.payload;
      setLocalFilter(state);
    },
    resetFilter:(state,action:PayloadAction<{page:keyof FiltersType}>)=>{
        state[action.payload.page] = null;
        setLocalFilter(state);
    },
    resetAllFilters:(state)=>{
      state.application=null;
      state.jobs=null;
      state.processLog= null;
      clearAllLocalFilter();
    },
    setEmployeesFilter: (state, action: PayloadAction<EmployeeFilterModel>) =>{
      state.employee = action.payload;
      setLocalFilter(state);
    }
  },
});

export const filterReducers = filterSlice.reducer;
export const { setApplicationFilter, setEmployeesFilter ,setProcessLogFilter, resetFilter,resetAllFilters } = filterSlice.actions;
