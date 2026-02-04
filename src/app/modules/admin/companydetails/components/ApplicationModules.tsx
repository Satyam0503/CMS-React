import { Card, Stack, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { toast } from "react-toastify";
import { ConfirmationModal } from "../../../../shared/components/ConfirmationModal";
import { getAllModulesInfo, updateModuleAccess } from "../../adminservices";
import { ModulesInfoModel } from "../../models";
import Grid from "@mui/material/Grid";

import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks";
import { setCurrentUser } from "../../../../Redux/Reducers/userSlice";

import { modules_description } from "../../../../../utils/constant/Constant";
import {
  PayRollModuleTitles,
  RecruitmentModuleTitle,
} from "../../../../../utils/enums";

import ModuleCard from "./ModuleCard";

type ActionType = "SINGLE" | "PAYROLL" | "RECRUITMENT";

export const ApplicationModules: FC = () => {
  const { formatMessage } = useIntl();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userData)!;

  const [payrollModules, setPayrollModules] = useState<ModulesInfoModel[]>([]);
  const [recruitmentModules, setRecruitmentModules] = useState<
    ModulesInfoModel[]
  >([]);
  const [otherModules, setOtherModules] = useState<ModulesInfoModel[]>([]);

  const [refresh, setRefresh] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [actionType, setActionType] = useState<ActionType>("SINGLE");
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [option, setOPtion] = useState<boolean>(false);

  const closeConfirmationModal = () => {
    setIsConfirmModalOpen(false);
    setCurrentModuleId(null);
  };

  const updateModuleAccessApi = (moduleId: string) => {
    return updateModuleAccess(moduleId);
  };

  const updateSingleModule = async (moduleId: string) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);

      const response = await updateModuleAccessApi(moduleId);
      const { success, methodResult } = response.data;

      if (success) {
        dispatch(
          setCurrentUser({
            ...user,
            modulePermission: [...methodResult],
          }),
        );
        setRefresh((prev) => !prev);
      }
    } catch {
      toast.error(formatMessage({ id: "MESSAGE.MODULE.UPDATE.FAILED" }));
    } finally {
      setIsUpdating(false);
    }
  };

  const updateBulkModules = async (modules: ModulesInfoModel[]) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);

      await Promise.all(modules.map((m) => updateModuleAccessApi(m.moduleId)));

      setRefresh((prev) => !prev);
    } catch {
      toast.error(formatMessage({ id: "TOAST.FAILED.UPDATE" }));
    } finally {
      setIsUpdating(false);
    }
  };

  const requestAction = (
    type: ActionType,
    enabling: boolean,
    moduleId?: string,
  ) => {
    console.log(enabling);

    setActionType(type);
    setCurrentModuleId(moduleId ?? null);
    setIsConfirmModalOpen(true);
    setOPtion(enabling);
  };

  const handleConfirmation = async (res: string) => {
    if (res !== "ok") {
      closeConfirmationModal();
      return;
    }

    try {
      switch (actionType) {
        case "SINGLE":
          if (currentModuleId) {
            await updateSingleModule(currentModuleId);
          }
          break;

        case "PAYROLL":
          await updateBulkModules(payrollModules);
          break;

        case "RECRUITMENT":
          await updateBulkModules(recruitmentModules);
          break;
      }
    } finally {
      closeConfirmationModal();
    }
  };

  useEffect(() => {
    const getAllModules = async () => {
      try {
        const response = await getAllModulesInfo();
        const { success, methodResults } = response.data;

        if (!success) return;

        const payrollValues = Object.values(PayRollModuleTitles) as string[];
        const recruitmentValues = Object.values(
          RecruitmentModuleTitle,
        ) as string[];

        const payroll = methodResults.filter((m: ModulesInfoModel) =>
          payrollValues.includes(m.moduleConstant),
        );

        const recruitment = methodResults.filter((m: ModulesInfoModel) =>
          recruitmentValues.includes(m.moduleConstant),
        );

        const remaining = methodResults.filter(
          (m: ModulesInfoModel) =>
            !payrollValues.includes(m.moduleConstant) &&
            !recruitmentValues.includes(m.moduleConstant),
        );

        setPayrollModules(payroll);
        setRecruitmentModules(recruitment);
        setOtherModules(remaining);
      } catch (error) {
        console.error(error);
      }
    };

    getAllModules();
  }, [refresh]);

  return (
    <>
      <Card className="px-8 py-6 d-flex flex-column flex-grow-1 gap-8">
        <Stack>
          <Typography variant="h5" mb={1}>
            {formatMessage({
              id: "COMPANY_DETAILS.TABS.APPLICATIONS_MODULE",
            })}
          </Typography>
          <Typography variant="body2">
            {formatMessage({
              id: "COMPANY_DETAILS.APP_MODULE_NOTE",
            })}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {otherModules.map((module) => {
            const moduleDesc = modules_description.find(
              (m) =>
                m.name === module.moduleName ||
                m.name === module.moduleConstant,
            );

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={module.moduleId}>
                <ModuleCard
                  moduleId={module.moduleId}
                  moduleCostant={module.moduleConstant}
                  titleMessageId={`COMMON.${module.moduleConstant.toUpperCase()}`}
                  descriptionMessageId={
                    moduleDesc ? `COMMON.${moduleDesc.description}` : ""
                  }
                  modules={[module]}
                  formatMessage={formatMessage}
                  disabled={isUpdating}
                  handleChange={() =>
                    requestAction(
                      "SINGLE",
                      module.isAccessible ? false : true,
                      module.moduleId,
                    )
                  }
                />
              </Grid>
            );
          })}

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ModuleCard
              moduleId="PAYROLL"
              titleMessageId="COMMON.PAYROLL_MANAGEMENT"
              descriptionMessageId="COMMON.PAYROLL_MANAGEMENT_DESCRIPTION"
              modules={payrollModules}
              formatMessage={formatMessage}
              disabled={isUpdating}
              handleChange={() => {
                const isDisabling = payrollModules.some(
                  (module) => module.isAccessible === true,
                );
                requestAction("PAYROLL", isDisabling ? false : true);
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ModuleCard
              moduleId="RECRUITMENT"
              titleMessageId="COMMON.RECRUITMENT_MANAGEMENT"
              descriptionMessageId="COMMON.RECRUITMENT_MANAGEMENT_DESCRIPTION"
              modules={recruitmentModules}
              formatMessage={formatMessage}
              disabled={isUpdating}
              handleChange={() => {
                const isDisabling = recruitmentModules.some(
                  (module) => module.isAccessible === true,
                );
                requestAction("RECRUITMENT", isDisabling ? false : true);
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {isConfirmModalOpen && (
        <ConfirmationModal
          title={formatMessage({
            id: option
              ? "CONFIRMATION.TITLE.INSTALL_MODULE"
              : "CONFIRMATION.TITLE.HIDE_MODULE",
          })}
          content={formatMessage({
            id: option
              ? "CONFIRMATION.CONTENT.INSTALL_MODULE"
              : "CONFIRMATION.CONTENT.HIDE_MODULE",
          })}
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handleConfirmation}
          ok_btn
        />
      )}
    </>
  );
};
