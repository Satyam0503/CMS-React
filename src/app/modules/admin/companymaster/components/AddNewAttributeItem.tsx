import { FC, useState } from "react";
import { Box, Switch, TextField } from "@mui/material";
import { useLang } from "../../../../../_themes/i18n/Metronici18n";
import { DepartmentModel } from "../../models";

interface Props {
  translationLang: string;
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setNewDepartmentsData: (department: DepartmentModel) => void;
  newDepartmentKey: string;
}

const AddNewAttributeItem: FC<Props> = ({ translationLang, setNewDepartmentsData, newDepartmentKey }) => {
  const currentLang = useLang();
  const [newAttributeValue, setNewAttributeValue] = useState<DepartmentModel>({ isActive: true, titles: [], newDepartmentKey: newDepartmentKey });

  const translationLanguageTitle = newAttributeValue.titles.find(title => title.language === translationLang)?.label ?? "";
  const currentLanguageTitle = newAttributeValue.titles.find(title => title.language === currentLang)?.label ?? "";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const titles = newAttributeValue.titles;
    const { value, name } = e.target;
    if (name === "currentLangTitle") {
      const index = titles.findIndex(title => title.language === currentLang);
      if (index > -1) {
        titles[index] = { label: value, language: currentLang };
      }
      else {
        titles.push({ label: value, language: currentLang })
      }
    }
    if (name === "translationTitle") {
      const index = titles.findIndex(title => title.language === translationLang);
      if (index > -1) {
        titles[index] = { label: value, language: translationLang };
      }
      else {
        titles.push({ label: value, language: translationLang })
      }
    }
    setNewAttributeValue({ ...newAttributeValue, titles: titles });
  };

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
    setNewDepartmentsData(newAttributeValue);
  }

  const handleSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    const department = {
      ...newAttributeValue,
      isActive: checked,
    }
    setNewAttributeValue(department);
    setNewDepartmentsData(department);
  };

  return (
    <Box className="attribute-row" >
      <TextField
        value={currentLanguageTitle}
        onChange={handleChange}
        name="currentLangTitle"
        onBlur={handleOnBlur}
      />
      <TextField
        value={translationLanguageTitle}
        onChange={handleChange}
        name="translationTitle"
        onBlur={handleOnBlur}
      />
      <Switch
        checked={newAttributeValue.isActive}
        onChange={handleSwitchChange}
      />
    </Box>
  );
};
export { AddNewAttributeItem };
