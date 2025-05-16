import * as Yup from "yup";
import { Regex } from "../constant/Constant";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const companyValidationSchema = Yup.object().shape({
  companyName: Yup.string()
    .required("Company name is required")
    .matches(Regex.Name, "Invalid Name"),
  applicationLanguage: Yup.array().of(Yup.string()),
  defaultLanguage: Yup.string().required("Default Language is required"),
  companyLogo: Yup.mixed()
    .notRequired()
    .test(
      "fileFormat",
      "Only png, jpeg and jpg files are allowed",
      (value: any) => {
        if (value) {
          const supportedFormats = ["png", "jpeg", "jpg"];
          return supportedFormats.includes(value.name.split(".").pop());
        }
        return true;
      }
    )
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
