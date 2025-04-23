import { Card, Chip, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { AddUpdateSkills } from "./AddUpdateSkills";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import { Add } from "@mui/icons-material";
import { getEmployeeSkills, udpateEmployeeSkills } from "../../userservices";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useUserDetails } from "../../UserDataProvider";
import { useParams } from "react-router-dom";
import { checkPermissionForModulesFeatureAccess } from "../../../../../utils/common";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { useAppSelector } from "../../../../Redux/hooks";
import { SkillModel } from "../../models";

export const UserSkills = () => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { updateTotalSkills } = useUserDetails();
  const employeeId  = useParams().employeeid;
  const userPermissions = useAppSelector((state) => state.user.userData?.modulePermission) || [];
  const [userSkills,setUserSkills]= useState<SkillModel[]>([]);
 
  useEffect(() => {
    getEmployeeSkills(employeeId ?? "")
      .then((response) => {
        const { success, methodResult } = response.data;
        if (success) {
            setUserSkills(methodResult.skills);
            updateTotalSkills(methodResult.skills.length);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }, [refresh]);
 
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
        {(!employeeId ||
          checkPermissionForModulesFeatureAccess(
            `${ModulesName.Employees}.${Permission.Edit}`,
            userPermissions
          )) && (
          <CustomIconButton icon={<Add />} handleClick={() => setOpen(true)} />
        )}
      </Stack>

      <Stack direction="row" gap={1} flexWrap={"wrap"}>
        {userSkills?.length === 0 ? (
          <Typography variant="body2">
            {intl.formatMessage({ id: "ADD.SKILLS" })}
          </Typography>
        ) : (
          userSkills?.map((skill, index) => <Chip key={index} label={skill.name} />)
        )}
      </Stack>

      {open && (
        <AddUpdateSkills
          open={open}
          setOpen={setOpen}
          userSkills={userSkills}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      )}
    </Card>
  );
};
