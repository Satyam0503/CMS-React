import { Card, Stack, Switch, Typography } from "@mui/material";
import { useState, FC, useEffect } from "react";
import { useIntl } from "react-intl";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { getAllModulesInfo } from "../../adminservices";
import { ModulesInfoModel } from "../../models";
export const ApplicationModules: FC = () => {
  const intl = useIntl();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [moduleInfo, setModuleInfo] = useState<ModulesInfoModel[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<number | undefined>();

  const closeConfirmationModal = () => {
    setIsConfirmModalOpen(false);
  };

  const updateModuleAccessibility = (moduleId: number) => {
    try {
      // Call Update Module API here...
      setRefresh(!refresh);
      setIsConfirmModalOpen(false);
    } 
    catch (error) {
      console.log(error);
      setIsConfirmModalOpen(false);
    }

  }

  const handleModuleHiding =  (res: string, moduleId?: number): void => {
    if (res !== "ok") {
      closeConfirmationModal();
    } 
    else {
      if (moduleId !== undefined) {
        updateModuleAccessibility(moduleId);
      }
    }
  };


  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    moduleId: number
  ) => {
    if (!event.target.checked) {
      setCurrentModuleId(()=>moduleId)
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
        console.log(methodResults);
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
      <Stack component={Card} spacing={3} p={4} my={6}>
        <Stack>
          <Typography variant="h5" mb={1}>
            {intl.formatMessage({
              id: "COMPANY_DETAILS.TAB.APPLICATIONS",
            })}
          </Typography>
          <Typography variant="body2">
            Select which application modules you want to be enabled for your
            company.
          </Typography>
        </Stack>

        {moduleInfo.map((module) => {
          return (
            <>
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
            </>
          );
        })}
      </Stack>
      {isConfirmModalOpen && (
        <ConfirmationModal
          title={intl.formatMessage({ id: "TITLE.HIDE_MODULE" })}
          content={intl.formatMessage({ id: "CONFIRMATION.HIDE_MODULE" })}
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handleModuleHiding}
          ok_btn={true}
          moduleId={currentModuleId}
        />
      )}
    </>
  );
};
