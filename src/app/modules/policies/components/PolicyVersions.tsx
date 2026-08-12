import {
  Box,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material";
import { Grid, Stack } from "@mui/system";
import React, { Suspense, lazy, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useIntl } from "react-intl";
import { usePageData } from "../../../Context/PageDataProvider";
import { Edit, Delete, MoreVertOutlined, PublishedWithChanges } from "@mui/icons-material";
import { PolicyVersion, PolicyVersionModel } from "../models";
import { deletePolicyVersion, editPolicyVersion, getAllPolicyVersions, setCurrentPolicyVersion } from "../policyServices";
import {
  getCustomStatusCodesErrorMessage,
  hasModuleFeaturePermission,
} from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import { PolicySkeleton } from "./PolicySkeleton";
import clsx from "clsx";

import { AppButton, AppIconButton } from "../../../shared/components/ui";
const PolilcyVersionForm = lazy(() => import("./PolilcyVersionForm"));
const PolicyVersionViewer = lazy(() => import("./PolicyVersionViewer"));

const initialValues: PolicyVersionModel = {
  policyId: "",
  versionName: "",
  policyDoc: null,
  isCurrent: true,
};

export const PolicyVersions = () => {
  const param = useParams();
  const policyid = param.policyId;
  const { setPageTitle } = usePageData();
  const { formatMessage: i } = useIntl();
  const [isFormOpen, setFormOpen] = useState<boolean>(false);
  const [actionBtnAnchor, setActionBtnAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [refresh, setRefresh] = useState<boolean>(false);
  const [selectedPolicyVersion, setSelectedPolicyVersion] =
    useState<PolicyVersion | null>(null);
  const [viewPolicy, setViewPolicy] = useState<PolicyVersion | null>(null);
  const [policyVersions, setPolicyVersions] = useState<Array<PolicyVersion>>(
    [],
  );
  const [formValue, setFormValue] = useState(initialValues);
  const [editing, setEditing] = useState<boolean>(false);
  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const hasPolicyAddPermission = hasModuleFeaturePermission(
    ModulesName.Policy,
    Permission.Create,
    userModulesPermissions,
  );

  const hasPolicyEditPermission = hasModuleFeaturePermission(
    ModulesName.Policy,
    Permission.Edit,
    userModulesPermissions,
  );

  const hasPolicyDeletePermission = hasModuleFeaturePermission(
    ModulesName.Policy,
    Permission.Delete,
    userModulesPermissions,
  );

  const handleActionButtonClick = (
    event: React.MouseEvent<HTMLElement>,
    policyVersion: PolicyVersion,
  ) => {
    setActionBtnAnchor(event.currentTarget);
    setSelectedPolicyVersion(policyVersion);
  };

  const handleActionMenuClose = () => {
    setActionBtnAnchor(null);
    setSelectedPolicyVersion(null);
  };

  function handleRefresh() {
    setRefresh((current) => !current);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditing(false);
    setSelectedPolicyVersion(null);
    setFormValue(initialValues);
  }

  function handleButtonClick() {
    setFormOpen(true);
  }

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    handleActionMenuClose();
  };

  const handlePolicyVersionDeleteClick = () => {
    if (selectedPolicyVersion) {
      setDeleteModalOpen(true);
      setActionBtnAnchor(null);
    }
  };

  function handleViewPolicy(policyVersion: PolicyVersion) {
    setViewPolicy(policyVersion);
  }

  const handleMakeCurrent = async () => {
    if (!selectedPolicyVersion || !policyid || selectedPolicyVersion.isCurrent) return;
    try {
      const { data } = await setCurrentPolicyVersion(policyid, selectedPolicyVersion.id);
      if (data.success) {
        handleActionMenuClose();
        handleRefresh();
        toast.success("Policy version is now current.");
      } else {
        toast.error(i({ id: getCustomStatusCodesErrorMessage(data.statusCode, "Unable to change the current policy version.") }));
      }
    } catch (error) {
      console.error((error as Error).message);
      toast.error("Unable to change the current policy version. Please try again.");
    }
  };

  const handleMakeInactive = async () => {
    if (!selectedPolicyVersion || !policyid || !selectedPolicyVersion.isCurrent) return;
    const formData = new FormData();
    formData.append("id", selectedPolicyVersion.id);
    formData.append("policyId", policyid);
    formData.append("VersionName", selectedPolicyVersion.versionName);
    formData.append("IsCurrent", "false");

    try {
      const { data } = await editPolicyVersion(formData);
      if (data.success) {
        handleActionMenuClose();
        handleRefresh();
        toast.success("Policy version is now inactive.");
      } else {
        toast.error(i({ id: getCustomStatusCodesErrorMessage(data.statusCode, "Unable to make the policy version inactive.") }));
      }
    } catch (error) {
      console.error((error as Error).message);
      toast.error("Unable to make the policy version inactive. Please try again.");
    }
  };

  function handleCloseViewPolicy() {
    setViewPolicy(null);
  }

  function handlePolicyVersionEdit() {
    if (selectedPolicyVersion) {
      setEditing(true);
      setFormOpen(true);
      setActionBtnAnchor(null);
      setFormValue({
        policyId: policyid,
        id: selectedPolicyVersion.id,
        versionName: selectedPolicyVersion.versionName,
        policyDoc: null,
        isCurrent: selectedPolicyVersion.isCurrent,
      });
    }
  }

  const handleDeletePolicyVersion = async (res: string) => {
    try {
      if (selectedPolicyVersion && res === "ok") {
        const { data } = await deletePolicyVersion(selectedPolicyVersion.id);
        if (data.success) {
          handleDeleteModalClose();
          handleRefresh();
          toast.success(i({ id: "TOAST.SUCCESS.POLICY_VERSION_DELETED" }));
        } else {
          toast.error(
            i({
              id: getCustomStatusCodesErrorMessage(
                data.statusCode,
                "TOAST.FAILED.POLICY_VERSION_DELETE_FAILED",
              ),
            }),
          );
        }
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (policyid) {
          const { data } = await getAllPolicyVersions(policyid);
          if (data.success) {
            setPolicyVersions(data.methodResults);
          }
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh, policyid]);

  useEffect(() => {
    setPageTitle(i({ id: "PAGE.POLICIES" }));
  }, []);

  return (
    <Card
      sx={{ height: "auto", minHeight: 0 }}
      className="gap-6 p-4 p-md-6 flex d-flex flex-column"
    >
      {hasPolicyAddPermission && (
        <Stack
          direction="row"
          className="align-items-center flex-wrap justify-content-end gap-4"
          sx={{ width: "100%" }}
        >
          <AppButton
            variant="contained"
            aria-label="add policy version"
            onClick={handleButtonClick}
            startIcon={<AddIcon />}
          >
            {i({ id: "POLICIES.ADD_POLICY" })}
          </AppButton>
        </Stack>
      )}
      {isLoading ? (
        <PolicySkeleton />
      ) : viewPolicy ? (
        <Suspense fallback={<PolicySkeleton />}>
          <PolicyVersionViewer
            open={true}
            handleClose={handleCloseViewPolicy}
            policyVersion={viewPolicy}
          />
        </Suspense>
      ) : (
        <Grid container spacing={2}>
          {policyVersions.length > 0 ? (
            policyVersions.map((policyVersion) => {
              return (
                <Grid
                  key={policyVersion.id}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  className={clsx("policy-file", {
                    "current-active-policy": policyVersion.isCurrent,
                  })}
                  onClick={() => handleViewPolicy(policyVersion)}
                >
                  <PolicyRoundedIcon className="fs-44" />
                  <Typography
                    variant="body1"
                    sx={{
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    {policyVersion.isCurrent ? "Current / Published" : "Previous"}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    {policyVersion.versionName.length > 25
                      ? policyVersion.versionName.slice(0, 25) + "..."
                      : policyVersion.versionName}
                    {/* {policyVersion.versionName} */}
                  </Typography>
                  {(hasPolicyDeletePermission || hasPolicyEditPermission) && (
                    <AppIconButton
                      id="policy-action-button"
                      onClick={(e) => {
                        handleActionButtonClick(e, policyVersion);
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertOutlined />
                    </AppIconButton>
                  )}
                </Grid>
              );
            })
          ) : (
            <Box
              component="div"
              sx={{
                width: 1,
                height: 100,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" className="fs-20">
                {i({ id: "POLICIES.NO_POLICIES_FOUND" })}
              </Typography>
            </Box>
          )}
        </Grid>
      )}

      {Boolean(actionBtnAnchor) && (
        <Popover
          id="policy-action-menu"
          open={true}
          anchorEl={actionBtnAnchor}
          onClose={handleActionMenuClose}
          anchorOrigin={{
            horizontal: "right",
            vertical: "bottom",
          }}
          transformOrigin={{
            horizontal: "left",
            vertical: "top",
          }}
          slotProps={{
            paper: {
              sx: {
                boxShadow: 2,
              },
            },
          }}
        >
          <List disablePadding className="popover-list">
            {hasPolicyEditPermission && (
              <ListItem disablePadding divider>
                <ListItemButton onClick={handlePolicyVersionEdit}>
                  <ListItemText
                    primary={
                      <Typography>
                        <Edit className="fs-16 me-2" />
                        {i({ id: "BUTTON.EDIT" })}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            )}
            {hasPolicyEditPermission && !selectedPolicyVersion?.isCurrent && (
              <ListItem disablePadding divider>
                <ListItemButton onClick={handleMakeCurrent}>
                  <ListItemText primary={<Typography><PublishedWithChanges className="fs-16 me-2" />Make Current</Typography>} />
                </ListItemButton>
              </ListItem>
            )}
            {hasPolicyEditPermission && selectedPolicyVersion?.isCurrent && (
              <ListItem disablePadding divider>
                <ListItemButton onClick={handleMakeInactive}>
                  <ListItemText primary={<Typography><PublishedWithChanges className="fs-16 me-2" />Make Inactive</Typography>} />
                </ListItemButton>
              </ListItem>
            )}
            {hasPolicyDeletePermission && (
              <ListItem disablePadding>
                <ListItemButton onClick={handlePolicyVersionDeleteClick}>
                  <ListItemText
                    primary={
                      <Typography className="text-center">
                        <Delete color="error" className="fs-16 me-2" />
                        {i({ id: "BUTTON.DELETE" })}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Popover>
      )}
      {isFormOpen && (
        <Suspense fallback={null}>
          <PolilcyVersionForm
            open={isFormOpen}
            handleClose={handleFormClose}
            initialValues={formValue}
            isEdit={editing}
            handleRefresh={handleRefresh}
          />
        </Suspense>
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          title={i({ id: "CONFIRMATION.TITLE.DELETE_POLICY_VERSION" })}
          content={i({ id: "CONFIRMATION.CONTENT.DELETE_POLICY_VERSION" })}
          open={true}
          handleClose={handleDeleteModalClose}
          handleConfirmation={handleDeletePolicyVersion}
        />
      )}
    </Card>
  );
};
