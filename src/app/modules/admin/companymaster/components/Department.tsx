import { Box, Card, Grid, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useEffect, useState } from "react";
import { Add, Edit } from "@mui/icons-material";
import { addDepartment, getAllDepartments } from "../../adminservices";
import { AddEditDepartment } from "./AddEditDeparment";
import { toast } from "react-toastify";
import { DepartmentModel } from "../../models";
import { CustomisedTable } from "../../../../shared/components/CustomisedTable";
import { DepartmentTableColumnList } from "../../../../../utils/constant/Constant";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { DepartmentRow } from "./DepartmentRow";
import { colors } from "../../../theme/MuiTheme";

const initialValues: DepartmentModel = {
  departmentName: "",
  departmentDescription: "",
};

const Departments = () => {
  const {formatMessage} = useIntl();
  const [isOpen, setOpen] = useState(false);
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);
  const [isEdit, setEdit] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedDepartment,setSelectedDepatment]= useState<string>();
  const [isConfirmModalOpen,setConfirmModalOpen]= useState(false);
  const [initialDepartmentValues, setInitialDepartmentValue] =  useState<DepartmentModel>(initialValues);

  const handleClose = () => {
    setOpen(false);
    setEdit(false);
    setInitialDepartmentValue(initialValues);
  };

  const handleAddEdit = async (
    value: DepartmentModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      if (!isEdit) {
        const response = await addDepartment(value);
        if (response.data.success) {
          toast.success(response.data.message);
          setRefresh(!refresh);
          handleClose();
        }
      }
    } catch (error) {
      console.log(error instanceof Error ? error.message : error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDepartment = (department: DepartmentModel) => {
    setOpen(true);
    setEdit(true);
    setInitialDepartmentValue(department);
  };
  const openConfirmationModal = (department:DepartmentModel) => {
    setConfirmModalOpen(true);
    setSelectedDepatment(department.departmentId);
  };

  const handleDepartmentDelete =()=>{
    
  }

  useEffect(() => {
    const getAllDeps = async () => {
      try {
        const response = await getAllDepartments();
        const { success, methodResults } = response.data;
        if (success) {
          setDepartmentList(methodResults);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAllDeps();
  }, [refresh]);

  console.log(departmentList);
  
  return (
    <Box component={"div"} sx={{ p: 3 }} className="d-flex flex-column gap-8">
      <Stack
        direction={"row"}
        className="justify-content-between align-items-center flex-wrap gap-4"
      >
        <Typography variant="h5">
          {formatMessage({ id: "COMPANY_MASTER.DEPARTMENT.TOTAL" })}:{" "}
          {departmentList.length}
        </Typography>
        <CustomisedButton
          Icon={<Add />}
          label={formatMessage({ id: "BUTTON.ADD" })}
          handleClick={() => setOpen(true)}
        />
      </Stack>

      <Stack className="department-container">
          <Box className="department-row" >
            <Typography variant="body1" className="fw-bolder">{formatMessage({id:"Department.Title"})}</Typography>
            <Typography variant="body1" className="fw-bolder">{formatMessage({id:"Department.Description"})}</Typography>
            <Typography variant="body1" className="fw-bolder">{formatMessage({id:"JOB.STATUS"})}</Typography>
          </Box>
          {
            departmentList.map(department=>(
              <DepartmentRow departmentData={department}/>
            ))
          }
          <Stack spacing={1} direction={"row"} sx={{justifyContent:"flex-end",mt:3}}>
            <CustomisedButton variant="outlined" label={formatMessage({id:"BUTTON.CANCEL"})} handleClick={()=>setDepartmentList([...departmentList])} />
            <CustomisedButton label={formatMessage({id:"BUTTON.UPDATE"})} />
          </Stack>
      </Stack>

      {isOpen && (
        <AddEditDepartment
          open={isOpen}
          initialValues={initialDepartmentValues}
          handleClose={handleClose}
          isEdit={isEdit}
          handleAddEdit={handleAddEdit}
        />
      )}
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
    </Box>
  );
};

export { Departments };
