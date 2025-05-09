import * as Yup from "yup";

export const applicationFilterSchema = Yup.object().shape({
  filterFrom: Yup.date().notRequired(),
  filterTo: Yup.date().min(Yup.ref("filterFrom")).notRequired(),
  activityTypes: Yup.array().notRequired(),
  vacancyIds: Yup.array().notRequired(),
  status: Yup.array().notRequired(),
  minExperience: Yup.number()
    .min(0, "Experience value must be positive")
    .notRequired(),
  maxExperience: Yup.number().min(Yup.ref("minExperience"),"max experience nust be greater than min experience").notRequired(),
});

export const departmentFilterSchema = Yup.object().shape({
  departmentIds: Yup.array().notRequired(),
});

export const processLogFilterSchema = Yup.object().shape({
  filterFrom: Yup.date().notRequired(),
  filterTo: Yup.date().min(Yup.ref("filterFrom")).notRequired(),
  activityCategory: Yup.array().notRequired(),
  jobRole: Yup.string().notRequired(),
});
