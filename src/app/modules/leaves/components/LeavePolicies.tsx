import AddRounded from "@mui/icons-material/AddRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ClearRounded from "@mui/icons-material/ClearRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import LinkOffRounded from "@mui/icons-material/LinkOffRounded";
import {
  Card,
  Stack,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import AddLeavePolicy from "./AddLeavePolicy";
import { LeavePolicyModel } from "../model";
import {
  getLeavePolicies,
  unlinkLifecyclePolicy,
  deleteLeavePolicy,
} from "../leaveServices";
import { EmployeeLeavePoliciesColumnList } from "../../../../utils/constant/Constant";
import { CustomisedTable } from "../../../shared/components/C_Table";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../../Redux/hooks";

const LeavePolicyModelInitials: LeavePolicyModel = {
  id: null,
  name: "",
  code: "",
  description: "",
  status: true,
  paid: true,
  accrualPeriod: 1,
  accrualAmount: 1,
  maxBalance: 12,
  carryOverAllowed: true,
  carryOverLimit: 0,
  minNoticeDays: 0,
  halfDayAllowed: true,
  weekendInclusive: false,
  holidayInclusive: false,
  attendanceStatusCode: "",
  applicableTo: [],
  policyType: 1,
  workFromHome: null,
  lifecycle: null,
};

function LeavePolicies() {
  const { formatMessage: i } = useIntl();
  const theme = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [leavePolicies, setLeavePolicies] = useState<Array<LeavePolicyModel>>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<LeavePolicyModel | null>(null);
  const [action, setAction] = useState<"delete" | "unlink" | null>(null);
  const [refresh, setRefresh] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"all" | "leave" | "wfh" | "unpaid" | "lifecycle">("all");

  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasWfhAccess = modulePermissions.some((p) => p.startsWith("Work_From_Home."));
  const [leavePoliciesValues, setLeavePoliciesValues] = useState<LeavePolicyModel>();

  useEffect(() => {
    const state = location.state as {
      createLifecycleLeave?: boolean;
    } | null;
    if (!state?.createLifecycleLeave) return;
    setIsEdit(false);
    setLeavePoliciesValues(LeavePolicyModelInitials);
    setIsOpen(true);
    window.history.replaceState({}, document.title);
  }, [location.state]);

  useEffect(() => {
    const eventType = (location.state as { lifecycleEventType?: string } | null)?.lifecycleEventType;
    if (!eventType) return;
    setIsEdit(false);
    setLeavePoliciesValues({
      ...LeavePolicyModelInitials,
      lifecycle: {
        enabled: true,
        eventType,
        requiresHrApproval: true,
        requiresReason: true,
        requiresDocument: true,
        requiresExpectedReturnDate: true,
      },
    });
    setIsOpen(true);
    window.history.replaceState({}, document.title);
  }, [location.state]);

  function handleClose() {
    setIsOpen(false);
    setIsEdit(false);
  }

  function handleRefresh() {
    setRefresh(!refresh);
  }

  const handleEdit = (row: LeavePolicyModel) => {
    setIsEdit(true);
    setLeavePoliciesValues(row);
    setIsOpen(true);
  };

  const confirmPolicyAction = async () => {
    if (!selectedPolicy) return;
    try {
      if (action === "unlink") {
        await unlinkLifecyclePolicy(selectedPolicy);
      }
      if (action === "delete" && selectedPolicy.id) {
        await deleteLeavePolicy(selectedPolicy.id);
      }
      setSelectedPolicy(null);
      setAction(null);
      handleRefresh();
    } catch (error) {
      console.error("Policy action failed ", error);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getLeavePolicies();
        if (data) {
          setLeavePolicies(data.methodResults);
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  // Accessible policies based on WFH module permission
  const accessiblePolicies = useMemo(() => {
    return hasWfhAccess ? leavePolicies : leavePolicies.filter((p) => p.policyType !== 2);
  }, [leavePolicies, hasWfhAccess]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: accessiblePolicies.length,
      leave: accessiblePolicies.filter((p) => p.policyType === 1 && !p.lifecycle?.enabled).length,
      wfh: accessiblePolicies.filter((p) => p.policyType === 2).length,
      unpaid: accessiblePolicies.filter((p) => p.policyType === 3).length,
      lifecycle: accessiblePolicies.filter((p) => Boolean(p.lifecycle?.enabled)).length,
    };
  }, [accessiblePolicies]);

  // Filtered policies list for the table
  const filteredPolicies = useMemo(() => {
    let list = accessiblePolicies;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (typeFilter === "leave") {
      list = list.filter((p) => p.policyType === 1 && !p.lifecycle?.enabled);
    } else if (typeFilter === "wfh") {
      list = list.filter((p) => p.policyType === 2);
    } else if (typeFilter === "unpaid") {
      list = list.filter((p) => p.policyType === 3);
    } else if (typeFilter === "lifecycle") {
      list = list.filter((p) => Boolean(p.lifecycle?.enabled));
    }

    return list;
  }, [accessiblePolicies, searchQuery, typeFilter]);

  return (
    <>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          p: { xs: 2, sm: 2.5 },
          gap: 2,
          borderRadius: "16px",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* Header toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {i({ id: "LEAVE.TITLES.LEAVE_POLICIES" })}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
              Configure leave entitlements, remote work parameters, and lifecycle rules
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRounded />}
            onClick={() => {
              setIsEdit(false);
              setLeavePoliciesValues(LeavePolicyModelInitials);
              setIsOpen(true);
            }}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              px: 2,
              py: 0.85,
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
              alignSelf: { xs: "stretch", sm: "auto" },
            }}
          >
            {i({ id: "LEAVE.TITLES.ADD_LEAVE_POLICIES" }) || "Add Policy"}
          </Button>
        </Box>

        {/* Filter Toolbar: Search & Type Chips */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
            pt: 0.5,
          }}
        >
          {/* Quick Category Filter Pills */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ alignItems: "center" }}>
            <Chip
              label={`All (${counts.all})`}
              clickable
              onClick={() => setTypeFilter("all")}
              color={typeFilter === "all" ? "primary" : "default"}
              variant={typeFilter === "all" ? "filled" : "outlined"}
              sx={{ fontWeight: 600, fontSize: "0.8rem", borderRadius: "8px" }}
            />
            <Chip
              label={`Standard Leave (${counts.leave})`}
              clickable
              onClick={() => setTypeFilter("leave")}
              color={typeFilter === "leave" ? "primary" : "default"}
              variant={typeFilter === "leave" ? "filled" : "outlined"}
              sx={{ fontWeight: 600, fontSize: "0.8rem", borderRadius: "8px" }}
            />
            {hasWfhAccess && (
              <Chip
                label={`Work From Home (${counts.wfh})`}
                clickable
                onClick={() => setTypeFilter("wfh")}
                color={typeFilter === "wfh" ? "secondary" : "default"}
                variant={typeFilter === "wfh" ? "filled" : "outlined"}
                sx={{ fontWeight: 600, fontSize: "0.8rem", borderRadius: "8px" }}
              />
            )}
            <Chip
              label={`Unpaid Leave (${counts.unpaid})`}
              clickable
              onClick={() => setTypeFilter("unpaid")}
              color={typeFilter === "unpaid" ? "warning" : "default"}
              variant={typeFilter === "unpaid" ? "filled" : "outlined"}
              sx={{ fontWeight: 600, fontSize: "0.8rem", borderRadius: "8px" }}
            />
            <Chip
              label={`Lifecycle (${counts.lifecycle})`}
              clickable
              onClick={() => setTypeFilter("lifecycle")}
              color={typeFilter === "lifecycle" ? "info" : "default"}
              variant={typeFilter === "lifecycle" ? "filled" : "outlined"}
              sx={{ fontWeight: 600, fontSize: "0.8rem", borderRadius: "8px" }}
            />
          </Stack>

          {/* Search Box */}
          <TextField
            size="small"
            placeholder="Search policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 260 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")} edge="end">
                    <ClearRounded sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        {/* Data Table */}
        <CustomisedTable
          key="LeavePoliciesId"
          rows={filteredPolicies}
          columns={EmployeeLeavePoliciesColumnList}
          page={0}
          rowsPerPage={10}
          loading={loading}
          handleEdit={handleEdit}
          openConfirmationModal={(row) => {
            setSelectedPolicy(row);
            setAction("delete");
          }}
          openUnlinkModal={(row) => {
            setSelectedPolicy(row);
            setAction("unlink");
          }}
        />
      </Card>

      {/* Leave Policy Form Modal */}
      {isOpen && (
        <AddLeavePolicy
          open={isOpen}
          handleClose={handleClose}
          initialValues={isEdit ? leavePoliciesValues : LeavePolicyModelInitials}
          isEdit={isEdit}
          handleRefresh={handleRefresh}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={Boolean(action && selectedPolicy)}
        onClose={() => {
          setAction(null);
          setSelectedPolicy(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
            maxWidth: 440,
            width: "100%",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: action === "unlink" ? alpha(theme.palette.info.main, 0.12) : alpha(theme.palette.error.main, 0.12),
              color: action === "unlink" ? "info.main" : "error.main",
            }}
          >
            {action === "unlink" ? <LinkOffRounded /> : <DeleteOutlineRounded />}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {action === "unlink" ? "Unlink Lifecycle Policy?" : "Delete Leave Policy?"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
            {action === "unlink"
              ? `The policy "${selectedPolicy?.name}" will remain available but will no longer create lifecycle cases upon approval.`
              : `Are you sure you want to delete "${selectedPolicy?.name}"? The policy will be deactivated. Existing requests and history will remain preserved.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setAction(null);
              setSelectedPolicy(null);
            }}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}
          >
            Cancel
          </Button>
          <Button
            color={action === "unlink" ? "info" : "error"}
            variant="contained"
            onClick={confirmPolicyAction}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", px: 2.5 }}
          >
            {action === "unlink" ? "Unlink Policy" : "Delete Policy"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default LeavePolicies;
