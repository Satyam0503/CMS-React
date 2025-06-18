import { Card, Stack, TextField, Typography } from "@mui/material";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Edit } from "@mui/icons-material";
import { getEmployeeSummary, updateEmployeeSummary } from "../../userservices";
import { toast } from "react-toastify";
import { useAppSelector } from "../../../../Redux/hooks";
import { UserSummaryModel } from "../../../../../utils/common_types";
import { AxiosError } from "axios";
import { useParams } from "react-router-dom";
import { checkPermissionForModulesFeatureAccess, hasModuleFeaturePermission } from "../../../../../utils/common";
import { ModulesName, Permission } from "../../../../../utils/enums";

export const UserSummary = () => {
  const currentUser = useAppSelector((state) => state.user.userData)!;
  const [userSummary, setUserSummary] = useState<UserSummaryModel>();
  const [updatedSummary, setUpdatedSummary] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const { formatMessage } = useIntl();
  const { employeeid } = useParams();
  const userPermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasEmployeeEditPermission = !employeeid || hasModuleFeaturePermission(ModulesName.Employees, Permission.Edit, userPermissions);


  const handleClose = () => {
    setEdit(false);
    setUpdatedSummary("");
  };
  const handleUpdateSummary = async () => {
    const payload = {
      summary: updatedSummary,
      summaryId: userSummary?.summaryId ?? "",
      userId: employeeid ?? currentUser.userId,
    };
    try {
      const response = await updateEmployeeSummary(payload);
      const { success, message } = response.data;
      if (!success) {
        throw new Error("Failed To Update Summary");
      }
      toast.success(message);
      setRefresh(!refresh);
    } catch (error) {
      toast.error((error as AxiosError).message);
    } finally {
      handleClose();
    }
  };

  useEffect(() => {
    getEmployeeSummary(employeeid ?? "")
      .then((response) => {
        const { success, methodResult, statusCode } = response.data;
        if (success && statusCode === 200) {
          setUserSummary(methodResult);
        }
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, [refresh]);

  return (
    <Card sx={{ p: 2 }}>
      <Stack className="flex-row justify-content-between mb-4"  >
        <Typography variant="h5">
          {formatMessage({ id: "INFO.SUMMARY" })}
        </Typography>
        {isEdit ? (
          <Stack direction="row" spacing={1}>
            <CustomisedButton
              label={formatMessage({ id: "BUTTON.CANCEL" })}
              variant="outlined"
              handleClick={() => handleClose()}
            />
            <CustomisedButton
              label={formatMessage({ id: "BUTTON.UPDATE" })}
              variant="contained"
              handleClick={handleUpdateSummary}
              disabled={updatedSummary.length === 0}
            />
          </Stack>
        ) : (
          <>
            {
              hasEmployeeEditPermission &&
              <CustomIconButton
                tooltip={formatMessage({ id: "BUTTON.EDIT" })}
                icon={<Edit />}
                handleClick={() => {
                  setEdit(true);
                  setUpdatedSummary(userSummary?.summary ?? "");
                }}
              />
            }
          </>
        )}
      </Stack>
      {isEdit ? (
        <TextField
          sx={{ mt: 1 }}
          fullWidth
          multiline
          id="user_summary"
          placeholder={formatMessage({ id: "FORM.TYPE" })}
          variant="outlined"
          value={updatedSummary}
          onChange={(e) => setUpdatedSummary(e.target.value)}
        />
      ) : (
        <Typography variant="body1" >
          {userSummary && userSummary.summary.trim().length > 0
            ? userSummary.summary
            : formatMessage({ id: "USER.ADD_SUMMARY" })}
        </Typography>
      )
      }
    </Card >
  );
};
