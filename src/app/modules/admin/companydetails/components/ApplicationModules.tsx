import { Card, Stack, Switch, Typography } from "@mui/material";
import { useState, FC, useEffect } from "react";
import { useIntl } from "react-intl";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { getAllModulesInfo, updateModuleAccess } from "../../adminservices";
import { ModulesInfoModel } from "../../models";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { setCurrentUser } from "../../../../Redux/Reducers/userSlice";

export const ApplicationModules: FC = () => {
  const { formatMessage } = useIntl();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [moduleInfo, setModuleInfo] = useState<ModulesInfoModel[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<string | undefined>();
  const user = useAppSelector(state => state.user.userData)!;
  const dispatch = useAppDispatch();

  const closeConfirmationModal = () => {
    setIsConfirmModalOpen(false);
    setCurrentModuleId(undefined);
  };

  const updateModuleAccessibility = async (moduleId: string) => {
    try {
      const response = await updateModuleAccess(moduleId);
      const { success, methodResult } = response.data;
      if (success) {
        dispatch(setCurrentUser({ ...user, modulePermission: [...methodResult] }))
        setRefresh(!refresh);
        closeConfirmationModal();
      }
    }
    catch (error) {
      console.log(error);
      toast.error(formatMessage({ id: "MESSAGE.MODULE.UPDATE.FAILED" }));
      closeConfirmationModal();
    }
  }

  const handleModuleHiding = (res: string): void => {
    if (res !== "ok" || !currentModuleId) {
      closeConfirmationModal();
    }
    else {
      updateModuleAccessibility(currentModuleId);
    }
  };


  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    moduleId: string
  ) => {
    if (!event.target.checked) {
      setCurrentModuleId(moduleId);
      setIsConfirmModalOpen(true);
    }
    else {
      updateModuleAccessibility(moduleId);
    }
  };

  useEffect(() => {
    const getAllModules = async () => {
      try {
        const response = await getAllModulesInfo();
        const { success, methodResults } = response.data;
        if (success) {
          setModuleInfo(methodResults);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAllModules();
  }, [refresh]);

  return (
    <>
      <Stack component={Card} spacing={3} p={3}>
        <Stack>
          <Typography variant="h5" mb={1}>
            {formatMessage({
              id: "COMPANY_DETAILS.TAB.MODULES",
            })}
          </Typography>
          <Typography variant="body2">
            {formatMessage({
              id: "COMPANY_DETAILS.MODULES.NOTE",
            })}
          </Typography>
        </Stack>

        {moduleInfo.map((module) => {
          return (
            <Stack
              direction="row"
              spacing={1}
              alignItems={"center"}
              key={module.moduleId}
            >
              <Stack>
                <Switch
                  checked={module.isAccessible}
                  onChange={(e) => handleChange(e, module.moduleId)}
                />
              </Stack>

              <Stack>
                <Typography variant="body1">{module.moduleName}</Typography>
              </Stack>
            </Stack>
          );
        })}
      </Stack >
      {isConfirmModalOpen && (
        <ConfirmationModal
          title={formatMessage({ id: "TITLE.HIDE_MODULE" })}
          content={formatMessage({ id: "CONFIRMATION.HIDE_MODULE" })}
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handleModuleHiding}
          ok_btn={true}
        />
      )
      }
    </>
  )
}
