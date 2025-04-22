import { FC, useState } from "react";
import { IconButton, Switch, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { addEditDepartment } from "../../adminservices";
import { Check, Close } from "@mui/icons-material";

interface Props {
  translationLang: string;
  refresh: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose:()=>void;
}

const AddDepartment: FC<Props> = ({ translationLang, refresh, setRefresh,handleClose }) => {

  const [departmentValue, setDepartmentValue] = useState({
    departmentName: "",
    isActive: true,
    title: "",
  });

  const handleAdd = async ( value: typeof departmentValue,e:React.FormEvent<HTMLFormElement> ) => {
    e.preventDefault();
    const payload = {
      departmentName:value.departmentName,
      isActive:value.isActive,
      titles:value.title.trim().length === 0 ? [] : [{language:translationLang,label:value.title}]
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
    setDepartmentValue({
      ...departmentValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleSwitchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setDepartmentValue({
      ...departmentValue,
      isActive: checked,
    });
  };
  return (
    <form className="department-row" onSubmit={(e)=>handleAdd(departmentValue,e)}>
      <TextField
        value={departmentValue.departmentName}
        onChange={handleChange}
        name="departmentName"
        required
      />
      <TextField
        value={departmentValue.title}
        onChange={handleChange}
        name="title"
      />
      <Switch
        checked={departmentValue.isActive}
        onChange={handleSwitchChange}
      />
      <div className="d-flex align-items-center">
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
export { AddDepartment };
