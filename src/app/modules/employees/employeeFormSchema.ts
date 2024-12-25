import { Emergency } from '@mui/icons-material';
import * as Yup from 'yup';

export const employeeSchema = Yup.object().shape({
    firstName:Yup.string().required("First name is required").matches(/^[A-Za-z]+$/,'Invalid Name'),
    lastName:Yup.string().required("last name is required").matches(/^[A-Za-z]+$/,'Invalid Name'),
    email:Yup.string().required("Email is required").matches(/^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Email must be a valid email"),
    employeeId:Yup.string().required("Employee Id is required"),
    address:Yup.string().required("Address is required"),
    jobRole:Yup.string().required("Job role is required"),
    gender:Yup.string().required("Gender is required"),
    department:Yup.string().required("Department is required"),
    reportingManager:Yup.string().required("Reporting manager name is required"),
    role:Yup.string().required("Role is required"),
    teamLead:Yup.string().required("Team lead name is required"),
    phoneNumber:Yup.string().matches(
        /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s\-]?)?[\d\-]{7,10}$/,
        'Phone number is not valid'
      ).required("Phone number is required"),
    bloodGroup:Yup.string().required("Blood group is required"),
    status:Yup.string().required("Status is required"),
    dateOfJoining:Yup.date().required("Date of Joining is required").typeError("Invalid Date Format").max(new Date(),"Date of Joining cannot be in the future"),
    dateOfBirth:Yup.date().required('Date of Birth is required').typeError('Invalid Date of Birth')
    .max(new Date(),'Date of Birth cannot be in the future'),
    personalEmail:Yup.string().required("Personal email is required").matches(/^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Email is not valid"),
    emergencyContact:Yup.string().matches(
        /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s\-]?)?[\d\-]{7,10}$/,
        'Emergency Contact is not valid'
      ).required("Emergency Contact is required"),
    languagesKnown:Yup.string().required("languages Required")
}) 