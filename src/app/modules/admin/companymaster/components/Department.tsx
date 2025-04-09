import { Box, Card, IconButton, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useEffect, useState } from "react";
import { Add, Edit } from "@mui/icons-material";
import { addDepartment, getAllDepartments } from "../../adminservices";
import { AddEditDepartment } from "./AddEditDeparment";
import { toast } from "react-toastify";
import { DepartmentModel } from "../../models";

const initialValues: DepartmentModel = {
  departmentName: "",
  departmentDescription: "",
};

const Departments = () => {
  const intl = useIntl();
  const [isOpen, setOpen] = useState(false);
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);
  const [isEdit, setEdit] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [initialDepartmentValues, setInitialDepartmentValue] =
    useState<DepartmentModel>(initialValues);

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

  return (
    <Box component={"div"} sx={{ p: 3 }} className="d-flex flex-column gap-5">
      <Stack
        direction={"row"}
        className="justify-content-between align-items-center flex-wrap gap-4"
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

      <Box component={"div"} className="department-card-conatiner">
        {departmentList.length > 0 &&
          departmentList.map((department) => (
            <Card
              className="department-card shadow-sm"
              key={department.departmentId}
            >
              <Typography variant="h6" className="department-label">
                {department.departmentName}
              </Typography>
              <Typography variant="body1">
                {department.departmentDescription}
              </Typography>
              <IconButton
                className="edit-btn"
                onClick={() => handleEditDepartment(department)}
              >
                <Edit />
              </IconButton>
            </Card>
          ))}
      </Box>
      {isOpen && (
        <AddEditDepartment
          open={isOpen}
          initialValues={initialDepartmentValues}
          handleClose={handleClose}
          isEdit={isEdit}
          handleAddEdit={handleAddEdit}
        />
      )}
    </Box>
  );
};

export { Departments };
