import { PolicyVersion } from "../models";
import { Stack } from "@mui/system";
import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import { Close, DownloadOutlined } from "@mui/icons-material";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { WordDocViewer } from "../../../shared/components/WordDocViewer";
import { getPolicyDocument } from "../policyServices";
import { useIntl } from "react-intl";

import { AppIconButton } from "../../../shared/components/ui";
const PdfViewer = lazy(() =>
  import("../../../shared/components/PdfViewer").then((module) => ({
    default: module.PdfViewer,
  })),
);

type Props = {
  open: boolean;
  handleClose: () => void;
  policyVersion: PolicyVersion;
};

export default function PolicyVersionViewer(props: Props) {
  const { policyVersion, handleClose } = props;
  const { formatMessage: i } = useIntl();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const documentType = useMemo(() => {
    const url = policyVersion.policyDocUrl;
    if (!url) return null;
    const cleanUrl = url.split("?")[0];
    return cleanUrl.split(".").pop()?.toLowerCase() ?? null;
  }, [policyVersion.policyDocUrl]);

  const getMimeType = (ext: string | null): string => {
    switch (ext) {
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      default:
        return "";
    }
  };

  useEffect(() => {
    async function getDoc(policyVersionId: string) {
      try {
        const res = await getPolicyDocument(policyVersionId);
        const mimeType = getMimeType(documentType);
        const blob = new Blob([res.data as unknown as BlobPart], {
          type: mimeType,
        });
        const url = URL.createObjectURL(blob);
        setDocumentUrl(url);
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    }

    getDoc(policyVersion.id);

    return () => {
      if (documentUrl) URL.revokeObjectURL(documentUrl);
    };
  }, [policyVersion.id, documentType]);
  console.log(documentType);

  const renderDocument = () => {
    if (!documentUrl)
      return (
        <Typography>{i({ id: "POLICIES.LOADING_DOCUMENT" })}...</Typography>
      );

    if (!documentType)
      return (
        <Typography color="text.secondary">
          {i({ id: "POLICIES.UNKONOWN_FILE_TYPE" })}
        </Typography>
      );

    switch (documentType) {
      case "pdf":
        return (
          <Suspense
            fallback={
              <Typography>
                {i({ id: "POLICIES.LOADING_DOCUMENT" })}...
              </Typography>
            }
          >
            <PdfViewer pdfUrl={documentUrl} />
          </Suspense>
        );

      case "doc":
      case "docx":
        return (
          <WordDocViewer
            documents={[{ uri: documentUrl, fileType: documentType }]}
          />
        );

      default:
        return (
          <Typography color="text.secondary">
            {i({ id: "POLICIES.UNSUPPORTED_DOCUMENT_FORMAT" })}
          </Typography>
        );
    }
  };

  return (
    <Stack spacing={1.5} className="policy-document-viewer">
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box><Typography variant="h5" className="fs-16">{policyVersion.versionName}</Typography><Typography variant="body2" color="text.secondary">Current document preview. Scroll inside the document to read every page.</Typography></Box>

        <Stack direction="row" spacing={1}>
          {documentUrl && <Button component="a" href={documentUrl} download={`${policyVersion.versionName}.${documentType ?? "document"}`} size="small" startIcon={<DownloadOutlined />}>Download</Button>}
          <AppIconButton sx={{ border: 0 }} onClick={handleClose} aria-label="close-preview"><Close /></AppIconButton>
        </Stack>
      </Stack>

      <Box className="policy-document-frame">{renderDocument()}</Box>
    </Stack>
  );
}
