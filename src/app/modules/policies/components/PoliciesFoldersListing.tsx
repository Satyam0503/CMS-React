import {
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

import { PolicyFolderStructure } from "../models";
import { deletePolicy, getAllPolicies } from "../policyServices";
import AddNewPolicyForm from "./AddNewPolicyForm";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { toast } from "react-toastify";

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

  const [policies, setPolicies] = useState<Array<PolicyFolderStructure>>([]);
  const [actionBtnAnchor, setActionBtnAnchor] = useState<null | HTMLElement>(
    null
  );
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPolicy, setSelectedPolicy] =
    useState<PolicyFolderStructure | null>();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

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

  const handleActionButtonClick = (
    event: React.MouseEvent<HTMLElement>,
    policy?: PolicyFolderStructure
  ) => {
    setActionBtnAnchor(event.currentTarget);
    setSelectedPolicy(policy);
  };

  const handleActionMenuClose = () => {
    setActionBtnAnchor(null);
    setSelectedPolicy(undefined);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    handleActionMenuClose();
  };

  const handleHolidayDeleteClick = () => {
    if (selectedPolicy) {
      setDeleteModalOpen(true);
    }
  };

  function handleFolderClick(id: string) {
    navigate(`/policies/${id}`);
  }

  function handleClose() {
    setOpen(false);
    setSelectedPolicy(null);
  }

  const handleDeletePolicy = async () => {
    try {
      const { data } = await deletePolicy(selectedPolicy?.policyId!);
      if (data.success) {
        setSelectedPolicy(null);
        props.handleRefresh();
        toast.success(i({ id: "TOAST.SUCCESS.POLICY_DELETED" }));
        handleDeleteModalClose();
      } else {
        toast.error(i({ id: "TOAST.FAILED.POLICY_DELETE_FAILED" }));
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllPolicies();
        if (data) {
          setPolicies(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    })();
  }, [props.refresh]);

  return (
    <Card sx={{ height: "100%" }} className="gap-4 p-4 p-md-6">
      <Grid container spacing={2}>
        {policies!.length > 0 || !hasPolicyAddPermission ? (
          policies!.map((policy) => {
            return (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                key={policy.policyId}
              >
                <Stack
                  className="policy-folder all-policies-folder"
                  onClick={() => {
                    handleFolderClick(policy.policyId!);
                  }}
                >
                  <FolderIcon sx={{ width: "auto", fontSize: "70px" }} />
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
                      sx={{
                        border: "none",
                        position: "absolute",
                        right: "20px",
                        top: "15px",
                      }}
                      id="policy-action-button"
                      onClick={(e) => {
                        handleActionButtonClick(e, policy);
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertOutlined />
                    </IconButton>
                  )}
                </Stack>
              </Grid>
            );
          })
        ) : (
          <Typography variant="h5">
            {i({ id: "POLICIES.NO_POLICIES_FOUND" })}
          </Typography>
        )}
        {hasPolicyAddPermission && (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Stack
              className="policy-folder all-policies-folder"
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
                  onClick={() => {
                    setActionBtnAnchor(null);
                    setOpen(true);
                  }}
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
      {selectedPolicy && (
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
