import * as Yup from 'yup';
import { NOTICE_TYPE } from '../enums';

export const noticeValidationSchema = Yup.object().shape({
    title: Yup.string().trim().min(10)
        .required("Title is required"),
    message: Yup.string().trim().min(20)
        .required("message is required"),
    target: Yup.string().required("targer is required field"),
    noticeType: Yup.mixed().oneOf(Object.values(NOTICE_TYPE)).required("notice type is required"),
    departments: Yup.string().required("department is required field"),
});
