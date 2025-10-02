import * as Yup from "yup";
import { NOTICE_TYPE } from "../enums";

export const noticeValidationSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(10)
    .required("VALIDATION_ERR.NOTICE_TITLE_REQ"),
  message: Yup.string().trim().min(20).required("VALIDATION_ERR.MESSAGE_REQ"),
  target: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  noticeType: Yup.mixed()
    .oneOf(Object.values(NOTICE_TYPE))
    .required("VALIDATION_ERR.REQUIRED_TYPE"),
  departments: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
});
