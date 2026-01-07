import { PolicyVersion } from "../models";
import { PdfViewer } from "../../../shared/components/PdfViewer";
import { Stack } from "@mui/system";
import { IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useMemo } from "react";
import { WordDocViewer } from "../../../shared/components/WordDocViewer";

type Props = {
  open: boolean;
  handleClose: () => void;
  policyVersion: PolicyVersion;
};

export default function PolicyVersionViewer(props: Props) {
  const { policyVersion, handleClose } = props;
  const documentType = useMemo(() => {
    const url = policyVersion.policyDocUrl;
    if (!url) return null;
    const cleanUrl = url.split("?")[0];
    return cleanUrl.split(".").pop()?.toLowerCase() ?? null;
  }, [policyVersion.policyDocUrl]);


  const renderDocument = () => {
    switch (documentType) {
      case "pdf":
        return <PdfViewer pdfUrl={policyVersion.policyDocUrl} />;

      case "doc":
      case "docx":
        return (
          <WordDocViewer
            documents={[{ uri: policyVersion.policyDocUrl, fileType: documentType }]}
          />
        );

      default:
        return (
          <Typography color="text.secondary">
            Unsupported document format
          </Typography>
        );
    }
  };

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h5" className="fs-16">
          {policyVersion.versionName}
        </Typography>

        <IconButton
          sx={{ border: 0 }}
          onClick={handleClose}
          aria-label="close-preview"
        >
          <Close />
        </IconButton>
      </Stack>

      {renderDocument()}
    </Stack>
  );
}
