import {
  Box,
  IconButton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { DepartmentModel } from "../../models";
import {  ClearRounded, Delete, Edit } from "@mui/icons-material";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { useIntl } from "react-intl";
import { StyleStatus } from "../../../../shared/components/StyledStatus";
import clsx from "clsx";

type Props = {
  departmentData: DepartmentModel;
  handleDepartmentEdit: (department: DepartmentModel | null) => void;
  currentEditDepartment:string | null,
  setCurrentEditDepartment:React.Dispatch<React.SetStateAction<string | null>>
};

export const DepartmentRow: FC<Props> = ({
  departmentData,
  handleDepartmentEdit,
  currentEditDepartment,
  setCurrentEditDepartment
}) => {
  const { formatMessage } = useIntl();
  const [department, setDepartment] = useState<DepartmentModel>(departmentData);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDepartment({
      ...department,
      [e.target.name]: e.target.value,
    });
  };

  const handleDepartmentDelete = () => {
    console.log(department.departmentId);
  };

  const handleEditCancel = ()=>{
    setEdit(false);
    setDepartment(departmentData);
    setCurrentEditDepartment(null);
    handleDepartmentEdit(null)
  }

  const handleEdit = ()=>{
    setEdit(true);
    setCurrentEditDepartment(departmentData.departmentId!);
    handleDepartmentEdit(null)
  }

  useEffect(() => {
    setEdit(currentEditDepartment === departmentData.departmentId);
    if(currentEditDepartment !== departmentData.departmentId){
        setDepartment(departmentData);
    }
  }, [currentEditDepartment]);


  return (
    <>
      <Box className="department-row">
        {isEdit ? (
          <>
            <TextField
              value={department.departmentName}
              onChange={handleChange}
              name="departmentName"
              onBlur={()=>handleDepartmentEdit(department) }
              />
            <TextField
              value={department.departmentDescription}
              onChange={handleChange}
              name="departmentDescription"
              onBlur={()=>handleDepartmentEdit(department)}
            />
            <Switch checked={true} />
          </>
        ) : (
          <>
            <Typography variant="body1">{department.departmentName}</Typography>
            <Typography variant="body1">{department.departmentName}</Typography>
            <StyleStatus
              label="STATUS.ACTIVE"
              className={clsx({ success: true, danger: false })}
            />
          </>
        )}
        <div className="d-flex align-items-center">
          {!isEdit ? (
            <IconButton onClick={handleEdit} className="border-0">
              <Edit />
            </IconButton>
          ):
          <IconButton onClick={handleEditCancel} className="border-0">
          <ClearRounded />
        </IconButton>
        }
          <IconButton
            onClick={() => setConfirmModalOpen(true)}
            className="border-0"
          >
            <Delete color="error" />
          </IconButton>
        </div>
      </Box>
      {isConfirmModalOpen && (
        <ConfirmationModal
          open={isConfirmModalOpen}
          title={formatMessage({ id: "Department.Delete" })}
          content={formatMessage({ id: "Department.Delete.Alert" })}
          handleClose={() => setConfirmModalOpen(false)}
          handleConfirmation={handleDepartmentDelete}
        />
      )}
    </>
  );
};
