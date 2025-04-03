import { Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { getAllDepartments } from "../../adminservices";
import { AddEditDepartment } from "./AddEditDeparment";

const Departments = () => {
  const intl = useIntl();
  const [isOpen,setOpen]= useState(false);
  const [departmentList,setDepartmentList] = useState([]);
  const [isEdit,setEdit] = useState(false);
  const handleClose = ()=>{
    setOpen(false);
  }

  useEffect(()=>{
    const getAllDeps= async ()=>{
        try{
            const response = await getAllDepartments();
            const {success}= response.data;
            if(success){
                setDepartmentList([])
            }
        }
        catch(error){
            console.log(error);
        }
    }
    getAllDeps();
  },[])
  return (
    <Box component={"div"} sx={{ p: 2 }} className="mt-4">
      <Stack direction={"row"} className="justify-content-between align-items-center">
        <Typography variant="h5">
          {intl.formatMessage({ id: "COMPANY_MASTER.DEPARTMENT.TOTAL" })}
        </Typography>
        <CustomisedButton
          Icon={<Add/>}
          label={intl.formatMessage({ id: "BUTTON.ADD" })}
          handleClick={()=>setOpen(true)}
        />
        {
            isOpen && <AddEditDepartment open={isOpen} handleClose={handleClose} isEdit={isEdit}/>
        }
      </Stack>
    </Box>
  );
};

export { Departments };
