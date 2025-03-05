import * as Yup from "yup";

export const applicationFilterSchema = Yup.object().shape({
  filterFrom: Yup.date().notRequired(),
  filterTo: Yup.date().notRequired(),
  activityTypes: Yup.array().notRequired(),
  vacancyIds: Yup.array().notRequired(),
  status: Yup.array().notRequired(),
  minExperience: Yup.number()
    .min(0, "Experience value must be positive")
    .notRequired(),
  maxExperience: Yup.number().min(Yup.ref("minExperience"),"max experience nust be greater than min experience").notRequired(),
});
