import { FC, useState } from "react";
import { IconButton, Switch, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { addEditDepartment } from "../../adminservices";
import { Check, Close } from "@mui/icons-material";
import { useLang } from "../../../../../_themes/i18n/Metronici18n";

interface Props {
  translationLang: string;
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose:()=>void;
}

const AddNewAttributeItem: FC<Props> = ({ translationLang, refresh, setRefresh,handleClose }) => {
  const currentLang = useLang();
  const [newAttributeValue, setNewAttributeValue] = useState({
    isActive: true,
    currentLangTitle:"",
    translationTitle: "",
  });

  const handleAdd = async ( value: typeof newAttributeValue,e:React.FormEvent<HTMLFormElement> ) => {
    e.preventDefault();
    const payload = {
      isActive:value.isActive,
      titles:[{language:translationLang,label:value.translationTitle},{language:currentLang,label:value.currentLangTitle}]
    }
    try {
      const response = await addEditDepartment(payload);
      if (response.data.success) {
        toast.success(response.data.message);
        setRefresh(!refresh);
        handleClose();
      }
    } catch (error) {
      console.log(error instanceof Error ? error.message : error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewAttributeValue({
      ...newAttributeValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setNewAttributeValue({
      ...newAttributeValue,
      isActive: checked,
    });
  };
  return (
    <form className="department-row" onSubmit={(e)=>handleAdd(newAttributeValue,e)}>
      <TextField
        value={newAttributeValue.currentLangTitle}
        onChange={handleChange}
        name="currentLangTitle"
        required
      />
      <TextField
        value={newAttributeValue.translationTitle}
        onChange={handleChange}
        name="translationTitle"
        required
      />
      <Switch
        checked={newAttributeValue.isActive}
        onChange={handleSwitchChange}
      />
      <div className="d-flex align-items-center gap-2">
        <IconButton
          className="border-0"
          type="submit"
        >
         <Check/>
        </IconButton>
        <IconButton
          onClick={handleClose}
          className="border-0"
        >
          <Close />
        </IconButton>
      </div>
    </form>
  );
};
export { AddNewAttributeItem };
