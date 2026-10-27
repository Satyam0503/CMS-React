import * as Yup from "yup";
import { Regex } from "../constant/Constant";

export const userSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("VALIDATION_ERR.FIRST_NAME_REQUIRED")
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),
  lastName: Yup.string()
    .required("VALIDATION_ERR.LAST_NAME_REQUIRED")
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),
  employeeId: Yup.string()
    .trim()
    .notRequired()
    .nullable(),
  email: Yup.string()
    .required("VALIDATION_ERR.EMAIL_REQ")
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL"),
  gender: Yup.string().nullable(),
  address: Yup.string().notRequired().nullable(),
  phoneNumber: Yup.string()
    .matches(Regex.Phone, "VALIDATION_ERR.INVALID_PHONE")
    .notRequired(),
  bloodGroup: Yup.string().notRequired().nullable(),
  dateOfBirth: Yup.date()
    .max(new Date(), "VALIDATION_ERR.FUTURE_DOB")
    .notRequired(),
  dateOfJoining: Yup.date()
    .max(new Date(), "VALIDATION_ERR.FUTURE_JOINING_DATE")
    .notRequired(),
  personalEmail: Yup.string()
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL")
    .notRequired(),
  emergencyContact: Yup.string()
    .matches(Regex.Phone, "VALIDATION_ERR.INVALID_PHONE")
    .notRequired(),
  jobRole: Yup.string().nullable(),
  department: Yup.string().nullable(),
  employmentType: Yup.number().nullable(),
  reportingManager: Yup.string().nullable(),
  teamLead: Yup.string().nullable(),
  bankAccountNumber: Yup.number()
    .notRequired()
    .test("AccountNumber", "VALIDATION_ERR.INVALID_BANK_NO", (value: any) => {
      // validate account number
      if (value) {
        const accNo = value.toString() as string;
        return Regex.BankAccountNo.test(accNo);
      }
      return true;
    }),
  panNumber: Yup.string()
    .matches(Regex.PanCard, "VALIDATION_ERR.INVALID_PAN")
    .notRequired(),
});

export const userEducationSchema = Yup.object().shape({
  educationTitle: Yup.string()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .min(3, "VALIDATION_ERR.COURSE_NAME_ERROR"),
  startDate: Yup.date()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .max(new Date(), "VALIDATION_ERR.FUTRE_START_DATE"),
  endDate: Yup.date()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .min(Yup.ref("startDate"), "VALIDATION_ERR.END_DATE_EARLIER_ERROR"),
  collegeName: Yup.string().notRequired(),
  type: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
});

export const userCertificationSchema = Yup.object().shape({
  certificationTitle: Yup.string()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .min(3, "VALIDATION_ERR.CERTIFICATION_NAME_ERROR"),
  startDate: Yup.date()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .max(new Date(), "VALIDATION_ERR.FUTRE_START_DATE"),
  endDate: Yup.date()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .min(Yup.ref("startDate"), "VALIDATION_ERR.END_DATE_EARLIER_ERROR"),
  organisationName: Yup.string()
    .required("VALIDATION_ERR.REQUIRED_TYPE")
    .min(3, "VALIDATION_ERR.ORG_NAME"),
  mode: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
});
