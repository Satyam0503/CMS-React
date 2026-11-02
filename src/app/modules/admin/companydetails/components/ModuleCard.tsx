import React from "react";
import {
  alpha,
  Card,
  Stack,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ModulesInfoModel } from "../../models";
import { DefaultModles } from "../../../../../utils/enums";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { AppButton, AppIconButton } from "../../../../shared/components/ui";
interface ModuleCardProps {
  moduleId: string;
  titleMessageId: string;
  title?: string;
  descriptionMessageId?: string;
  modules: ModulesInfoModel[];
  moduleCostant?: string;
  disabled?: boolean;
  formatMessage: (message: { id: string }) => string;
  handleChange: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  moduleId,
  titleMessageId,
  title,
  descriptionMessageId,
  modules,
  moduleCostant,
  disabled = false,
  handleChange,
  formatMessage,
}) => {
  const normalizeConstant = (str?: string) => (str ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const installedModule = moduleId === "RECRUITMENT"
    ? modules.find((m) => normalizeConstant(m.moduleConstant) === "jobs" && m.isAccessible)
    : moduleId === "PAYROLL"
    ? modules.find((m) => normalizeConstant(m.moduleConstant) === "payroll" && m.isAccessible)
    : modules.find((m) => m.isAccessible);
  const isInstalled = Boolean(installedModule);

  const isHardDisabled =
    moduleCostant === DefaultModles.Employees ||
    moduleCostant === DefaultModles.Calendar ||
    moduleCostant === "Dashboard";

  const isDisabled = disabled || isHardDisabled;

  return (
    <Card
      elevation={0}
      className="module-card-styles"
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2.5,
        p: { xs: 2, sm: 2.25 },
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
      }}
    >
      <Stack
        spacing={2}
        sx={{ height: "100%", justifyContent: "space-between" }}
      >
        <Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={600}>
                {title ?? formatMessage({ id: titleMessageId })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatMessage({ id: "COMMON.SYSTEM_EXTENSION" })}
              </Typography>
            </Stack>

            <Tooltip title={isHardDisabled ? "This core module cannot be removed." : disabled ? "You do not have permission to change this module." : isInstalled ? formatMessage({ id: "COMPANY_DETAILS.REMOVE_PLUGIN" }) : formatMessage({ id: "COMPANY_DETAILS.INSTALL_PLUGIN" })}>
              <span>
                <AppButton
                  size="small"
                  onClick={handleChange}
                  disabled={isDisabled}
                  startIcon={isInstalled ? <DeleteOutlineIcon /> : <AddIcon />}
                  color={isInstalled ? "error" : "success"}
                  variant={isInstalled ? "outlined" : "contained"}
                  sx={{
                    minWidth: 36,
                    px: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    transition: "all 0.25s ease",
                    "& .MuiButton-startIcon": {
                      mr: isInstalled ? 0.4 : 0,
                      transition: "margin 0.25s ease",
                    },
                    "& .label": {
                      maxWidth: 0,
                      opacity: 0,
                      transition: "all 0.45s ease",
                    },
                    "&:hover .label": {
                      maxWidth: 120,
                      opacity: 1,
                      ml: 0.5,
                    },
                    "&:hover": {
                      px: 2,
                    },
                    "&.Mui-disabled": {
                      color: isInstalled ? "error.main" : "success.main",
                      borderColor: isInstalled ? "error.main" : "success.main",
                      backgroundColor: "transparent",
                      opacity: 0.7,
                    },
                    "&.Mui-disabled .MuiButton-startIcon": { color: "inherit" },
                  }}
                >
                  <span className="label">
                    {formatMessage({
                      id: isInstalled
                        ? "COMPANY_DETAILS.REMOVE_PLUGIN"
                        : "COMPANY_DETAILS.INSTALL_PLUGIN",
                    })}
                  </span>
                </AppButton>
              </span>
            </Tooltip>
          </Stack>
          {descriptionMessageId && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              {formatMessage({ id: descriptionMessageId })}
            </Typography>
          )}
        </Stack>
        {/* <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          mt="auto"
          pt={1.5}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {isInstalled ? (
            <Tooltip title={formatMessage({ id: "COMMON.UNINSTALL" })}>
              <span>
                <AppIconButton
                  size="small"
                  disabled={isDisabled}
                  onClick={handleChange}
                  sx={{
                    color: "error.main",
                    "&:hover": {
                      backgroundColor: "error.main",
                      color: "white",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </AppIconButton>
              </span>
            </Tooltip>
          ) : (
            <AppButton
              variant="contained"
              size="small"
              disabled={isDisabled}
              onClick={handleChange}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {formatMessage({ id: "COMMON.INSTALL" })}
            </AppButton>
          )}
        </Stack> */}
      </Stack>
    </Card>
  );
};

export default ModuleCard;
