import dayjs, { Dayjs } from "dayjs";
import { EmployeesDataTypes } from "./common_types";

export const dateFormatter = (date:Date | Dayjs | null,format:string)=>{
    return dayjs().format(format);
}

export const employeesListMapperforExport = (employeesList:EmployeesDataTypes[])=>{
    const mappedData = employeesList.map(employee=>{
        return {
            "Id": employee.id,
            "First Name":employee.firstName,
            "Last Name":employee.lastName,
            "Email":employee.email,
            "Phone Number":employee.phoneNumber,
            "Gender":employee.gender,
            "Job Role":employee.jobRole,
            "Date of Birth": dateFormatter(employee.dateOfBirth,"DD MMMM YYYY"),
            "Date of Joining":dateFormatter(employee.dateOfJoining,"DD MMMM YYYY"),
            'Department':employee.department,
            "Address":employee.address,
        }
    })
    return mappedData;
}