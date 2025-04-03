import { Box, Card, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { addDepartment, getAllDepartments } from "../../adminservices";
import { AddEditDepartment } from "./AddEditDeparment";
import { AddDepartmentPayloadModel } from "../../models";
import { toast } from "react-toastify";

const initialValues: AddDepartmentPayloadModel = {
  departmentName: "",
  departmentDescription: "",
};

const Departments = () => {
  const intl = useIntl();
  const [isOpen, setOpen] = useState(false);
  const [departmentList, setDepartmentList] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const handleAddEdit = async (
    value: AddDepartmentPayloadModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      if (!isEdit) {
        const response = await addDepartment(value);
        if (response.data.success) {
          toast.success("department successfully added");
          setRefresh(!refresh);
        }
      }
    } catch (error) {
      console.log(error instanceof Error ? error.message : error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const getAllDeps = async () => {
      try {
        const response = await getAllDepartments();
        const { success } = response.data;
        if (success) {
          setDepartmentList([]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAllDeps();
  }, [refresh]);

  return (
    <Box component={"div"} sx={{ p: 2 }} className="mt-4">
      <Stack
        direction={"row"}
        className="justify-content-between align-items-center"
      >
        <Typography variant="h5">
          {intl.formatMessage({ id: "COMPANY_MASTER.DEPARTMENT.TOTAL" })}:{" "}
          {departmentList.length}
        </Typography>
        <CustomisedButton
          Icon={<Add />}
          label={intl.formatMessage({ id: "BUTTON.ADD" })}
          handleClick={() => setOpen(true)}
        />
      </Stack>

      <Box component={"div"}>
        { 
          departmentList.length && 
          departmentList.map(department=>(
            <Card className="p-4 border-left border-4" >
              <Typography variant="h6">{department.departmentName}</Typography>
            </Card>
          ))
        }
      </Box>
      {isOpen && (
        <AddEditDepartment
          open={isOpen}
          initialValues={initialValues}
          handleClose={handleClose}
          isEdit={isEdit}
          handleAddEdit={handleAddEdit}
        />
      )}
    </Box>
  );
};

export { Departments };
