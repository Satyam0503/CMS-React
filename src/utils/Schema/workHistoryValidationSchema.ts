import * as Yup from "yup";
export const workHistoryValidationSchema = Yup.object().shape({
  startDate: Yup.date()
    .required("Start Date is Required")
    .max(new Date(), "Start date cannot be in the future"),
  endDate: Yup.date()
    .required("End Date is Required")
    .min(Yup.ref("startDate"), "End date cannot be before start date"),
  organisationName: Yup.string()
    .required("Organization name is required")
    .min(3, "Organization name should be at least 3 characters long"),
  jobRole: Yup.string().required("Job role is required"),
  jobLocation: Yup.string().required("job location is required"),
});
