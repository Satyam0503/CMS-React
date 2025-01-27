import dayjs, { Dayjs } from "dayjs";
import { EmployeeModel } from "./common_types";

export const dateFormatter = (date: Date | Dayjs | null, format: string) => {
  return dayjs(date).format(format);
};

export const employeesListMapperforExport = (
  employeesList: EmployeeModel[]
) => {
  const mappedData = employeesList.map((employee) => {
    return {
      Id: employee.userId,
      "First Name": employee.firstName,
      "Last Name": employee.lastName,
      "Email": employee.email,
      "Phone Number": employee.phoneNumber,
      "Gender": employee.gender,
      "Date of Birth": dateFormatter(employee.dateOfBirth, "DD MMMM YYYY"),
      "Date of Joining": dateFormatter(employee.dateOfJoining, "DD MMMM YYYY"),
      "Department": employee.department,
      "Address": employee.address,
    };
  });
  return mappedData;
};

export const applicationStatusDecoder = (status: number) => {
  switch (status) {
    case 1:
      return "Pending";
    case 2:
      return "Rejected";
    case 3:
      return "Shortlisted";
    default:
      return "";
  }
};

export const statusEncoder = (status:string)=>{
  switch (status){
    case "Active": return true;
    case "Inactive": return false;
    default: return false;
  }
}
export const statusDecoder  = (status:boolean)=>{
  switch (status){
    case true: return "Active";
    case false: return "Inactive";
    default: return "";
  }
}

export const getStatusColor = (status:number):string =>{
    switch(status){
        case 1: return "warning";
        case 2: return "danger";
        case 3: return "success";
        default: return "";
    }
}


export const experienceCategoryList = [
  { id: 1, label: "0 - 1", value: 1 },
  {
    id: 2,
    label: "1 - 2",
    value: 2,
  },
  {
    id: 3,
    label: "2 - 3",
    value: 3,
  },
  {
    id: 4,
    label: "3 - 4",
    value: 4,
  },
  {
    id: 5,
    label: "4 - 5",
    value: 5,
  },
  {
    id: 6,
    label: "5 - 6",
    value: 6,
  },
  {
    id: 7,
    label: "6 - 7",
    value: 7,
  },
  {
    id: 8,
    label: "7 - 8",
    value: 8,
  },
  {
    id: 9,
    label: "8 - 9",
    value: 9,
  },
  {
    id: 10,
    label: "9 - 10",
    value: 10,
  },
  {
    id: 11,
    label: "10 - 11",
    value: 11,
  },
  {
    id: 12,
    label: "11 - 12",
    value: 12,
  },
  {
    id: 13,
    label: "12 - 13",
    value: 13,
  },
  {
    id: 14,
    label: "13 - 14",
    value: 14,
  },
  {
    id: 15,
    label: "14 - 15",
    value: 15,
  },
];

export const getAgeInYears=(dob:Dayjs)=>{
  return dayjs(new Date()).diff(dob,"years");
}