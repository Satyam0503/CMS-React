import {
  CloseRounded,
  DownloadRounded,
  FullscreenExitRounded,
  FullscreenRounded,
  OpenInNewRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

type Props = {
  open: boolean;
  title: string;
  url: string | null;
  loading?: boolean;
  onClose: () => void;
  onDownload: () => void;
};

export const AlumniDocumentPreviewModal = ({
  open,
  title,
  url,
  loading = false,
  onClose,
  onDownload,
}: Props) => {
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={fullScreen ? false : "md"}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          height: fullScreen ? "100vh" : "82vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          py: 1.5,
          px: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, pr: 2 }}>
          <Typography variant="h6" fontWeight={750} noWrap sx={{ fontSize: { xs: "1rem", sm: "1.15rem" } }}>
            {title || "Document Preview"}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadRounded />}
            onClick={onDownload}
            sx={{ display: { xs: "none", sm: "inline-flex" }, textTransform: "none" }}
          >
            Download
          </Button>
          {url && (
            <IconButton
              size="small"
              onClick={() => window.open(url, "_blank")}
              title="Open in new tab"
              sx={{ color: "text.secondary" }}
            >
              <OpenInNewRounded fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => setFullScreen(!fullScreen)}
            title={fullScreen ? "Exit full screen" : "Full screen"}
            sx={{ display: { xs: "none", md: "inline-flex" }, color: "text.secondary" }}
          >
            {fullScreen ? <FullscreenExitRounded fontSize="small" /> : <FullscreenRounded fontSize="small" />}
          </IconButton>
          <IconButton size="small" onClick={onClose} title="Close" sx={{ color: "text.secondary" }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0, flex: 1, bgcolor: "action.hover", position: "relative" }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading document preview...
            </Typography>
          </Stack>
        ) : url ? (
          <Box
            component="iframe"
            src={url}
            title={title}
            sx={{
              width: "100%",
              height: "100%",
              border: 0,
              display: "block",
            }}
          />
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", p: 3, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              Unable to load document preview inline.
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadRounded />}
              onClick={onDownload}
              sx={{ mt: 2, textTransform: "none" }}
            >
              Download File
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};
