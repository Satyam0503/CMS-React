import * as React from "react";
import Typography from "@mui/material/Typography";
import { Chip, InputAdornment, Stack, TextField } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useAppSelector } from "../../../../Redux/hooks";
import { useUserDetails } from "../../UserDataProvider";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../../../components/CustomisedModal";
import { CustomIconButton } from "../../../components/CustomIconButton";
import CustomisedButton from "../../../components/CustomisedButton";
import { udpateEmployeeSkills } from "../../userservices";
import { toast } from "react-toastify";

type PropsType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userSkills: string[];
};

export const AddUpdateSkills: React.FC<PropsType> = ({
  userSkills,
  open,
  setOpen,
}) => {
  const { isRefresh, setRefresh } = useUserDetails();
  const [newSkill, setNewSkill] = React.useState("");
  const [skills, setSkills] = React.useState<string[]>(userSkills);
  const intl = useIntl();
  const token = useAppSelector((state) => state.auth.token)!;

  function handleDelete(skill: string) {
    setSkills(skills.filter((item) => item !== skill));
  }

  function handleAddSkill() {
    if (!skills.includes(newSkill.toUpperCase())) {
      setSkills([...skills, newSkill.toUpperCase()]);
      setNewSkill("");
    }
  }

  function handleClose() {
    setNewSkill("");
    setOpen(false);
  }

  async function handleSkillUpdate() {
    try {
      const response = await udpateEmployeeSkills({ skills: skills }, token);
      const { message, success } = response.data;
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
    } catch (error: any) {
      toast.error(error.message);
    }
  }
  return (
    <>
      <CustomisedModal open={open} handleClose={handleClose}>
        <Stack direction={"column"} spacing={2}>
          <Typography variant="h5">
            {intl.formatMessage({ id: "PROFILE.SKILLS" })}
          </Typography>
          <Stack>
            <TextField
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    position="end"
                    disablePointerEvents={!newSkill}
                  >
                    <CustomIconButton
                      icon={<Add />}
                      handleClick={handleAddSkill}
                    ></CustomIconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              placeholder="Type ..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <Stack
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
            </Stack>
          </Stack>

          <Stack direction={"row"} spacing={1} justifyContent={"flex-end"}>
            <CustomisedButton
              variant="outlined"
              label="Cancel"
              handleClick={handleClose}
            />
            <CustomisedButton
              variant="contained"
              label="Update"
              handleClick={handleSkillUpdate}
              disabled={skills.length === 0}
            />
          </Stack>
        </Stack>
      </CustomisedModal>
    </>
  );
};
