import * as Yup from "yup";

const jobSchema = Yup.object().shape({
  title: Yup.string().required("VALIDATION_ERR.JOB_TITLE"),
  vacancies: Yup.number()
    .min(1, "VALIDATION_ERR.NEGATIVE_VACANCY")
    .integer("VALIDATION_ERR.INVALID_NUMBER")
    .required("VALIDATION_ERR.JOB_VACANCY"),
  description: Yup.string().required("VALIDATION_ERR.JOB_DESCRIPTION"),
  jobType: Yup.string().required("VALIDATION_ERR.JOB_TYPE"),
  status: Yup.boolean().required("VALIDATION_ERR.JOB_STATUS"),
  experienceMin: Yup.number().nullable().min(0, "VALIDATION_ERR.NEGATIVE_EXP"),
  experienceMax: Yup.number().nullable().min(0, "VALIDATION_ERR.NEGATIVE_EXP").test("experience-order", "VALIDATION_ERR.INVALID_RANGE", function (value) {
    const min = this.parent.experienceMin;
    return value == null || min == null || value >= min;
  }),
  salaryMin: Yup.number().nullable().min(0, "VALIDATION_ERR.INVALID_NUMBER"),
  salaryMax: Yup.number().nullable().min(0, "VALIDATION_ERR.INVALID_NUMBER").test("salary-order", "VALIDATION_ERR.INVALID_RANGE", function (value) {
    const min = this.parent.salaryMin;
    return value == null || min == null || value >= min;
  }),
});

export default jobSchema;
