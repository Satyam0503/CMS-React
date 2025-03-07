import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ApplicationFilterModel,
  FiltersType,
} from "../../../utils/common_types";
import { clearAllLocalFilter, getAppliedFilters, setLocalFilter } from "../../../utils/common";

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
    resetFilter:(state,action:PayloadAction<{page:keyof FiltersType}>)=>{
        state[action.payload.page] = null;
        setLocalFilter(state);
    },
    resetAllFilters:(state)=>{
      state.application=null;
      state.jobs=null;
      clearAllLocalFilter();
    }
  },
});

export const filterReducers = filterSlice.reducer;
export const { setApplicationFilter,resetFilter,resetAllFilters } = filterSlice.actions;
