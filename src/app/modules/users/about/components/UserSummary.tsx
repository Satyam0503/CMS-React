import { Card, Stack, TextField, Typography } from "@mui/material";
import CustomisedButton from "../../../components/CustomisedButton";
import { CustomIconButton } from "../../../components/CustomIconButton";
import { FC, useState } from "react";
import { useIntl } from "react-intl";
import { Edit } from "@mui/icons-material";
import { useUserDetails } from "../../UserDataProvider";
import { updateEmployeeSummary, UserSummaryModel } from "../../userservices";
import { useAppSelector } from "../../../../Redux/hooks";
import { toast } from "react-toastify";

export const UserSummary = () => {
  //   const {userDetails,isRefresh,setRefresh }= useUserDetails()
  const {userDetails:{userSummary},setRefresh,isRefresh}= useUserDetails();
  const [summary, setSummary] = useState(userSummary ? userSummary.summary : "");
  const [isEdit, setEdit] = useState(false);
  const token = useAppSelector(state=>state.auth.token)!;
  const intl = useIntl();

  const handleUpdateSummary = async () => {
    const payload={
        summary:summary,
        summaryId:""
    }
    try{
        const response = await updateEmployeeSummary(payload,token);
        const {success,message}=response.data;
        if(!success){
            throw new Error(message);
        }
        toast.success(message);
        setSummary("");
        setEdit(false);
        setRefresh(!isRefresh); 
    }
    catch(error:any){
        toast.error(error.message);
    }
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        display={"flex"}
        justifyContent={"space-between"}
        mb={1}
      >
        <Typography variant="h5">
          {intl.formatMessage({ id: "INFO.SUMMARY" })}
        </Typography>
        {isEdit ? (
          <Stack direction={"row"} spacing={1}>
            <CustomisedButton
              label="Cancel"
              variant="outlined"
              handleClick={() => {
                setEdit(false);
                setSummary("");
              }}
            />
            <CustomisedButton
              label="Update"
              variant="contained"
              handleClick={handleUpdateSummary}
              disabled={summary.length === 0}
            />
          </Stack>
        ) : (
          <CustomIconButton
            tooltip="Edit"
            icon={<Edit />}
            handleClick={() => setEdit(true)}
          />
        )}
      </Stack>
      {isEdit ? (
        <TextField
          sx={{ mt: 1 }}
          fullWidth
          multiline
          id="user_summary"
          placeholder="Type..."
          variant="outlined"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      ) : (
        <Typography variant="body1">
          {userSummary.summary || "Add Your Summary"}
        </Typography>
      )}
    </Card>
  );
};
