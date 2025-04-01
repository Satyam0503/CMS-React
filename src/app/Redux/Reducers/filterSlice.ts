import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FiltersType,
  ProcessLogModel,
} from "../../../utils/common_types";
import { clearAllLocalFilter, getAppliedFilters, setLocalFilter } from "../../../utils/common";
import { ApplicationFilterModel, ProcessLogFilterModel } from "../../modules/recruitment/models";

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
    }
  },
});

export const filterReducers = filterSlice.reducer;
export const { setApplicationFilter,setProcessLogFilter, resetFilter,resetAllFilters } = filterSlice.actions;
