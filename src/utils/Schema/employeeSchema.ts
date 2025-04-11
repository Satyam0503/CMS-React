import * as Yup from "yup";
import { Regex } from "../constant/Constant";
export const employeeSchema = Yup.object().shape({
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
  employeeId: Yup.string().required("Employee Id is required"),
  address: Yup.string().required("Address is required"),
  jobRole: Yup.string().required("Job role is required"),
  gender: Yup.string().required("Gender is required"),
  department: Yup.string().required("Department is required"),
  reportingManager: Yup.string().nullable(),
  roleId: Yup.string().required("Role is required"),
  teamLead: Yup.string().nullable(),
  phoneNumber: Yup.string()
    .matches(
      Regex.Phone,
      "Phone number is not valid"
    )
    .required("Phone number is required"),
  bloodGroup: Yup.string().nullable(),
  status: Yup.string().required("Status is required"),
  dateOfJoining: Yup.date()
    .required("Date of Joining is required")
    .typeError("Invalid Date Format")
    .max(new Date(), "Date of Joining cannot be in the future"),
  dateOfBirth: Yup.date()
    .required("Date of Birth is required")
    .typeError("Invalid Date of Birth")
    .max(new Date(), "Date of Birth cannot be in the future"),
  personalEmail: Yup.string()
    .nullable()
    .matches(
      Regex.Email,
      "Email is not valid"
    ),
  emergencyContact: Yup.string()
    .matches(
      Regex.Phone,
      "Emergency Contact is not valid"
    )
    .required("Emergency Contact is required"),
});