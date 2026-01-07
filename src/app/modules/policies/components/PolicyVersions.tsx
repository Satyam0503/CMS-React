import {
  Box,
  Button,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material";
import { Grid, Stack } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useIntl } from "react-intl";
import { usePageData } from "../../../Context/PageDataProvider";
import { Edit, Delete, MoreVertOutlined } from "@mui/icons-material";
import PolilcyVersionForm from "./PolilcyVersionForm";
import { PolicyVersion, PolicyVersionModel } from "../models";
import { deletePolicyVersion, getAllPolicyVersions } from "../policyServices";
import { getCustomStatusCodesErrorMessage, hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import PolicyVersionViewer from "./PolicyVersionViewer";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import { PolicySkeleton } from "./PolicySkeleton";
import clsx from "clsx";

const initialValues: PolicyVersionModel = {
  policyId: "",
  versionName: "",
  policyDoc: null,
  isCurrent: false,
};

export const PolicyVersions = () => {
  const param = useParams();
  const policyid = param.policyId;
  const { setPageTitle } = usePageData();
  const { formatMessage: i } = useIntl();
  const [isFormOpen, setFormOpen] = useState<boolean>(false);
  const [actionBtnAnchor, setActionBtnAnchor] = useState<null | HTMLElement>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [selectedPolicyVersion, setSelectedPolicyVersion] = useState<PolicyVersion | null>(null);
  const [viewPolicy, setViewPolicy] = useState<PolicyVersion | null>(null);
  const [policyVersions, setPolicyVersions] = useState<Array<PolicyVersion>>([]);
  const [formValue, setFormValue] = useState(initialValues);
  const [editing, setEditing] = useState<boolean>(false);
  const userModulesPermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const hasPolicyAddPermission = hasModuleFeaturePermission(
    ModulesName.Policy,
    Permission.Create,
    userModulesPermissions
  );

  const hasPolicyEditPermission = hasModuleFeaturePermission(
    ModulesName.Policy,
    Permission.Edit,
    userModulesPermissions
  );

  const hasPolicyDeletePermission = hasModuleFeaturePermission(
    ModulesName.Policy,
    Permission.Delete,
    userModulesPermissions
  );

  const handleActionButtonClick = (event: React.MouseEvent<HTMLElement>, policyVersion: PolicyVersion) => {
    setActionBtnAnchor(event.currentTarget);
    setSelectedPolicyVersion(policyVersion);
  };

  const handleActionMenuClose = () => {
    setActionBtnAnchor(null);
    setSelectedPolicyVersion(null);
  };

  function handleRefresh() {
    setRefresh(!refresh);
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
          toast.error(i({ id: getCustomStatusCodesErrorMessage(data.statusCode, "TOAST.FAILED.POLICY_VERSION_DELETE_FAILED") }));
        }
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
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
  }, [refresh]);

  useEffect(() => {
    setPageTitle(i({ id: "PAGE.POLICIES" }));
  }, []);

  return (
    <Card
      sx={{ height: "100%" }}
      className="gap-6 p-4 p-md-6 flex d-flex flex-column"
    >
      {
        hasPolicyAddPermission &&
        <Stack
          direction="row"
          className="align-items-center flex-wrap justify-content-end gap-4"
          sx={{ width: "100%" }}
        >
          <Button
            variant="contained"
            aria-label="add policy version"
            onClick={handleButtonClick}
            startIcon={<AddIcon />}
          >
            {i({ id: "POLICIES.ADD_POLICY" })}
          </Button>
        </Stack>
      }
      {
        isLoading ?
          <PolicySkeleton /> :
          viewPolicy ?
            <PolicyVersionViewer
              open={true}
              handleClose={handleCloseViewPolicy}
              policyVersion={viewPolicy}
            /> :
            <Grid container spacing={2}>
              {policyVersions.length > 0 ? (
                policyVersions.map((policyVersion) => {
                  return (
                    <Grid
                      key={policyVersion.id}
                      size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                      className={clsx("policy-file", { "current-active-policy": policyVersion.isCurrent })}
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
                        {policyVersion.versionName}
                      </Typography>
                      {
                        (hasPolicyDeletePermission || hasPolicyEditPermission) &&
                        <IconButton
                          id="policy-action-button"
                          onClick={(e) => {
                            handleActionButtonClick(e, policyVersion);
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertOutlined />
                        </IconButton>
                      }
                    </Grid>
                  );
                })
              ) : (
                <Box component="div" sx={{ width: 1, height: 100, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Typography variant="h6" className="fs-20">
                    {i({ id: "POLICIES.NO_POLICIES_FOUND" })}
                  </Typography>
                </Box>
              )}
            </Grid>
      }


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
                <ListItemButton
                  onClick={handlePolicyVersionEdit}
                >
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
      <PolilcyVersionForm
        open={isFormOpen}
        handleClose={handleFormClose}
        initialValues={formValue}
        isEdit={editing}
        handleRefresh={handleRefresh}
      />

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
}
