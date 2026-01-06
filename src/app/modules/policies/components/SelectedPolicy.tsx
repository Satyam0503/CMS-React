import {
  Button,
  Card,
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
import SelectedPoliciesListing from "./SelectedPoliciesListing";
import { Edit, Delete } from "@mui/icons-material";
import PolilcyVersionForm from "./PolilcyVersionForm";
import { PolicyResponseStructure, PolicyVersionStructure } from "../models";
import { deletePolicyVersion, getAllPolicyVersions } from "../policyServices";
import DocViewer from "react-doc-viewer";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission } from "../../../../utils/enums";
import { useAppSelector } from "../../../Redux/hooks";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import PolicyVersionViewer from "./PolicyVersionViewer";

const initialValues: PolicyVersionStructure = {
  policyId: "",
  versionName: "",
  policyDoc: null,
  isCurrent: false,
};

export default function SelectedPolicy() {
  const param = useParams();
  const policyid = param.policyId;

  const { setPageTitle } = usePageData();
  const { formatMessage: i } = useIntl();

  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const handleSearchChange = (value: string) => {
    setSearch(value.trim());
  };
  const [actionBtnAnchor, setActionBtnAnchor] = useState<null | HTMLElement>(
    null
  );
  const [refresh, setRefresh] = useState<boolean>(false);
  const [selectedPolicyVersion, setSelectedPolicyVersion] =
    useState<PolicyResponseStructure | null>(null);
  const [openSelectedPolicy, setOpenSelectedPolicy] = useState<boolean>(false);
  const [policyData, setPolicyData] = useState<Array<PolicyResponseStructure>>(
    []
  );
  const [formValue, setFormValue] = useState(initialValues);
  const [editing, setEditing] = useState<boolean>(false);
  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

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
    policy: PolicyResponseStructure
  ) => {
    setActionBtnAnchor(event.currentTarget);
    setSelectedPolicyVersion(policy);
    setFormValue({
      policyId: policyid,
      id: policy.id,
      versionName: policy.versionName,
      policyDoc: null,
      isCurrent: policy.isCurrent,
    });
  };

  const handleActionMenuClose = () => {
    setActionBtnAnchor(null);
    setSelectedPolicyVersion(null);
  };

  function handleSelectPolicyVersion(policy: PolicyResponseStructure) {
    setSelectedPolicyVersion(policy);
    setOpenSelectedPolicy(true);
  }

  function handleCloseSelectedPolicy() {
    setSelectedPolicyVersion(null);
    setOpenSelectedPolicy(false);
  }

  function handleRefresh() {
    setRefresh(!refresh);
  }

  useEffect(() => {
    setPageTitle(i({ id: "PAGE.POLICIES" }));
  }, []);

  function handleClose() {
    setOpen(false);
    setEditing(false);
  }

  function handleClick() {
    setOpen(true);
  }

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
    handleActionMenuClose();
  };

  const handleHolidayDeleteClick = () => {
    if (selectedPolicyVersion) {
      setDeleteModalOpen(true);
    }
  };

  function handleCloseDoc() {
    setOpenSelectedPolicy(false);
  }

  const handleDeletePolicyVersion = async () => {
    try {
      const { data } = await deletePolicyVersion(selectedPolicyVersion?.id!);
      if (data.success) {
        setSelectedPolicyVersion(null);
        handleRefresh();
        toast.success(i({ id: "TOAST.SUCCESS.POLICY_VERSION_DELETED" }));
        handleDeleteModalClose();
      } else {
        toast.error(i({ id: "TOAST.FAILED.POLICY_VERSION_DELETE_FAILED" }));
      }
    } catch (error) {
      console.error((error as Error).message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllPolicyVersions(policyid!);
        if (data) {
          setPolicyData(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    })();
  }, [refresh]);

  return (
    <>
      <Stack
        spacing={4}
        sx={{
          height: "100%",
        }}
      >
        <Card
          sx={{ height: "100%" }}
          className="gap-6 p-4 p-md-6 flex d-flex flex-column"
        >
          <Stack
            direction="row"
            className="align-items-center flex-wrap justify-content-end gap-4"
            sx={{ width: "100%" }}
          >
            <Button
              variant="contained"
              component="label"
              role="button"
              aria-label="import excel"
              onClick={handleClick}
            >
              <>
                <AddIcon />
                {i({ id: "POLICIES.ADD_POLICY" })}
              </>
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {policyData.length > 0 ? (
              policyData.map((policy) => {
                return (
                  <SelectedPoliciesListing
                    key={policy.id}
                    policyVersion={policy}
                    handleActionButtonClick={handleActionButtonClick}
                    handleClick={handleSelectPolicyVersion}
                  />
                );
              })
            ) : (
              <Typography variant="h5" fontWeight={600}>
                {i({ id: "POLICIES.NO_POLICIES_FOUND" })}
              </Typography>
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
                        setEditing(true);
                        setOpen(true);
                        setActionBtnAnchor(null);
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
          <PolilcyVersionForm
            open={open}
            handleClose={handleClose}
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
              handleConfirmation={() => handleDeletePolicyVersion()}
            />
          )}

          <PolicyVersionViewer
            openSelectedPolicy={openSelectedPolicy}
            handleClose={handleCloseDoc}
            selectedPolicyVersion={selectedPolicyVersion}
          />
        </Card>
      </Stack>
    </>
  );
}
