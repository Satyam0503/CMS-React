import * as Yup from "yup";

const noticeSchema = Yup.object().shape({
  group: Yup.string()
    .required("Group is required"),
  target: Yup.string()
    .required("Target Date is Required"),
  message: Yup.string()
    .required("Message is required"),
  type: Yup.string().required("Notice type is required"),
});

export default noticeSchema;