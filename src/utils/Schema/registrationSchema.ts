import * as Yup from "yup";
import { Regex } from "../constant/Constant";

export const registrationSchema = Yup.object().shape({
  firstName: Yup.string()
    .matches(
      Regex.Name,
      "Invalid Name"
    )
    .required("First name is required"),
  email: Yup.string()
    .matches(
      Regex.Email,
      "Email must be a valid email"
    )
    .required("Email is required"),
  lastName: Yup.string()
    .matches(
      Regex.Name,
      "Invalid Name"
    )
    .required("Last name is required"),
  companyName: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Company name is required"),
  password: Yup.string()
    .max(50, "Maximum 50 symbols")
    .matches(
      Regex.Password,
      "Use 8 or more characters with a mix of letters, numbers & symbols"
    )
    .required("Password is required"),
  changePassword: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password confirmation is required")
    .oneOf([Yup.ref("password")], "Password and Confirm Password didn't match"),
  acceptTerms: Yup.boolean()
    .oneOf([true], "You must accept the terms and conditions")
    .required("Accepting terms is required"),
});
