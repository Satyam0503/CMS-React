import Typography from "@mui/material/Typography";
import { Autocomplete, Chip, CircularProgress, InputAdornment, Stack, TextField } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { FC, useEffect, useState } from "react";
import { SkillModel } from "../../models";
import React from "react";
import { getSkillsList, udpateEmployeeSkills } from "../../userservices";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useParams } from "react-router-dom";


type PropsType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userSkills: SkillModel[];
  refresh:boolean;
  setRefresh:React.Dispatch<React.SetStateAction<boolean>>
};

export const AddUpdateSkills: FC<PropsType> = ({
  userSkills,
  open,
  setOpen,
  refresh,
  setRefresh
}) => {
  const intl = useIntl();
  const [loading,setLoading]= useState(false);
  const [isListOpen,setListOpen]= useState(false);
  const [searchValue,setSearchValue] = useState("");
  const [skillsOption, setSkillsOptions] = useState<SkillModel[]>([]);
  const [selectedSkills,setSelectedSkills] = useState<SkillModel[]>([]);
  const employeeId  = useParams().employeeid;

  function handleClose() {
    setOpen(false);
  }

  const handleListClose = () => {
    setListOpen(false);
    setSkillsOptions([]);
  };

  const handleSelectedSkillsChange = (values:SkillModel[])=>{
    const skillsIds = values.map(skill=>skill.id);
    const selectedSkillsIds = selectedSkills.map(skill=>skill.id);
    const filteredSelectedSkills = skillsIds.filter(skill=> !selectedSkillsIds.includes(skill));
    setSelectedSkills([...selectedSkills, ...values.filter(skill => filteredSelectedSkills.includes(skill.id))]);
  }

    async function handleSkillUpdate() {
      const existingSkillsId = userSkills.map(skill=>skill.id);
      const selectedSkillsId = selectedSkills.filter(skill => !existingSkillsId.includes(skill.id)).map(skill =>skill.id);
      try {
        const response = await udpateEmployeeSkills({
          skills: [...selectedSkillsId,...userSkills.map(skill=>skill.id)],
          userId: employeeId ?? "",
        });
        const { message, success } = response.data;
        if (success) {
          toast.success(message);
          setRefresh(!refresh);
        }
      } catch (error) {
        toast.error((error as AxiosError).message);
      } finally {
        setOpen(false);
      }
    }

  useEffect(()=>{   
    const sanitizedValue = searchValue.trim().toLowerCase();    
    if(sanitizedValue.length === 0){
      setSkillsOptions([]);
      setListOpen(false);
      return;
    }
    let active= true;
    setLoading(true);
    (
      async ()=> {
        try {
           const response = await getSkillsList(sanitizedValue);
           const {success,methodResults} = response.data;
           if(success && active){
            setSkillsOptions(methodResults)
            setListOpen(true);
           }
        } catch (error) {
          console.log(error); 
        }
        finally{
          if(active){
              setLoading(false);
          }
        }
      } 
    )();
    return ()=>{ active=false};
  },[searchValue])
  
  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}>
        <Stack direction={"column"} spacing={2}>
          <Typography variant="h5">
            {intl.formatMessage({ id: "PROFILE.SKILLS" })}
          </Typography>
          <Stack>
            <Autocomplete 
              multiple
              open={isListOpen}
              disableCloseOnSelect
              options={skillsOption}
              getOptionLabel={option=>option.name}
              filterOptions={(x) => x}
              onClose={handleListClose}
              inputValue={searchValue}
              value={selectedSkills}
              onChange={(e,values)=>{
                handleSelectedSkillsChange(values);
              }}
              onInputChange={(e,newValue,reason)=>{
                if (reason === 'reset') {
                  return;
                }
                setSearchValue(newValue)
              }}
              renderInput={(params) => ( 
                <TextField
                   {...params}
                   placeholder={intl.formatMessage({id:"PROFILE.SEARCH_SKILLS"})}
                   InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                      ),
                   }}
                />
             )}
             sx={{
                "& .MuiOutlinedInput-root":{
                  padding:"4px"
                }
            }}
            />
            {/* <Stack
              direction={"row"}
              gap={1}
              flexWrap={"wrap"}
              sx={{ marginBlockStart: "1rem" }}
            >
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleDelete(skill)}
                />
              ))}
            </Stack> */}
          </Stack>

          <Stack direction={"row"} spacing={1} justifyContent={"flex-end"}>
            <CustomisedButton
              variant="outlined"
              label={intl.formatMessage({id:"BUTTON.CLOSE"})}
              handleClick={handleClose}
            />
            <CustomisedButton
              variant="contained"
              label={intl.formatMessage({id:"BUTTON.ADD"})}
              handleClick={handleSkillUpdate}
              disabled={selectedSkills.length ===0}
            />
          </Stack>
        </Stack>
      </CustomisedModal>
    </>
  );
};
