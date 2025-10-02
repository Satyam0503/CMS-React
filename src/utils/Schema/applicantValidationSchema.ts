import * as Yup from "yup";
import { Regex } from "../constant/Constant";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const applicantValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("VALIDATION_ERR.FIRST_NAME_REQUIRED")
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),
  lastName: Yup.string()
    .required("VALIDATION_ERR.LAST_NAME_REQUIRED")
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),
  email: Yup.string()
    .required("VALIDATION_ERR.EMAIL_REQ")
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL"),
  state: Yup.string().required("APPLICATION.SELECT_STATE"),
  phone: Yup.string()
    .matches(Regex.Phone, "VALIDATION_ERR.INVALID_PHONE")
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  experience: Yup.number().min(0).required("VALIDATION_ERR.REQUIRED_TYPE"),
  vacancyId: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  resume: Yup.mixed()
    .required("VALIDATION_ERR.RESUME_REQ")
    .test("fileFormat", "VALIDATION_ERR.ONLY_PDF_FILE", (value: any) => {
      if (value) {
        const supportedFormats = ["pdf"];
        return supportedFormats.includes(value.name.split(".").pop());
      }
      return true;
    })
    .test("fileSize", "VALIDATION_ERR.PROFILE_PICTURE_SIZE", (value: any) => {
      if (value) {
        return value.size <= MAX_FILE_SIZE;
      }
      return true;
    }),
});

export const editApplicantValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("VALIDATION_ERR.FIRST_NAME_REQUIRED")
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),
  lastName: Yup.string()
    .required("VALIDATION_ERR.LAST_NAME_REQUIRED")
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),

  email: Yup.string()
    .required("VALIDATION_ERR.EMAIL_REQ")
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL"),
  phone: Yup.string()
    .matches(Regex.Phone, "VALIDATION_ERR.REQUIRED_TYPE")
    .required("VALIDATION_ERR.INVALID_PHONE"),
  state: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  experienceInMonths: Yup.number()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .min(0)
    .max(12),
  experienceInYears: Yup.number()
    .min(0, "VALIDATION_ERR.NEGATIVE_EXP")
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  vacancyId: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  activityType: Yup.number()
    .oneOf([0, 1, 2, 3, 4, 5])
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  resume: Yup.mixed()
    .nullable()
    .test("fileFormat", "VALIDATION_ERR.ONLY_PDF_FILE", (value: any) => {
      if (value) {
        const supportedFormats = ["pdf"];
        return supportedFormats.includes(value.name.split(".").pop());
      }
      return true;
    })
    .test("fileSize", "VALIDATION_ERR.PROFILE_PICTURE_SIZE", (value: any) => {
      if (value) {
        return value.size <= MAX_FILE_SIZE;
      }
      return true;
    }),
});
