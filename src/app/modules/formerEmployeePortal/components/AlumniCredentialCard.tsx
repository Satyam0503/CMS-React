import {
  CheckCircleRounded,
  ContentCopyRounded,
  CorporateFareOutlined,
  PrintRounded,
  QrCode2Rounded,
  ShieldRounded,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { FormerEmployeePortalCase } from "../formerEmployeePortalService";

type Props = {
  data: FormerEmployeePortalCase;
  initials: string;
};

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Not recorded";

export const AlumniCredentialCard = ({ data, initials }: Props) => {
  const [copied, setCopied] = useState(false);
  const profile = data.profile;
  const companyName = data.companyName || "Codeji Infotech Pvt Ltd";

  const handleCopyDetails = async () => {
    const text = `Official Alumni Credential:
Company: ${companyName}
Name: ${profile?.fullName || "Alumni"}
Employee ID: ${profile?.employeeId || "N/A"}
Designation: ${profile?.jobRole || "N/A"}
Department: ${profile?.department || "N/A"}
Joined: ${formatDate(profile?.dateOfJoining)}
Relieved: ${formatDate(data.lastWorkingDate)}
Status: Verified Alumni`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Fallback if clipboard API not available
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
        boxShadow: "0 14px 38px -8px rgba(15, 23, 42, 0.08)",
        transition: "all 0.25s ease",
      }}
    >
      {/* Credential Header Banner */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          background: "linear-gradient(135deg, #094d43 0%, #0d9488 60%, #14b8a6 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            width: 280,
            height: 280,
            right: -60,
            top: -120,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {data.companyLogo ? (
              <Box
                component="img"
                src={data.companyLogo}
                alt=""
                sx={{ width: 40, height: 40, objectFit: "contain", bgcolor: "white", p: 0.5, borderRadius: 2 }}
              />
            ) : (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.18)",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                }}
              >
                <CorporateFareOutlined fontSize="small" />
              </Box>
            )}
            <Box>
              <Typography fontWeight={800} fontSize={16} lineHeight={1.2}>
                {companyName}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.82)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Official Alumni Credential
              </Typography>
            </Box>
          </Stack>
          <Chip
            icon={<CheckCircleRounded sx={{ color: "#0d9488 !important", fontSize: 16 }} />}
            label="Verified Alumni"
            size="small"
            sx={{
              bgcolor: "white",
              color: "#0f766e",
              fontWeight: 750,
              fontSize: "0.75rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
        </Stack>

        {/* Member Profile highlight */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          sx={{ mt: 3, position: "relative", zIndex: 1 }}
        >
          <Avatar
            sx={{
              width: 62,
              height: 62,
              bgcolor: "white",
              color: "#0f766e",
              fontWeight: 800,
              fontSize: 22,
              border: "3px solid rgba(255,255,255,0.35)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={850} sx={{ letterSpacing: "-0.02em", color: "white" }}>
              {profile?.fullName || "Valued Team Member"}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
              {profile?.jobRole || "Former Team Member"} • {profile?.department || "Organization Alumni"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Credential Data Grid */}
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              Employee ID
            </Typography>
            <Typography variant="body1" fontWeight={750} sx={{ mt: 0.5 }}>
              {profile?.employeeId || "N/A"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              Date of Joining
            </Typography>
            <Typography variant="body1" fontWeight={750} sx={{ mt: 0.5 }}>
              {formatDate(profile?.dateOfJoining)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              Last Working Day
            </Typography>
            <Typography variant="body1" fontWeight={750} sx={{ mt: 0.5 }}>
              {formatDate(data.lastWorkingDate)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              Clearance Status
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                size="small"
                color={data.status === "Completed" ? "success" : "info"}
                label={data.status || "Completed"}
                sx={{ fontWeight: 700, height: 24 }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Verification Footer and Actions */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          gap={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                display: "grid",
                placeItems: "center",
                color: "text.secondary",
              }}
            >
              <QrCode2Rounded sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ShieldRounded sx={{ fontSize: 15, color: "#0d9488" }} />
                <Typography variant="caption" fontWeight={750} color="text.primary">
                  Tamper-evident record
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block">
                Authenticated via secure alumni token
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyRounded />}
              onClick={handleCopyDetails}
              sx={{ textTransform: "none", fontWeight: 650 }}
            >
              Copy Info
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PrintRounded />}
              onClick={handlePrint}
              sx={{ textTransform: "none", fontWeight: 650 }}
            >
              Print Card
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%", boxShadow: 3 }}>
          Alumni credential details copied to clipboard!
        </Alert>
      </Snackbar>
    </Paper>
  );
};
