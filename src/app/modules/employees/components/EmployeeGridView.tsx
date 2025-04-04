import { FC } from "react";
import { EmployeeModel } from "../../../../utils/common_types";
import { Box, Card } from "@mui/material";

interface Props {
    employeeList: EmployeeModel[];
    isLoading:boolean;
}

const EmployeeGridView:FC <Props> = ({employeeList,isLoading})=>{
    return (
        <Box component={'div'} className="employee-grid-container">
            {employeeList.length > 0 && 
                employeeList.map(emp =>(
                    <Card className="employee-card" key={emp.userId}>
                        
                        <img src={emp.fullProfileUrl ?? ""}/>
                    </Card>

                ))
            }
        </Box>
    )
}

export {EmployeeGridView};