import { Card, Stack, Switch, Typography } from "@mui/material";
import { useState, FC, useEffect } from "react";
import { useIntl } from "react-intl";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { getAllModulesInfo } from "../../adminservices";
import { ModulesInfoModel } from "../../models";
export const ApplicationModules: FC = () => {
  const intl = useIntl();
  const [checked, setChecked] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [moduleInfo, setModuleInfo] = useState<ModulesInfoModel[]>([]);

  const closeConfirmationModal = () => {
    setIsConfirmModalOpen(false);
  };
  const handleModuleHiding = async (res: string) => {
    if (res !== "ok") {
      closeConfirmationModal();
    } else {
    }
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>,moduleId :number) => {
    console.log("Here: ", event.target.checked);

    if (!event.target.checked) {
      setIsConfirmModalOpen(true);
      // if(isConfirmModalOpen){
      //   setChecked(event.target.checked);
      // }
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
  }, []);

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

        {/* Map for each API response data object with below Stack tab. */}
        {/* <Stack direction="row" spacing={1} alignItems={"center"}>
          <Stack>
            <Switch checked={checked} onChange={handleChange} />
          </Stack>

          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "Modules.Dashboard",
              })}
            </Typography>
            <Typography variant="body2">
              A home page, summary of various modules, to give an overview of
              the portal.
            </Typography>
          </Stack>
        </Stack> */}

        {moduleInfo.map((module) => {
          return (
            <>
              <Stack direction="row" spacing={1} alignItems={"center"} key={module.moduleId}>
                <Stack>
                  <Switch checked={module.isAccessible} onChange={(e)=>handleChange(e,module.moduleId)} />
                </Stack>

                <Stack>
                  <Typography variant="body1">
                    {module.moduleName}
                  </Typography>
                </Stack>
              </Stack>
            </>
          );
        })}

        {/* <Stack direction="row" spacing={1} alignItems={"center"}>
          <Stack>
            <Switch />
          </Stack>

          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "Modules.Employees",
              })}
            </Typography>
            <Typography variant="body2">
              This module allows you to add employees and their detail in the
              company.
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} alignItems={"center"}>
          <Stack>
            <Switch />
          </Stack>

          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "Modules.PayRoll",
              })}
            </Typography>
            <Typography variant="body2">
              This module allows to manage leave application and attendance of
              the employee,
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} alignItems={"center"}>
          <Stack>
            <Switch />
          </Stack>

          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "Modules.Recruitment",
              })}
            </Typography>
            <Typography variant="body2">
              This module allows to add job vacancies, manage received
              application and check previous process logs.
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} alignItems={"center"}>
          <Stack>
            <Switch />
          </Stack>

          <Stack>
            <Typography variant="body1">
              {" "}
              {intl.formatMessage({
                id: "Modules.Admin",
              })}
            </Typography>
            <Typography variant="body2">
              Admin module is for assign role and permission based on positions.
              Set theme and company master.
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} alignItems={"center"}>
          <Stack>
            <Switch />
          </Stack>

          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "Modules.Holidays",
              })}
            </Typography>
            <Typography variant="body2">
              This module allows to add, update and view holiday list of the
              year.
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} alignItems={"center"}>
          <Stack>
            <Switch />
          </Stack>

          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({
                id: "Modules.NoticeBoard",
              })}
            </Typography>
            <Typography variant="body2">
              This module is used to post, edit and view notices.
            </Typography>
          </Stack>
        </Stack> */}
      </Stack>
      {isConfirmModalOpen && (
        <ConfirmationModal
          title={intl.formatMessage({ id: "TITLE.HIDE_MODULE" })}
          content={intl.formatMessage({ id: "CONFIRMATION.HIDE_MODULE" })}
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handleModuleHiding}
          ok_btn={true}
        />
      )}
    </>
  );
};
