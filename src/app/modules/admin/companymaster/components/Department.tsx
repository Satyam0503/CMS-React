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
import { AttributeItemRow } from "./AttributeItemRow";
import { languages } from "../../../../../utils/constant/Constant";
import { toast } from "react-toastify";
import { AddNewAttributeItem } from "./AddNewAttributeItem";
import { Add } from "@mui/icons-material";
import { useLang } from "../../../../../_themes/i18n/Metronici18n";

const Departments = () => {
  const { formatMessage } = useIntl();
  const [isOpen, setOpen] = useState(false);
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [editedDeparment, setEditedDepartment] = useState<DepartmentModel | null>(null);
  const [currentEditDepartment, setCurrentEditDepartment] = useState<string | null>(null);
  const [translationLang, setTranslationLang] = useState<string>(languages[1].lang );
  const currentLang = useLang();

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
              if (lang.lang === currentLang) {
                return;
              }
              return <MenuItem key={lang.id} value={lang.lang}>{lang.name}</MenuItem>;
            })}
          </Select>
        </FormControl>
      </Stack>

      <Stack className="department-container">
        <Box className="department-row">
              <Typography variant="body1" className="fw-bolder">
                {formatMessage({ id: "Attribute.Title" }, { language: languages.find(lang=>lang.lang===currentLang)?.name })}
              </Typography>
              <Typography variant="body1" className="fw-bolder">
                {formatMessage({ id: "Attribute.Title2" }, { language: languages.find(lang=>lang.lang===translationLang)?.name })}
              </Typography>
              <Typography variant="body1" className="fw-bolder">
                {formatMessage({ id: "Attribute.Status" })}
              </Typography>
        </Box>

        {departmentList.map((department) => (
          <AttributeItemRow
            key={department.departmentId}
            itemData={department}
            setUpdatedItemData={setUpdatedDepartmentData}
            currentActiveItem={currentEditDepartment}
            setCurrentActiveItem={setCurrentEditDepartment}
            translationLanguage={translationLang}
            refresh={refresh}
            setRefresh={setRefresh}
          />
        ))}

        {
          isOpen && <AddNewAttributeItem translationLang={translationLang} refresh={refresh} setRefresh={setRefresh} handleClose={()=>setOpen(false)}/>
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
