import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ApplicationFilterModel,
  JobsFilterModel,
} from "../../../utils/common_types";

interface FiltersType {
  application: ApplicationFilterModel | null;
  jobs: JobsFilterModel | null;
}

const APP_FILTER_KEY = "app-filters";

const getAppliedFilters = () => {
  const savedFilters = localStorage.getItem(APP_FILTER_KEY);
  const appliedfilters: FiltersType = savedFilters
    ? JSON.parse(savedFilters)
    : {
        application: null,
        jobs: null,
      };
  return appliedfilters;
};

const setLocalFilter = (filters:FiltersType) => {
    if(localStorage){
        localStorage.setItem(APP_FILTER_KEY,JSON.stringify(filters));
    }
    else{
        console.log("Unable to access localstorage");
    }
}

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
    }
  },
});

export const filterReducers = filterSlice.reducer;
export const { setApplicationFilter,resetFilter } = filterSlice.actions;
