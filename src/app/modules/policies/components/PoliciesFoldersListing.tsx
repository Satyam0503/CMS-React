import {
  Box,
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
import { Delete, Edit, MoreVertOutlined } from "@mui/icons-material";
import FolderIcon from "@mui/icons-material/Folder";
import { useIntl } from "react-intl";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

import { PolicyModel } from "../models";
import { deletePolicy, getAllPolicies } from "../policyServices";
import AddNewPolicyForm from "./AddNewPolicyForm";
import { getCustomStatusCodesErrorMessage, hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { PolicySkeleton } from "./PolicySkeleton";

type Props = {
  addingPolicyFolder: boolean;
  handleCloseCreatePolicy: () => void;
  refresh: boolean;
  handleRefresh: () => void;
  handleClick: () => void;
};

export default function PoliciesFoldersListing(props: Props) {
  const { formatMessage: i } = useIntl();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<Array<PolicyModel>>([]);
  const [actionBtnAnchor, setActionBtnAnchor] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyModel | null>();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const userModulesPermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
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

  const handleActionButtonClick = (event: React.MouseEvent<HTMLElement>, policy?: PolicyModel) => {
    setActionBtnAnchor(event.currentTarget);
    setSelectedPolicy(policy);
  };

  const handleActionMenuClose = () => {
    setActionBtnAnchor(null);
    setSelectedPolicy(undefined);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setSelectedPolicy(null);
    handleActionMenuClose();
  };

  const handleHolidayDeleteClick = () => {
    if (selectedPolicy) {
      setDeleteModalOpen(true);
    }
  };

  function handleFolderClick(policyId: string) {
    navigate(`/companypolicy/policies/${policyId}`);
  }

  function handleClose() {
    setOpen(false);
    setSelectedPolicy(null);
  }

  const handleDeletePolicy = async () => {
    try {
      if (selectedPolicy && selectedPolicy.policyId) {
        const { data } = await deletePolicy(selectedPolicy.policyId);
        if (data.success) {
          handleDeleteModalClose();
          props.handleRefresh();
          toast.success(i({ id: "TOAST.SUCCESS.POLICY_DELETED" }));
        } else {
          toast.error(i({ id: getCustomStatusCodesErrorMessage(data.statusCode, "TOAST.FAILED.POLICY_DELETE_FAILED") }));
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error.message);
      }
    }
  };

  const handlePolicyEdit = () => {
    if (selectedPolicy) {
      setOpen(true);
      setActionBtnAnchor(null);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllPolicies();
        if (data.success) {
          setPolicies(data.methodResults);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error(error.message);
        }
      }
      finally {
        setLoading(false);
      }
    })();
  }, [props.refresh]);

  return (
    <Card sx={{ flexGrow: 1 }} className="gap-4 p-4 p-md-6">
      {
        isLoading ? <PolicySkeleton /> :
          <Grid container spacing={2}>
            {policies.length > 0 ? (
              policies.map((policy) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  key={policy.policyId}
                  sx={{ p: 1 }}
                  className="policy-folder"
                  onClick={() => {
                    handleFolderClick(policy.policyId!);
                  }}
                >
                  <FolderIcon sx={{ fontSize: "70px" }} />
                  <Typography
                    sx={{
                      textAlign: "center",
                    }}
                    variant="h6"
                  >
                    {policy.policyName}
                  </Typography>
                  {hasPolicyEditPermission && (
                    <IconButton
                      id="policy-action-button"
                      onClick={(e) => {
                        handleActionButtonClick(e, policy);
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertOutlined />
                    </IconButton>
                  )}
                </Grid>
              ))
            ) :
              !hasPolicyAddPermission ?
                (
                  <Box component="div" sx={{ width: 1, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography variant="h6">
                      {i({ id: "POLICIES.NO_POLICIES_FOUND" })}
                    </Typography>
                  </Box>
                ) : null
            }
            {hasPolicyAddPermission && (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Stack
                  className="policy-folder"
                  onClick={() => props.handleClick()}
                >
                  <AddIcon sx={{ width: "auto", fontSize: "70px" }} />
                  <Typography
                    sx={{
                      textAlign: "center",
                    }}
                    variant="h6"
                  >
                    {i({ id: "POLICIES.ADD_POLICY" })}
                  </Typography>
                </Stack>
              </Grid>
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
                boxShadow: 1,
              },
            },
          }}
        >
          <List disablePadding className="popover-list">
            {hasPolicyEditPermission && (
              <ListItem disablePadding divider>
                <ListItemButton onClick={handlePolicyEdit}>
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
                <ListItemButton onClick={handleHolidayDeleteClick}>
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
      {isDeleteModalOpen && (
        <ConfirmationModal
          title={i({ id: "CONFIRMATION.TITLE.DELETE_POLICY" })}
          content={i({ id: "CONFIRMATION.CONTENT.DELETE_POLICY" })}
          open={true}
          handleClose={handleDeleteModalClose}
          handleConfirmation={() => handleDeletePolicy()}
        />
      )}
      {selectedPolicy && open && (
        <AddNewPolicyForm
          open={open}
          handleClose={handleClose}
          initialValues={selectedPolicy}
          isEdit={true}
          handleRefresh={props.handleRefresh}
        />
      )}
    </Card>
  );
}
