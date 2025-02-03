import { Card, Chip, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { AddUpdateSkills } from "./AddUpdateSkills";
import { CustomIconButton } from "../../../components/CustomIconButton";
import { Add } from "@mui/icons-material";
import { getEmployeeSkills, udpateEmployeeSkills } from "../../userservices";
import { toast } from "react-toastify";

export const UserSkills = () => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(false);

  // useEffect(()=>{
  //   getEmployeeSkills()
  //   .then(response=>{
  //     const {success,methodResult}= response.data;
  //     if(success){
  //       setUserSkills(methodResult.skills)
  //     }
  //   })
  //   .catch(error=>{
  //     toast.error(error.message);
  //   })
  // },[refresh])

  async function handleSkillUpdate(skills:string[]) {
    try {
      const response = await udpateEmployeeSkills({ skills: skills });
      const { message, success } = response.data;
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
      setRefresh(!refresh);
    } catch (error: any) {
      toast.error(error.message);
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
          tooltip="Add"
          handleClick={() => setOpen(true)}
        />
      </Stack>

      <Stack direction="row" gap={1} flexWrap={"wrap"}>
        {userSkills?.length === 0 ? (
          <Typography variant="body2">
            {intl.formatMessage({ id: "ADD.SKILLS" })}
          </Typography>
        ) : (
          userSkills?.map((skill, index) => <Chip key={index} label={skill} />)
        )}
      </Stack>

      {open && (
        <AddUpdateSkills
          open={open}
          setOpen={setOpen}
          userSkills={userSkills}
          handleSkillUpdate={handleSkillUpdate}
        />
      )}
    </Card>
  );
};
