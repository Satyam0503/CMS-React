import * as Yup from "yup";

const jobSchema = Yup.object().shape({
  title: Yup.string().required("Job Title is required"),
  vacancies: Yup.number().min(1,"vacancies number must be non-negative").required("Vacancies is required"),
  description: Yup.string().required("Job Description is required"),
  jobType: Yup.string().required("Job type is required"),
  status: Yup.boolean().required("Status is required"),
});

export default jobSchema;
