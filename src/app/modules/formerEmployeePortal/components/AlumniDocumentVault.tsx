import {
  DescriptionOutlined,
  DownloadRounded,
  FilterListRounded,
  FolderOpenRounded,
  LockOutlined,
  OpenInNewRounded,
  PictureAsPdfRounded,
  SearchRounded,
  VerifiedUserRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

type DocItem = {
  evidenceId: string;
  fileName?: string;
  contentType?: string;
};

type Props = {
  documents: DocItem[];
  onDocument: (id: string, name: string | undefined, preview: boolean) => Promise<void>;
  onRequestDocument: () => void;
};

const categorizeDoc = (name?: string) => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("reliev") || lower.includes("experience") || lower.includes("service") || lower.includes("letter")) {
    return "letters";
  }
  if (lower.includes("fnf") || lower.includes("settlement") || lower.includes("tax") || lower.includes("form 16") || lower.includes("payslip")) {
    return "payroll";
  }
  return "other";
};

export const AlumniDocumentVault = ({
  documents,
  onDocument,
  onRequestDocument,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("all");

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const name = doc.fileName || "";
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (tab === "all") return true;
      return categorizeDoc(name) === tab;
    });
  }, [documents, searchTerm, tab]);

  return (
    <Stack spacing={3}>
      {/* Top Banner and Quick Request */}
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
              <FolderOpenRounded color="primary" />
              <Typography variant="h6" fontWeight={850}>
                Alumni Document Vault
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Access, inspect, and safely download all official documents issued during and after your employment.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={onRequestDocument}
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
            + Request New Document
          </Button>
        </Stack>
      </Paper>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          gap={2}
        >
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            variant="scrollable"
            scrollButtons="auto"
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
            <Tab value="all" label={`All (${documents.length})`} />
            <Tab
              value="letters"
              label={`Letters & Certificates (${documents.filter((d) => categorizeDoc(d.fileName) === "letters").length})`}
            />
            <Tab
              value="payroll"
              label={`FnF & Tax (${documents.filter((d) => categorizeDoc(d.fileName) === "payroll").length})`}
            />
            <Tab
              value="other"
              label={`Other (${documents.filter((d) => categorizeDoc(d.fileName) === "other").length})`}
            />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search documents by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <SearchRounded fontSize="small" sx={{ color: "primary.main" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", sm: 280 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "action.hover",
                height: 40,
                fontSize: "0.875rem",
                "& fieldset": { borderColor: "divider" },
                "&:hover fieldset": { borderColor: "primary.main" },
                "&.Mui-focused fieldset": { borderColor: "#0d9488", borderWidth: "2px" },
              },
            }}
          />
        </Stack>
      </Paper>

      {/* Document Items Grid / List */}
      {filteredDocs.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2.25,
          }}
        >
          {filteredDocs.map((doc) => {
            const isPdf = (doc.fileName || "").toLowerCase().endsWith(".pdf");
            const category = categorizeDoc(doc.fileName);

            return (
              <Paper
                key={doc.evidenceId}
                elevation={0}
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.08)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Stack direction="row" spacing={1.75} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: isPdf ? "rgba(239, 68, 68, 0.08)" : "rgba(13, 148, 136, 0.08)",
                      color: isPdf ? "#dc2626" : "#0d9488",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isPdf ? <PictureAsPdfRounded /> : <DescriptionOutlined />}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={750}
                      sx={{
                        lineHeight: 1.3,
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      {doc.fileName || "Employment Document"}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
                      <Chip
                        size="small"
                        label={category === "letters" ? "Official Letter" : category === "payroll" ? "Financial Record" : "Archive"}
                        sx={{ fontSize: "0.7rem", height: 22, fontWeight: 700 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {doc.contentType || "PDF Document"}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="flex-end"
                  sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}
                >
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<OpenInNewRounded />}
                    onClick={() => onDocument(doc.evidenceId, doc.fileName, true)}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<DownloadRounded />}
                    onClick={() => onDocument(doc.evidenceId, doc.fileName, false)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      background: "linear-gradient(90deg, #0d9488, #0f766e)",
                      color: "#ffffff !important",
                      "&:hover": {
                        background: "linear-gradient(90deg, #0f766e, #115e59)",
                      },
                    }}
                  >
                    Download
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </Box>
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
          <FolderOpenRounded sx={{ fontSize: 52, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" fontWeight={750}>
            {searchTerm ? "No matching documents found" : "No documents available yet"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: "auto", mt: 0.5 }}>
            {searchTerm
              ? `No document matches "${searchTerm}". Try a different search keyword.`
              : "Documents approved and issued by your HR and payroll teams will appear here automatically."}
          </Typography>
          <Button
            variant="outlined"
            onClick={onRequestDocument}
            sx={{ mt: 2.5, textTransform: "none", fontWeight: 700 }}
          >
            Raise a Document Request
          </Button>
        </Paper>
      )}

      {/* Security notice banner */}
      <Alert
        severity="info"
        icon={<VerifiedUserRounded fontSize="inherit" />}
        sx={{ borderRadius: 3, "& .MuiAlert-message": { fontSize: "0.85rem" } }}
      >
        All generated documents are digitally sealed and cryptographically verified. If a prospective employer or agency requires verification, they can contact Codeji HR directly using the details in the Support tab.
      </Alert>
    </Stack>
  );
};
