import * as Yup from "yup";

export const applicationFilterSchema = Yup.object().shape({
  filterFrom: Yup.date().notRequired(),
  filterTo: Yup.date().min(Yup.ref("filterFrom")).notRequired(),
  activityTypes: Yup.array().notRequired(),
  vacancyIds: Yup.array().notRequired(),
  status: Yup.array().notRequired(),
  minExperience: Yup.number().min(0).notRequired(),
  maxExperience: Yup.number().min(Yup.ref("minExperience")).notRequired(),
});

export const noticeBoardFilterSchema = Yup.object().shape({
  filterFrom: Yup.date().notRequired(),
  filterTo: Yup.date().min(Yup.ref("filterFrom")).notRequired(),
  noticeType: Yup.array().of(Yup.number()).notRequired(),
});

export const employeeFilterValidationSchema = Yup.object().shape({
  departmentId: Yup.array().of(Yup.string()).notRequired(),
  gender: Yup.array().of(Yup.string()).notRequired(),
});

export const processLogFilterSchema = Yup.object().shape({
  filterFrom: Yup.date().notRequired(),
  filterTo: Yup.date().min(Yup.ref("filterFrom")).notRequired(),
  activityCategory: Yup.array().notRequired(),
  jobRole: Yup.string().notRequired(),
});

export const JobFilterValidationSchema = Yup.object().shape({
  jobTypes: Yup.array().of(Yup.number()).notRequired(),
  status: Yup.bool().nullable().notRequired(),
});

export const holidayFilterValidationSchema = Yup.object().shape({
  holidayType: Yup.array().notRequired(),
  date: Yup.date().notRequired(),
});
