import * as Yup from "yup";
import { Regex } from "../constant/Constant";

const MAX_FILE_SIZE = 5; // 5MB

export const companyValidationSchema = Yup.object().shape({
  companyName: Yup.string()
    .required("VALIDATION_ERR.COMPANY_NAME_REQ")
    .matches(Regex.Name, "VALIDATION_ERR.INVALID_NAME"),
  applicationLanguage: Yup.array().of(Yup.string()),
  defaultLanguage: Yup.string().required("VALIDATION_ERR.DEFAULT_LANG_REQ"),
  companyLogo: Yup.mixed().nullable(),
  address: Yup.string(),
});
