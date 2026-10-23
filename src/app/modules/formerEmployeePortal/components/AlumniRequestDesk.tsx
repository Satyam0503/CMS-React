import {
  AddCircleOutlineRounded,
  CheckCircleOutlineRounded,
  CloseRounded,
  DownloadRounded,
  ErrorOutlineRounded,
  HourglassEmptyRounded,
  QuestionAnswerOutlined,
  ReceiptLongOutlined,
  SendRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

type RequestItem = {
  requestId: string;
  type: string;
  status: string;
  details: string;
  requestedAtUtc: string;
  evidenceId?: string;
  issuedAtUtc?: string;
};

type Props = {
  requests: RequestItem[];
  requestTypes: string[];
  requestOpen: boolean;
  busy: boolean;
  type: string;
  details: string;
  setType: (type: string) => void;
  setDetails: (details: string) => void;
  setRequestOpen: (open: boolean) => void;
  onSubmit: () => Promise<void>;
  onDownloadAttachment?: (evidenceId: string) => void;
};

const readable = (value: string) => value.replace(/([A-Z])/g, " $1").trim();

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "Just now";

const getStatusChip = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("complete") || s.includes("approved") || s.includes("resolved")) {
    return {
      color: "success" as const,
      icon: <CheckCircleOutlineRounded sx={{ fontSize: 16 }} />,
      label: readable(status),
    };
  }
  if (s.includes("reject") || s.includes("cancel")) {
    return {
      color: "error" as const,
      icon: <ErrorOutlineRounded sx={{ fontSize: 16 }} />,
      label: readable(status),
    };
  }
  return {
    color: "warning" as const,
    icon: <HourglassEmptyRounded sx={{ fontSize: 16 }} />,
    label: readable(status) || "Under Review",
  };
};

export const AlumniRequestDesk = ({
  requests,
  requestTypes,
  requestOpen,
  busy,
  type,
  details,
  setType,
  setDetails,
  setRequestOpen,
  onSubmit,
  onDownloadAttachment,
}: Props) => {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter === "all") return true;
      const s = r.status.toLowerCase();
      if (statusFilter === "pending") {
        return !s.includes("complete") && !s.includes("approved") && !s.includes("reject");
      }
      if (statusFilter === "completed") {
        return s.includes("complete") || s.includes("approved");
      }
      return true;
    });
  }, [requests, statusFilter]);

  return (
    <Stack spacing={3}>
      {/* Request Desk Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          gap={2}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <QuestionAnswerOutlined color="primary" />
              <Typography variant="h6" fontWeight={850}>
                Alumni Request Desk
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Track inquiries, raise document requests, and receive responses directly from the HR team.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineRounded />}
            onClick={() => setRequestOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 750,
              alignSelf: { xs: "stretch", sm: "flex-start", md: "center" },
              background: "linear-gradient(90deg, #0d9488, #0f766e)",
              color: "#ffffff !important",
              boxShadow: "0 4px 14px rgba(13, 148, 136, 0.28)",
              "&:hover": {
                background: "linear-gradient(90deg, #0f766e, #115e59)",
              },
            }}
          >
            Raise New Request
          </Button>
        </Stack>
      </Paper>

      {/* Tabs Filter */}
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Tabs
          value={statusFilter}
          onChange={(_, val) => setStatusFilter(val)}
          sx={{
            minHeight: 38,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.875rem",
              minHeight: 38,
              py: 0.5,
            },
          }}
        >
          <Tab value="all" label={`All Requests (${requests.length})`} />
          <Tab
            value="pending"
            label={`In Review (${requests.filter((r) => !r.status.toLowerCase().includes("complete") && !r.status.toLowerCase().includes("approved") && !r.status.toLowerCase().includes("reject")).length})`}
          />
          <Tab
            value="completed"
            label={`Resolved (${requests.filter((r) => r.status.toLowerCase().includes("complete") || r.status.toLowerCase().includes("approved")).length})`}
          />
        </Tabs>
      </Paper>

      {/* Request List */}
      {filteredRequests.length > 0 ? (
        <Stack spacing={2}>
          {filteredRequests.map((req) => {
            const chipData = getStatusChip(req.status);
            return (
              <Paper
                key={req.requestId}
                elevation={0}
                sx={{
                  p: { xs: 2.25, sm: 2.75 },
                  borderRadius: 3.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 6px 20px -4px rgba(15, 23, 42, 0.08)",
                  },
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  gap={1}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Typography variant="subtitle1" fontWeight={800}>
                      {readable(req.type)}
                    </Typography>
                    <Chip
                      size="small"
                      icon={chipData.icon}
                      label={chipData.label}
                      color={chipData.color}
                      sx={{ fontWeight: 700, height: 24 }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Submitted: {formatDate(req.requestedAtUtc)}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    my: 1.75,
                    p: 1.75,
                    borderRadius: 2.5,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.5 }}
                  >
                    {req.details}
                  </Typography>
                </Box>

                {req.evidenceId && onDownloadAttachment && (
                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadRounded />}
                      onClick={() => onDownloadAttachment(req.evidenceId!)}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      Download Resolution Document
                    </Button>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3.5,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <ReceiptLongOutlined sx={{ fontSize: 52, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" fontWeight={750}>
            No requests found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: "auto", mt: 0.5 }}>
            Need an experience letter, relieving certificate, tax slip or details correction? Submit a request and our HR operations team will assist you.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setRequestOpen(true)}
            sx={{
              mt: 2.5,
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(90deg, #0d9488, #0f766e)",
              color: "#ffffff !important",
            }}
          >
            Create Your First Request
          </Button>
        </Paper>
      )}

      {/* Raise Request Dialog Modal */}
      <Dialog
        open={requestOpen}
        onClose={() => !busy && setRequestOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            p: 1,
            bgcolor: "background.paper",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={850}>
              Raise an Alumni Request
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Submitted requests are assigned directly to the People Operations team.
            </Typography>
          </Box>
          <IconButton onClick={() => !busy && setRequestOpen(false)} size="small" disabled={busy}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5}>
            <TextField
              select
              fullWidth
              label="Request Category"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={busy}
              helperText="Select the category that best matches your query"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "action.hover",
                  "& fieldset": { borderColor: "divider", borderWidth: "1.5px" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "#0d9488", borderWidth: "2px" },
                },
              }}
            >
              {requestTypes.map((item) => (
                <MenuItem key={item} value={item}>
                  {readable(item)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              minRows={4}
              maxRows={8}
              label="Details & Reason for Request"
              placeholder="Please provide any specific dates, employee details, or context to help HR process your request faster..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              disabled={busy}
              inputProps={{ maxLength: 2000 }}
              helperText={`${details.length}/2000 characters`}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "action.hover",
                  "& fieldset": { borderColor: "divider", borderWidth: "1.5px" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "#0d9488", borderWidth: "2px" },
                },
              }}
            />

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Standard processing turnaround is 2–3 working days for letters and statements.
            </Alert>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setRequestOpen(false)}
                disabled={busy}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={busy || !details.trim()}
                onClick={() => void onSubmit()}
                startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <SendRounded />}
                sx={{
                  textTransform: "none",
                  fontWeight: 750,
                  background: "linear-gradient(90deg, #0d9488, #0f766e)",
                  color: "#ffffff !important",
                  boxShadow: "0 4px 14px rgba(13, 148, 136, 0.28)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #0f766e, #115e59)",
                  },
                }}
              >
                {busy ? "Submitting..." : "Submit Request"}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};
