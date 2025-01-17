import * as Yup from "yup";

const holidaySchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required"),
  startDate: Yup.date()
    .required("Start Date is Required"),
    // .min(new Date(), "Start date cannot be in the past"),
  endDate: Yup.date()
    .required("End Date is Required")
    .min(Yup.ref('startDate'), 'End date cannot be before start date'),
  description: Yup.string()
    .required("Description is required"),
  type: Yup.string().required("Holiday type is required"),
});

export default holidaySchema;
