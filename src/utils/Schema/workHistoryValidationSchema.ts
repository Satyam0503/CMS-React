import * as Yup from "yup";
export const workHistoryValidationSchema = Yup.object().shape({
  startDate: Yup.date()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .max(new Date(), "VALIDATION_ERR.FUTRE_START_DATE"),
  endDate: Yup.date()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .min(Yup.ref("startDate"), "VALIDATION_ERR.END_DATE_EARLIER_ERROR"),
  organisationName: Yup.string()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .min(3, "VALIDATION_ERR.ORG_NAME"),
  jobRole: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  jobLocation: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
});
