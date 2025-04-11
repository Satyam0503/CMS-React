import { Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import { getAllDepartments } from "../../adminservices";
import { DepartmentModel } from "../../models";
import { DepartmentRow } from "./DepartmentRow";
import { AddDepartment } from "./AddDeparment";

const Departments = () => {
  const { formatMessage } = useIntl();
  const [isOpen, setOpen] = useState(false);
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [editedDeparment, setEditedDepartment] = useState<DepartmentModel | null>(null);
  const [currentEditDepartment, setCurrentEditDepartment] = useState<string | null>( null);

  const handleDepartmentEdit = (department: DepartmentModel | null) => {
    setEditedDepartment(department);
  };

  const handleReset = () => {
    setCurrentEditDepartment(null);
    setEditedDepartment(null);
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
        <Box className="department-row">
          {[
            "Department.Title",
            "Department.Description",
            "Department.Status",
          ].map((title) => (
            <Typography variant="body1" className="fw-bolder">
              {formatMessage({ id: title })}
            </Typography>
          ))}
        </Box>
        {departmentList.map((department) => (
          <DepartmentRow
            key={department.departmentId}
            departmentData={department}
            handleDepartmentEdit={handleDepartmentEdit}
            currentEditDepartment={currentEditDepartment}
            setCurrentEditDepartment={setCurrentEditDepartment}
          />
        ))}
        <Stack
          spacing={1}
          direction={"row"}
          sx={{ justifyContent: "flex-end", mt: 3, flexShrink: 0 }}
        >
          <CustomisedButton
            variant="outlined"
            label={formatMessage({ id: "BUTTON.CANCEL" })}
            handleClick={handleReset}
          />
          <CustomisedButton
            label={formatMessage({ id: "BUTTON.UPDATE" })}
            handleClick={() => console.log(editedDeparment)}
          />
        </Stack>
      </Stack>

      {isOpen && (
        <AddDepartment
          open={isOpen}
          handleClose={()=>setOpen(false)}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      )}
    </Box>
  );
};

export { Departments };
