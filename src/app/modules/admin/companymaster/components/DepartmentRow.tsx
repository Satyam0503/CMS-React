import { Box, IconButton, Stack, Switch, TextField } from "@mui/material"
import { ChangeEvent, FC, useEffect, useState } from "react"
import { DepartmentModel } from "../../models"
import { Delete } from "@mui/icons-material";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { useIntl } from "react-intl";

type Props={
    departmentData:DepartmentModel;
}

export const DepartmentRow:FC<Props> = ({departmentData})=>{
    const {formatMessage}= useIntl();
    const [department,setDepartment] = useState<DepartmentModel>(departmentData);
    const [isConfirmModalOpen,setConfirmModalOpen]= useState(false);
    const handleChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
        setDepartment({
            ...department,
            [e.target.name]:e.target.value
        })
    }
    const handleDepartmentDelete = ()=>{
        console.log(department.departmentId);
    }

    useEffect(()=>{
        console.log("render");
        setDepartment(departmentData);
    },[departmentData])
    
    return (
        <>
        <Box className="department-row">
            <TextField value={department.departmentName} onChange={handleChange} name="departmentName"/>
            <TextField  value={department.departmentDescription} onChange={handleChange} name="departmentDescription"/>
            <Switch  checked={true}/>
            <IconButton  onClick={()=>setConfirmModalOpen(true)} className="border-0">
                <Delete color="error"/>
            </IconButton>
        </Box>
        {
            isConfirmModalOpen && (
                <ConfirmationModal 
                    open={isConfirmModalOpen}
                    title={formatMessage({id:"Department.Delete"})}
                    content={formatMessage({id:"Department.Delete.Alert"})}
                    handleClose={()=>setConfirmModalOpen(false)}
                    handleConfirmation={handleDepartmentDelete}
                />
            )
        }
        </>
    )
}