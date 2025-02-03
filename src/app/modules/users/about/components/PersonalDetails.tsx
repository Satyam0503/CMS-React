import { Card, Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { dateFormatter } from "../../../../../utils/common";
import { UpdateUserInfo } from "./UpdateUserInfo";
import { useEffect, useState } from "react";
import { EmployeeModel } from "../../../../../utils/common_types";
import { getEmployeeById } from "../../userservices";
import { CustomIconButton } from "../../../components/CustomIconButton";
import { Edit } from "@mui/icons-material";

export const PersonalDetails = () => {
  const intl = useIntl();
  const [currentUser,setCurrentUser]= useState<EmployeeModel>({} as EmployeeModel);
  const [isModalOpen,setModalOpen]=useState(false);

  useEffect(()=>{
    getEmployeeById()
    .then(response=>{
      const {success,message,methodResult}= response.data;
      if(!success){
        throw new Error(message);
      }
      setCurrentUser(methodResult);
    })
    .catch(error=>{
      console.error(error);
    })
  },[])
  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        display={"flex"}
        justifyContent={"space-between"}
        mb={1}
      >
        <Typography variant="h5">
          {intl.formatMessage({ id: "PROFILE.PI" })}
        </Typography>
        <CustomIconButton 
          icon={<Edit/>}
          handleClick={()=>setModalOpen(true)}
        />
        {
          isModalOpen && currentUser && (
            <UpdateUserInfo open={isModalOpen} setOpen={setModalOpen} currentUser={currentUser} />
          )
        }
      </Stack>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.ADDRESS" })}
          </Typography>
          <Typography variant="body1">
            {currentUser?.address || "NA"}{" "}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
          </Typography>
          <Typography variant="body1">{currentUser?.email || "NA"}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.PHONE" })}
          </Typography>
          <Typography variant="body1">
            {currentUser?.phoneNumber || "NA"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.DOB" })}
          </Typography>
          <Typography variant="body1">
            {dateFormatter(currentUser?.dateOfBirth!, "DD MMMM YYYY") || "NA"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.GENDER" })}
          </Typography>
          <Typography variant="body1">{currentUser?.gender || "NA"}</Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.DOJ" })}
          </Typography>
          <Typography variant="body1">
            {dateFormatter(currentUser?.dateOfJoining!, "DD MMMM YYYY")}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.EMP_ID" })}
          </Typography>
          <Typography variant="body1">
            {currentUser?.employeeId || "NA"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.DEPARTMENT" })}
          </Typography>
          <Typography variant="body1">
            {currentUser?.department || "NA"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.REPORTING_MANAGER" })}
          </Typography>
          <Typography variant="body1">
            {currentUser?.reportingManager || "NA"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.TEAM_LEAD" })}
          </Typography>
          <Typography variant="body1">
            {currentUser?.teamLead || "NA"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.PERSONAL_EMAIL" })}
          </Typography>
          <Typography variant="body1">
            {currentUser?.personalEmail || "NA"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.EMERGENCY_CONTACT" })}
          </Typography>
          <Typography variant="body1">
            {currentUser?.emergencyContact || "NA"}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="body2">
            {intl.formatMessage({ id: "USER.BLOOD_GROUP" })}
          </Typography>
          <Typography variant="body1">
            {currentUser?.bloodGroup || "NA"}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
};
