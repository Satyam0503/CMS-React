import {
  Card,
  Stack,
  Typography,
} from "@mui/material";
import CustomisedButton from "../../../../shared/components/C_Button";
import { CustomIconButton } from "../../../../shared/components/C_IconButton";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Edit } from "@mui/icons-material";
import { getEmployeeSummary, updateEmployeeSummary } from "../../userservices";
import { toast } from "react-toastify";
import { useAppSelector } from "../../../../Redux/hooks";
import { AxiosError } from "axios";
import { useParams } from "react-router-dom";
import { hasModuleFeaturePermission } from "../../../../../utils/common";
import { ModulesName, Permission } from "../../../../../utils/enums";
import { UserSummaryModel } from "../../models";

import { AppTextField } from "../../../../shared/components/ui";
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
      const { success } = response.data;
      if (success) {
        toast.success(formatMessage({ id: "TOAST.SUCCESS.UPDATE_SUMMARY" }));
        setRefresh(!refresh);
      }
    } catch (error) {
      console.error((error as AxiosError).message);
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
    <Card sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, border: 1, borderColor: "divider", boxShadow: "0 8px 24px rgba(0,0,0,.05)" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={{ xs: 1, sm: 0 }} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {formatMessage({ id: "PROFILE.ABOUT.TITLE" })}
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
        <AppTextField
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
        <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7, minHeight: 28 }}>
          {userSummary && userSummary.summary.trim().length > 0
            ? userSummary.summary
            : formatMessage({ id: "PROFILE.ABOUT.ADD_SUMMARY" })}
        </Typography>
      )
      }
    </Card >
  );
};
