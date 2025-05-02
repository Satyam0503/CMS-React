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
import { useEffect, useRef, useState } from "react";
import { updateDepartment, getAllDepartments } from "../../adminservices";
import { DepartmentModel } from "../../models";
import { AttributeItemRow } from "./AttributeItemRow";
import { languages } from "../../../../../utils/constant/Constant";
import { toast } from "react-toastify";
import { AddNewAttributeItem } from "./AddNewAttributeItem";
import { Add } from "@mui/icons-material";
import { useLang } from "../../../../../_themes/i18n/Metronici18n";

const Departments = () => {
  const { formatMessage } = useIntl();
  const currentLang = useLang();
  const [departmentList, setDepartmentList] = useState<DepartmentModel[]>([]);
  const [newDepartmentsList, setNewDepartmentsList] = useState<DepartmentModel[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [translationLang, setTranslationLang] = useState<string>(languages.find(lang => lang.lang !== currentLang)?.lang!);
  const [newItemIds, setNewItemIds] = useState<string[]>([]);
  const initialAttributeValue = useRef<DepartmentModel[]>([]);

  const setUpdatedDepartmentData = (department: DepartmentModel) => {
    if (department?.departmentId) {
      setDepartmentList(departmentList.map(dep => {
        if (dep.departmentId === department.departmentId) {
          return department;
        }
        return dep;
      }));
    }
    else {
      setDepartmentList([...departmentList, department])
    }
  };

  const setNewDepartmentsData = (department: DepartmentModel) => {
    const index = newDepartmentsList.findIndex(dep => dep.newDepartmentKey === department.newDepartmentKey);
    if (index > -1) {
      setNewDepartmentsList(newDepartmentsList.map(dep => {
        if (dep.newDepartmentKey === department.newDepartmentKey) {
          return department;
        }
        else {
          return dep;
        }
      }))
    } else {
      setNewDepartmentsList([...newDepartmentsList, department])
    }
  }

  const handleReset = () => {
    setDepartmentList(initialAttributeValue.current);
    setNewItemIds([]);
    setNewDepartmentsList([]);
  };

  const handleUpdateDepartment = async () => {
    let allDepartments: DepartmentModel[] = [];
    if (newDepartmentsList.length > 0) {
      allDepartments = newDepartmentsList.map(dep => {
        return {
          isActive: dep.isActive,
          titles: [...dep.titles]
        }
      })
    }
    try {
      const response = await updateDepartment([...allDepartments, ...departmentList]);
      const { success } = response.data;
      if (success) {
        toast.success(formatMessage({ id: "MESSAGE.DEPARTMENT.UPDATE_SUCCESS" }));
        setNewItemIds([]);
        setNewDepartmentsList([]);
        setRefresh(!refresh);
      }
    } catch (error) {
      toast.success(formatMessage({ id: "MESSAGE.DEPARTMENT.UPDATE_FAILED" }));
      console.log(error);
    }
  };


  useEffect(() => {
    const getAllDeps = async () => {
      try {
        const response = await getAllDepartments();
        const { success, methodResults } = response.data;
        if (success) {
          setDepartmentList(methodResults);
          initialAttributeValue.current = methodResults;
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

      <Stack className="attribute-container">
        <Box className="attribute-row">
          <Typography variant="body1" className="fw-bolder">
            {formatMessage({ id: "Attribute.Title" }, { language: languages.find(lang => lang.lang === currentLang)?.name })}
          </Typography>
          <Typography variant="body1" className="fw-bolder">
            {formatMessage({ id: "Attribute.Title2" }, { language: languages.find(lang => lang.lang === translationLang)?.name })}
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
            translationLanguage={translationLang}
            refresh={refresh}
            setRefresh={setRefresh}
          />
        ))}
        {
          newItemIds.map(item => <AddNewAttributeItem key={item} translationLang={translationLang} refresh={refresh} setRefresh={setRefresh} setNewDepartmentsData={setNewDepartmentsData} newDepartmentKey={item} />)
        }
        <span role="button" className="fw-bolder d-flex align-items-center align-self-start mt-4" onClick={() => setNewItemIds([...newItemIds, Date.now().toString()])}> <Add /> {formatMessage({ id: "Attribute.Add_New" })} </span>
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
            handleClick={() => handleUpdateDepartment()}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export { Departments };
