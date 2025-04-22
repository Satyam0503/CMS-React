import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { useEffect, useState } from "react";
import { addEditDepartment, getAllDepartments } from "../../adminservices";
import { DepartmentModel } from "../../models";
import { DepartmentRow } from "./DepartmentRow";
import { languages } from "../../../../../utils/constant/Constant";
import { toast } from "react-toastify";
import { AddDepartment } from "./AddDeparment";
import { Add } from "@mui/icons-material";

const Departments = () => {
  const { formatMessage } = useIntl();
  const [isOpen, setOpen] = useState(false);
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [editedDeparment, setEditedDepartment] = useState<DepartmentModel | null>(null);
  const [currentEditDepartment, setCurrentEditDepartment] = useState<string | null>(null);
  const [translationLang, setTranslationLang] = useState<string>(languages[1].lang );

  const setUpdatedDepartmentData = (department: DepartmentModel | null) => {
    setEditedDepartment(department);
  };

  const handleReset = () => {
    setCurrentEditDepartment(null);
    setEditedDepartment(null);
    setOpen(false);
  };

  const handleEditDepartment = async () => {    
    if (editedDeparment) {
      try {
        const response = await addEditDepartment(editedDeparment);
        const { success, message } = response.data;
        if (success) {
          toast.success(message);
          setCurrentEditDepartment(null);
          setEditedDepartment(null);
          setRefresh(!refresh);
        }
      } catch (error) {
        console.log(error);
      }
    }
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

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="language-translation">
            {formatMessage({ id: "SELECT.LANGUAGE.TRANSLATE" })}
          </InputLabel>

          <Select
            label={formatMessage({ id: "SELECT.LANGUAGE.TRANSLATE" })}
            labelId="language-translation"
            variant="outlined"
            value={translationLang}
            onChange={(e) => setTranslationLang(e.target.value)}
          >
            {languages.map((lang) => {
              if (lang.lang === "en") {
                return;
              }
              return <MenuItem key={lang.id} value={lang.lang}>{lang.name}</MenuItem>;
            })}
          </Select>
        </FormControl>
      </Stack>

      <Stack className="department-container">
        <Box className="department-row">
          {["Department.Title", "Department.Title2", "Department.Status"].map(
            (title) => (
              <Typography variant="body1" className="fw-bolder">
                {formatMessage({ id: title }, { language: translationLang })}
              </Typography>
            )
          )}
        </Box>
        {departmentList.map((department) => (
          <DepartmentRow
            key={department.departmentId}
            departmentData={department}
            setUpdatedDepartmentData={setUpdatedDepartmentData}
            currentEditDepartment={currentEditDepartment}
            setCurrentEditDepartment={setCurrentEditDepartment}
            translationLanguage={translationLang}
            refresh={refresh}
            setRefresh={setRefresh}
          />
        ))}
        {
          isOpen && <AddDepartment translationLang={translationLang} refresh={refresh} setRefresh={setRefresh} handleClose={()=>setOpen(false)}/>
        }
        <span role="button" className="fw-bolder d-flex align-items-center align-self-start mt-4" onClick={()=>setOpen(true)}> <Add/>  Add New</span>
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
            handleClick={() => handleEditDepartment()}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export { Departments };
