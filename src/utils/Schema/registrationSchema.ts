import * as Yup from "yup";
import { Regex } from "../constant/Constant";
import { ChangePasswordPayload } from "../../app/modules/users/models";

const companyNameRegex = /^[\w\s.,&'()-]{3,50}$/;

export const registrationSchema = Yup.object().shape({
  firstName: Yup.string()
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME")
    .required("VALIDATION_ERR.FIRST_NAME_REQUIRED"),
  email: Yup.string()
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL")
    .required("VALIDATION_ERR.EMAIL_REQ"),
  lastName: Yup.string()
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME")
    .required("VALIDATION_ERR.LAST_NAME_REQUIRED"),
  companyName: Yup.string()
    .matches(companyNameRegex, "VALIDATION_ERR.INVALID_COMPANY_NAME")
    .required("VALIDATION_ERR.COMPANY_NAME_REQ"),
  password: Yup.string()
    .matches(Regex.Password, "VALIDATION_ERR.INVALID_PASSWORD")
    .required("VALIDATION_ERR.PASSWORD_REQ"),
  changePassword: Yup.string()
    .required("VALIDATION_ERR.PASSWORD_REQ")
    .oneOf([Yup.ref("password")], "VALIDATION_ERR.INVALID_CONFIRM_PASSWORD"),
  acceptTerms: Yup.boolean().oneOf([true]).required(),
});

export const changePasswordSchema: Yup.ObjectSchema<ChangePasswordPayload> =
  Yup.object().shape({
    oldPassword: Yup.string().required("VALIDATION_ERR.PASSWORD_REQ"),
    newPassword: Yup.string()
      .matches(Regex.Password, "VALIDATION_ERR.INVALID_PASSWORD")
      .required("VALIDATION_ERR.PASSWORD_REQ"),
    confirmPassword: Yup.string()
      .required("VALIDATION_ERR.PASSWORD_REQ")
      .oneOf(
        [Yup.ref("newPassword")],
        "VALIDATION_ERR.INVALID_CONFIRM_PASSWORD"
      ),
  });
