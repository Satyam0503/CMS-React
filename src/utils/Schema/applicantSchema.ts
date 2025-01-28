import * as Yup from "yup";

const MAX_FILE_SIZE= 5 * 1024 * 1024 // 5MB
export const applicantSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First name is required")
    .matches(/^[A-Za-z]+$/, "Invalid Name"),
  lastName: Yup.string()
    .required("Last name is required")
    .matches(/^[A-Za-z]+$/, "Invalid Name"),
  email: Yup.string()
    .required("Email is required")
    .matches(
      /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be a valid email"
    ),
  phone:Yup.string()
  .matches(
    /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s\-]?)?[\d\-]{7,10}$/,
    "Phone number is not valid"
  )
  .required("Phone number is required"),
  experience:Yup.number().min(0).required("Experience is Required"),
  vacanyId:Yup.string().required("Select Job"),
  resume: Yup.mixed().required('Resume is required')
  .test('fileFormat', 'Only PDF files are allowed', (value:any) => {
    if (value) {
      const supportedFormats = ['pdf'];
      return supportedFormats.includes(value.name.split('.').pop());
    }
    return true;
  })
  .test('fileSize', 'File size must not be more than 5MB', 
  (value:any) => {
    if (value) {
      return value.size <= MAX_FILE_SIZE;
    }
    return true;
  }),
});
