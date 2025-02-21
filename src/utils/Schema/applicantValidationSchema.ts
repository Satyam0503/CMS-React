import * as Yup from "yup";
//  name validation
// [a-zA-Z]+\\.?
// "^[\\p{L} .'-]+$"
// /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+/

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const applicantValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .matches(/^[A-Za-z]+(?:[-'][A-Za-z]+)*(?: [A-Za-z]+(?:[-'][A-Za-z]+)*)*$/, "Invalid Name"),
  lastName: Yup.string()
    .required("Last name is required")
    .matches(/^[A-Za-z]+(?:[-'][A-Za-z]+)*(?: [A-Za-z]+(?:[-'][A-Za-z]+)*)*$/, "Invalid Name"),
  email: Yup.string()
    .required("Email is required")
    .matches(
      /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be a valid email"
    ),
  phone: Yup.string()
    .matches(
      /^[6-9]\d{9}$/,
      // /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s\-]?)?[\d\-]{7,10}$/,
      "Phone number is not valid"
    )
    .required("Phone number is required"),
  experience: Yup.number().min(0).required("Experience is Required"),
  vacancyId: Yup.string().required("Select Job"),
  resume: Yup.mixed()
    .required("Resume is required")
    .test("fileFormat", "Only PDF files are allowed", (value: any) => {
      if (value) {
        const supportedFormats = ["pdf"];
        return supportedFormats.includes(value.name.split(".").pop());
      }
      return true;
    })
    .test(
      "fileSize",
      "File size is too big, File size exceeds 5MB",
      (value: any) => {
        if (value) {
          return value.size <= MAX_FILE_SIZE;
        }
        return true;
      }
    ),
});

export const editApplicantValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .matches(/^[A-Za-z]+(?:[-'][A-Za-z]+)*(?: [A-Za-z]+(?:[-'][A-Za-z]+)*)*$/, "Invalid Name"),
  lastName: Yup.string()
    .required("Last name is required")
    .matches(/^[A-Za-z]+(?:[-'][A-Za-z]+)*(?: [A-Za-z]+(?:[-'][A-Za-z]+)*)*$/, "Invalid Name"),

  email: Yup.string()
    .required("Email is required")
    .matches(
      /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be a valid email"
    ),
  phone: Yup.string()
    .matches(
      /^[6-9]\d{9}$/,
      // /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s\-]?)?[\d\-]{7,10}$/,
      "Phone number is not valid"
    )
    .required("Phone number is required"),
  experienceInMonths: Yup.number()
    .required("Experience is Required")
    .min(0, "Experience must be non-negative value")
    .max(12),
  experienceInYears: Yup.number()
    .min(0, "Experience must be non-negative value")
    .required("Experience is Required"),
  vacancyId: Yup.string().required("Select Job"),
  activityType: Yup.number()
    .oneOf([0, 1, 2, 3, 4, 5])
    .required("Select Application Status"),
  resume: Yup.mixed()
    .required("Resume is required")
    .test("fileFormat", "Only PDF files are allowed", (value: any) => {
      if (value) {
        const supportedFormats = ["pdf"];
        return supportedFormats.includes(value.name.split(".").pop());
      }
      return true;
    })
    .test("fileSize", "File size must not be more than 5MB", (value: any) => {
      if (value) {
        return value.size <= MAX_FILE_SIZE;
      }
      return true;
    }),
});
