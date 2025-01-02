import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Chip, Grid, IconButton, InputAdornment, Stack, styled, TextField } from "@mui/material";
import { CustomisedModal } from "../components/CustomizedModal";
import { Add } from "@mui/icons-material";
import { addUserSkills } from "./userservices";
import { toast } from "react-toastify";
import { useUserDetails } from "./UserDataProvider";
import CustomisedButton from "../components/CustomisedButton";

type PropsType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  skills: string[];
}

// get id and token from store
const id = "92fb9794-31c8-4b55-a4b4-dfa74c6cb007";
const token = JSON.parse(localStorage.getItem("kt-auth-react-v") || "{}");

export const AddUpdateSkills = (props: PropsType) => {
  const { isRefresh, setRefresh } = useUserDetails();
  const [newSkill, setNewSkill] = React.useState('');
  const [skills, setSkills] = React.useState<string[]>(props.skills);
  const { open, setOpen } = props;

  function handleDelete(skill: string) {
    setSkills(skills.filter(item => item !== skill));
  }

  function handleAddSkill() {
    setSkills([...skills, newSkill]);
    setNewSkill("")
  }

  function handleClose() {
    setNewSkill("")
    setOpen(false);
  }

  function handleSkillUpdate() {
    addUserSkills(id, { skills }, token)
      .then(res => {
        const { success, message } = res.data;
        if (success) {
          setRefresh(!isRefresh);
          toast.success(message)
        }
      })
      .catch(error => {
        toast.error("Failed To Update Skills");
      })
      .finally(() => {
        handleClose();
      })
  }
  return (
    <CustomisedModal open={open} handleClose={handleClose}>
        <Stack direction={"column"} spacing={2}>
          <Typography variant="h5" className="text-primary">
            Skills
          </Typography>
          <Stack>
            <TextField
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" disablePointerEvents={!newSkill}>
                    <IconButton onClick={handleAddSkill}>
                      <Add />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              variant="outlined"
              placeholder="Type ..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <Stack direction={"row"} gap={1} sx={{marginBlockStart:"1rem",flexWrap:"wrap"}}>
              {
                skills.map(skill => (
                  <Chip label={skill} onDelete={() => handleDelete(skill)} />
                ))
              }
            </Stack>
          </Stack>

          <Stack direction={"row"} spacing={1} sx={{ justifyContent: "flex-end" }}>
            <CustomisedButton variant="outlined" label="Cancel" handleClick={handleClose} />
            <CustomisedButton variant="contained" label="Update" handleClick={handleSkillUpdate} disabled={skills.length === 0} />
          </Stack>
        </Stack>
    </CustomisedModal>
  );
}
