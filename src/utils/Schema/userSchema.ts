import * as Yup from "yup";

export const userSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .matches(/^[A-Za-z]+$/, "Invalid Name"),
  lastName: Yup.string()
    .required("last name is required")
    .matches(/^[A-Za-z]+$/, "Invalid Name"),
  email: Yup.string()
    .required("Email is required")
    .matches(
      /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be a valid email"
    ),
  address: Yup.string().required("Address is required"),
  phoneNumber: Yup.string()
    .matches(
      /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s\-]?)?[\d\-]{7,10}$/,
      "Phone number is not valid"
    )
    .required("Phone number is required"),
  bloodGroup: Yup.string().required("Blood group is required"),
  dateOfBirth: Yup.date()
    .required("Date of Birth is required")
    .typeError("Invalid Date of Birth")
    .max(new Date(), "Date of Birth cannot be in the future"),
  personalEmail: Yup.string()
    .required("Personal email is required")
    .matches(
      /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email is not valid"
    ),
  emergencyContact: Yup.string()
    .matches(
      /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s\-]?)?[\d\-]{7,10}$/,
      "Emergency Contact is not valid"
    )
    .required("Emergency Contact is required"),
});

export const userEducationSchema = Yup.object().shape({
  title: Yup.string().required("Course name is required").min(3, 'Course name should be at least 3 characters long'),
  startDate: Yup.date().required("Start Date is Required").max(new Date,"Start date cannot be in the future"),
  endDate: Yup.date().required("End Date is Required").min(Yup.ref('startDate'), 'End date cannot be before start date'),
  collegeName: Yup.string().required("College name is required").min(3, 'College name should be at least 3 characters long'),
  type: Yup.string().required("Education type is required"),
});

export const userCertificationSchema = Yup.object().shape({
  title: Yup.string().required("Certification title is required").min(3, 'Certification title should be at least 3 characters long'),
  startDate: Yup.date().required("Start Date is Required").max(new Date,"Start date cannot be in the future"),
  endDate: Yup.date().required("End Date is Required").min(Yup.ref('startDate'), 'End date cannot be before start date'),
  organizationName: Yup.string().required("Organization name is required").min(3, 'Organization name should be at least 3 characters long'),
  type: Yup.string().required("Certification type is required"),
});