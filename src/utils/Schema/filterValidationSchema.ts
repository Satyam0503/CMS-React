import * as Yup from "yup";

export const applicationFilterSchema = Yup.object().shape({
  fromDate: Yup.date().notRequired(),
  toDate: Yup.date().notRequired(),
  applicationStatus: Yup.array().notRequired(),
  jobTitles: Yup.array().notRequired(),
  status: Yup.array().notRequired(),
  minExperience: Yup.number()
    .min(0, "Experience value must be positive")
    .notRequired(),
  maxExperience: Yup.number().min(Yup.ref("minExperience"),"max experience nust be greater than min experience").notRequired(),
});
