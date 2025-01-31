import { Card, Stack, TextField, Typography } from "@mui/material";
import CustomisedButton from "../../../components/CustomisedButton";
import { CustomIconButton } from "../../../components/CustomIconButton";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Edit } from "@mui/icons-material";
import {
  getEmployeeSummary,
  updateEmployeeSummary,
  UserSummaryModel,
} from "../../userservices";
import { toast } from "react-toastify";
import { useAppSelector } from "../../../../Redux/hooks";

export const UserSummary = () => {
  const currentUser = useAppSelector((state) => state.user.userData)!;
  const [userSummary, setUserSummary] = useState<UserSummaryModel>();
  const [updatedSummary, setUpdatedSummary] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const intl = useIntl();

  const handleUpdateSummary = async () => {
    const payload = {
      summary: updatedSummary,
      summaryId: userSummary?.summaryId!,
      userId: currentUser.userId,
    };
    try {
      const response = await updateEmployeeSummary(payload);
      const { success, message } = response.data;
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
      setEdit(false);
      setRefresh(!refresh);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getEmployeeSummary()
      .then((response) => {
        const { success, message, methodResult } = response.data;
        if (!success) {
          throw new Error(message);
        }
        setUserSummary(methodResult);
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
          {intl.formatMessage({ id: "INFO.SUMMARY" })}
        </Typography>
        {isEdit ? (
          <Stack direction={"row"} spacing={1}>
            <CustomisedButton
              label="Cancel"
              variant="outlined"
              handleClick={() => {
                setEdit(false);
                setUpdatedSummary("");
              }}
            />
            <CustomisedButton
              label="Update"
              variant="contained"
              handleClick={handleUpdateSummary}
              disabled={updatedSummary.length === 0}
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
          value={updatedSummary}
          onChange={(e) => setUpdatedSummary(e.target.value)}
        />
      ) : (
        <Typography variant="body1">
          {userSummary ? userSummary.summary : "Add Your Summary"}
        </Typography>
      )}
    </Card>
  );
};
