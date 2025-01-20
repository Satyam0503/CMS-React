import dayjs, { Dayjs } from "dayjs";
import { EmployeeModel } from "./common_types";

export const dateFormatter = (date:Date | Dayjs | null,format:string)=>{
    return dayjs().format(format);
}

export const employeesListMapperforExport = (employeesList:EmployeeModel[])=>{
    const mappedData = employeesList.map(employee=>{
        return {
            "Id": employee.userId,
            "First Name":employee.firstName,
            "Last Name":employee.lastName,
            "Email":employee.email,
            "Phone Number":employee.phoneNumber,
            "Gender":employee.gender,
            "Date of Birth": dateFormatter(employee.dateOfBirth,"DD MMMM YYYY"),
            "Date of Joining":dateFormatter(employee.dateOfJoining,"DD MMMM YYYY"),
            'Department':employee.department,
            "Address":employee.address,
        }
    })
    return mappedData;
}

export const getStatusClass = (status:string):string =>{
    switch(status){
        case "s" : 
    }
}