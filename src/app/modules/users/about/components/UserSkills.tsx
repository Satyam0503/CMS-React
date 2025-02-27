import { Card, Chip, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { AddUpdateSkills } from "./AddUpdateSkills";
import { CustomIconButton } from "../../../components/CustomIconButton";
import { Add } from "@mui/icons-material";
import { getEmployeeSkills, udpateEmployeeSkills } from "../../userservices";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useUserDetails } from "../../UserDataProvider";

export const UserSkills = () => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const {userSkills:skills,setUserSkills} = useUserDetails();

  useEffect(()=>{
    getEmployeeSkills()
    .then(response=>{
      const {success,methodResult}= response.data;
      if(success){
        setUserSkills(methodResult.skills.split(","))
      }
    })
    .catch(error=>{
      toast.error(error.message);
    })
  },[refresh])

  async function handleSkillUpdate(skills:string[]) {
    try {
      const response = await udpateEmployeeSkills({ totalSkills: skills.join(",") });
      const { message, success } = response.data;
      if (success) {
        toast.success(message);
        setRefresh(!refresh);
      }
    } catch (error) {
      toast.error((error as AxiosError).message);
    }
    finally{
      setOpen(false);
    }
  }

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        display={"flex"}
        justifyContent={"space-between"}
        mb={1}
      >
        <Typography variant="h5">
          {intl.formatMessage({ id: "PROFILE.SKILLS" })}
        </Typography>
        <CustomIconButton
          icon={<Add />}
          handleClick={() => setOpen(true)}
        />
      </Stack>

      <Stack direction="row" gap={1} flexWrap={"wrap"}>
        {skills?.length === 0 ? (
          <Typography variant="body2">
            {intl.formatMessage({ id: "ADD.SKILLS" })}
          </Typography>
        ) : (
          skills?.map((skill, index) => <Chip key={index} label={skill} />)
        )}
      </Stack>

      {open && (
        <AddUpdateSkills
          open={open}
          setOpen={setOpen}
          userSkills={skills}
          handleSkillUpdate={handleSkillUpdate}
        />
      )}
    </Card>
  );
};
