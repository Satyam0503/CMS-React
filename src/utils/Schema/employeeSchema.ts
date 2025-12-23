import * as Yup from "yup";
import { Regex } from "../constant/Constant";
import { InviteNewEmployeeModel } from "../../app/modules/employees/models";
export const employeeSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("VALIDATION_ERR.FIRST_NAME_REQUIRED")
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),
  lastName: Yup.string()
    .required("VALIDATION_ERR.LAST_NAME_REQUIRED")
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),
  email: Yup.string()
    .required("VALIDATION_ERR.EMAIL_REQ")
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL"),
  employeeId: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  address: Yup.string().notRequired(),
  jobRole: Yup.string().nullable(),
  gender: Yup.string().nullable(),
  department: Yup.string().nullable(),
  reportingManager: Yup.string().nullable(),
  roleId: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  teamLead: Yup.string().nullable(),
  employmentType: Yup.number().nullable(),
  phoneNumber: Yup.string()
    .matches(Regex.Phone, "VALIDATION_ERR.INVALID_PHONE")
    .nullable(),
  bloodGroup: Yup.string().notRequired().nullable(),
  dateOfJoining: Yup.date()
    .max(new Date(), "VALIDATION_ERR.FUTURE_JOINING_DATE")
    .nullable(),
  dateOfBirth: Yup.date()
    .max(new Date(), "VALIDATION_ERR.FUTURE_DOB")
    .nullable(),
  personalEmail: Yup.string()
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL")
    .nullable(),
  emergencyContact: Yup.string()
    .matches(Regex.Phone, "VALIDATION_ERR.INVALID_PHONE")
    .nullable(),
  bankAccountNumber: Yup.number()
    .notRequired()
    .test("AccountNumber", "VALIDATION_ERR.INVALID_BANK_NO", (value) => {
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

export const inviteEmployeeSchema: Yup.ObjectSchema<InviteNewEmployeeModel> =
  Yup.object().shape({
    employeeId: Yup.string().required(),
    firstName: Yup.string()
      .required("VALIDATION_ERR.FIRST_NAME_REQUIRED")
      .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),
    lastName: Yup.string()
      .required("VALIDATION_ERR.LAST_NAME_REQUIRED")
      .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),
    email: Yup.string()
      .required("VALIDATION_ERR.EMAIL_REQ")
      .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL"),
    // roleId: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  });
