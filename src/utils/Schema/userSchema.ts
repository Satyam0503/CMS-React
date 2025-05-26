import * as Yup from "yup";
import { Regex } from "../constant/Constant";

export const userSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .matches(Regex.Name, "Invalid Name"),
  lastName: Yup.string()
    .required("last name is required")
    .matches(Regex.Name, "Invalid Name"),
  email: Yup.string()
    .required("Email is required")
    .matches(
      Regex.Email,
      "Email must be a valid email"
    ),
  address: Yup.string().notRequired().nullable(),
  phoneNumber: Yup.string()
    .matches(
      Regex.Phone,
      "Phone number is not valid"
    ).notRequired(),
  bloodGroup: Yup.string().notRequired().nullable(),
  dateOfBirth: Yup.date()
    .typeError("Invalid Date of Birth")
    .max(new Date(), "Date of Birth cannot be in the future").notRequired(),
  dateOfJoining: Yup.date()
    .typeError("Invalid Date of Joining")
    .max(new Date(), "Date of Joining cannot be in the future").notRequired(),
  personalEmail: Yup.string()
    .matches(
      Regex.Email,
      "Email is not valid"
    ).notRequired(),
  emergencyContact: Yup.string()
    .matches(
      Regex.Phone,
      "Emergency Contact is not valid"
    )
    .notRequired(),
  jobRole: Yup.string().required("job Role is Required"),
  department: Yup.string().nullable(),
  reportingManager: Yup.string().nullable(),
  teamLead: Yup.string().nullable(),
});

export const userEducationSchema = Yup.object().shape({
  educationTitle: Yup.string().required("Course name is required").min(3, 'Course name should be at least 3 characters long'),
  startDate: Yup.date().required("Start Date is Required").max(new Date, "Start date cannot be in the future"),
  endDate: Yup.date().required("End Date is Required").min(Yup.ref('startDate'), 'End date cannot be before start date'),
  collegeName: Yup.string().required("College name is required").min(3, 'College name should be at least 3 characters long'),
  type: Yup.string().required("Education type is required"),
});

export const userCertificationSchema = Yup.object().shape({
  certificationTitle: Yup.string().required("Certification title is required").min(3, 'Certification title should be at least 3 characters long'),
  startDate: Yup.date().required("Start Date is Required").max(new Date, "Start date cannot be in the future"),
  endDate: Yup.date().required("End Date is Required").min(Yup.ref('startDate'), 'End date cannot be before start date'),
  organisationName: Yup.string().required("Organization name is required").min(3, 'Organization name should be at least 3 characters long'),
  mode: Yup.string().required("Certification type is required"),
});