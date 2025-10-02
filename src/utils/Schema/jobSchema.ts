import * as Yup from "yup";

const jobSchema = Yup.object().shape({
  title: Yup.string().required("VALIDATION_ERR.JOB_TITLE"),
  vacancies: Yup.number()
    .min(1, "VALIDATION_ERR.NEGATIVE_VACANCY")
    .required("VALIDATION_ERR.JOB_VACANCY"),
  description: Yup.string().required("VALIDATION_ERR.JOB_DESCRIPTION"),
  jobType: Yup.string().required("VALIDATION_ERR.JOB_TYPE"),
  status: Yup.boolean().required("VALIDATION_ERR.JOB_STATUS"),
});

export default jobSchema;
