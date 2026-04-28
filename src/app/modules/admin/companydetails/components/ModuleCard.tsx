import React from "react";
import {
  Card,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { ModulesInfoModel } from "../../models";
import { DefaultModles } from "../../../../../utils/enums";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface ModuleCardProps {
  moduleId: string;
  titleMessageId: string;
  descriptionMessageId: string;
  modules: ModulesInfoModel[];
  moduleCostant?: string;
  disabled?: boolean;
  formatMessage: (message: { id: string }) => string;
  handleChange: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  titleMessageId,
  descriptionMessageId,
  modules,
  moduleCostant,
  disabled = false,
  handleChange,
  formatMessage,
}) => {
  const installedModule = modules.find((m) => m.isAccessible);
  const isInstalled = Boolean(installedModule);

  const isHardDisabled =
    moduleCostant === DefaultModles.Employees ||
    moduleCostant === DefaultModles.Calendar;

  const isDisabled = disabled || isHardDisabled;

  return (
    <Card elevation={0} className="module-card-styles">
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
                {formatMessage({ id: titleMessageId })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatMessage({ id: "COMMON.SYSTEM_EXTENSION" })}
              </Typography>
            </Stack>

            <Button
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
              }}
            >
              <span className="label">
                {isInstalled ? "Remove plugin" : "Install plugin"}
              </span>
            </Button>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
            {formatMessage({ id: descriptionMessageId })}
          </Typography>
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
                <IconButton
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
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Button
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
            </Button>
          )}
        </Stack> */}
      </Stack>
    </Card>
  );
};

export default ModuleCard;
